import { join } from 'path';
import { coroutine as co } from 'bluebird';
import R from 'ramda';
import uuid from 'node-uuid';
import * as utils from './utils';
import * as appConfig from './appConfig';
import { setNetworkParams, networkCreate } from './container';
import defaultConfig from './defaultConfig';
import * as machine from './machine';

/**
 * createProj() returns an object with project-level information, including a uuid
 * based on the passed in basePath and projectName
 *
 * @param {String} basePath
 * @param {String} projectName
 * @return {Object} projObj
 */
export const createProj = (basePath, projectName) => ({
  uuid: uuid.v4(),
  projectName,
  basePath,
  containers: {},
  machine: defaultConfig.machine,
  remoteMachine: '',
});

/**
 * createDockDev() returns a promise to create a folder for the project information
 * based on the passed in project object which has the path to create the folder
 *
 * @param {Object} projObj
 * @return {} creates a folder
 */
export const createDockDev = (projObj) => {
  return utils.mkdir(join(projObj.basePath, defaultConfig.projFolder));
};
/**
 * cleanProjToWrite() returns a formatted object with information to be stored in the project file
 * based on composing R.pick (which parameters to write) and indent formatting (jsonStringifyPretty)
 *
 * @param {Object} projObj
 * @return {Object} 'clean' projObj
 */
const cleanProjToWrite = R.compose(
  utils.jsonStringifyPretty,
  R.pick(defaultConfig.projWriteParams)
);

/**
 * writeProj() returns a promise to write the dockdev.josn file with the project information
 * based on passing in the project object
 *  should be used with readProj for existing projects
 *
 * @param {Object} projObj
 * @return {} writes (or overwrites) the project file (dockdev.json)
 */
export const writeProj = (projObj) =>
  utils.writeFile(join(projObj.basePath, defaultConfig.projPath()), cleanProjToWrite(projObj));

/**
 * initProject() creates the project object, then yields a promise to create the project folder
 * then yields a promise to write the project file, then it adds the project object to memory
 * and it creates the network for the project before finally returning the project object
 * based on initially passing in the basePath, projectName, and overwrite
 *
 * @param {String} basePath
 * @param {String} projectName
 * @param {Boolean} overwrite
 * @return {Object} projObj
 */
export const initProject = co(function *g(basePath, projectName) {
  const projObj = createProj(basePath, projectName);

    try {
      yield createDockDev(projObj);
    } catch (e) {
      console.log(e);
    }

  yield writeProj(projObj);
  projObj.basePath = basePath;

  yield appConfig.addProjToConfig(basePath, defaultConfig);

  yield networkCreate(defaultConfig.machine, setNetworkParams(projObj.uuid));

  return projObj;
});
