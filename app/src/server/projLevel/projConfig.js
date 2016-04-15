import { join } from 'path';
import { coroutine as co } from 'bluebird';
import * as utils from '../utils/utils';
import * as appConfig from '../appLevel/appConfig';
import defaultConfig from '../appLevel/defaultConfig';
import errorHandler from '../appLevel/errorHandler';
import { createProjectNetwork, deleteProjectNetwork } from './containerMgmt';
import {
  FAILED_TO_CREATE_PROJ_DOCKDEV_DIR,
  FAILED_PROJECT_WRITE,
  PROJECT_DIR_USED,
  PROJECT_NAME_EXISTS,
  FAILED_TO_READ_PROJECT,
  EEXIST,
} from '../appLevel/errorMsgs';

/**
 * createProj() returns an object with project-level information, including a uuid
 * based on the passed in basePath and projectName
 *
 * @param {String} basePath
 * @param {String} projectName
 * @return {Object} projObj
 */
export const createProj = (basePath, projectName) => ({
  projectName,
  cleanName: utils.cleanName(projectName),
  basePath,
  containers: [],
  machine: defaultConfig.machine,
  remote: {},
});

/**
 * createDockDev() returns a promise to create a folder for the project information
 * based on the passed in project object which has the path to create the folder
 *
 * @param {Object} projObj
 * @return {} creates a folder
 */
export const createDockDev = (projObj) =>
  utils.mkdir(join(projObj.basePath, defaultConfig.projFolder))
    .then(() => true)
    .catch(err => {
      if (err.code !== EEXIST) throw FAILED_TO_CREATE_PROJ_DOCKDEV_DIR;
      return false;
    });

/**
 * writeProj() returns a promise to write the dockdev.josn file with the project information
 * based on passing in the project object
 *  should be used with readProj for existing projects
 *
 * @param {Object} projObj
 * @return {} writes (or overwrites) the project file (dockdev.json)
 */
export const writeProj = (projObj) =>
  utils.writeFile(
    join(projObj.basePath, defaultConfig.projPath()),
    utils.jsonStringifyPretty(projObj))
      .then(() => true)
      .catch(() => {throw FAILED_PROJECT_WRITE;});

/**
 * removeBadProject() removes a failed load project from the app config file
 *
 * @param {String} path
 * @param {Object} defaultConfig
 * @return {Promise}
 */
export const removeBadProject = co(function *g(path) {
  const configPath = defaultConfig.configPath();
  const readConfigFile = yield appConfig.readConfig(configPath);
  readConfigFile.projects =
   readConfigFile.projects.filter(obj => obj.basePath !== path);
  yield appConfig.writeConfig(readConfigFile);
  return true;
});

/**
 * loadProject() will read the project configuration from the specified path
 *
 * @param {String} path
 * @param {Object} defaultConfig
 * @return {Promise}
 */
export const loadProject = (path) =>
  utils.readFile(join(path, defaultConfig.projPath()))
    .then(JSON.parse)
    .catch(() => {
      removeBadProject(path); // the sequence here may need to be reconsidered
      throw FAILED_TO_READ_PROJECT;
    });

/**
 * findContainer() will return the index of the container with the specified name or -1
 *
 * @param {Array} containerArray
 * @param {String} name
 * @return {Number}
 */
export const findContainer = (containerArray, name) => {
  let result = -1;
  for (let i = 0; i < containerArray.length; i++) {
    if (containerArray[i].name === name) {
      result = i;
      break;
    }
  }
  return result;
};

/**
 * writeContainer() adds the specified container to the dockdev.json file for the project
 *
 * @param {Object} container
 * @param {String} path
 * @return {} writes (or overwrites) the project file (dockdev.json)
 */
export const writeContainer = co(function *g(container, path, action) {
  const projObj = yield loadProject(path);

  if (action === 'add') {
    projObj.containers.push(container);
  } else {
    const idx = findContainer(projObj.containers, container.name);
    if (action === 'update') {
      projObj.containers[idx] = container;
    }
    if (action === 'delete') {
      projObj.containers = [
        ...projObj.containers.slice(0, idx),
        ...projObj.containers.slice(idx + 1),
      ];
    }
  }

  return yield writeProj(projObj);
});

/**
 * writeRemote() adds the specified container to the dockdev.json file for the project
 *
 * @param {Object} remoteObj
 * @param {String} path
 * @return {} writes (or overwrites) the project file (dockdev.json)
 */
export const writeRemote = co(function *g(remoteObj, path) {
  const projObj = yield loadProject(path);
  projObj.remote = remoteObj;
  return yield writeProj(projObj);
});

/**
 * checkUniqueName() returns true if the selected project name exists
 *
 * @param {String} projectName
 * @param {Array} projArray
 * @return {Boolean}
 */
const checkUniqueName = (projectName, projArray) => {
  for (let i = 0; i < projArray.length; i++) {
    if (projArray[i].projectName === projectName) return true;
  }
  return false;
};

/**
 * checkNewPath() returns true if the selected path is already a project
 *
 * @param {String} basePath
 * @param {Array} projArray
 * @return {Boolean}
 */
const checkNewPath = (basePath, projArray) => {
  for (let i = 0; i < projArray.length; i++) {
    if (projArray[i].basePath === basePath) return true;
  }
  return false;
};

/**
 * addProjToConfig() will add a project's path to the main config file
 * based on the passed in project base path and the default config object
 *
 * @param {String} basePath
 * @param {Object} defaultConfig
 * @return {}
 */
export const addProjToConfig = co(function *g(projObj) {
  const configPath = defaultConfig.configPath();
  const readConfigFile = yield appConfig.readConfig(configPath);
  if (checkUniqueName(projObj.cleanName, readConfigFile.projects)) throw PROJECT_NAME_EXISTS;
  if (checkNewPath(projObj.basePath, readConfigFile.projects)) throw PROJECT_DIR_USED;
  readConfigFile.projects.push({
    basePath: projObj.basePath,
    projectName: projObj.projectName,
    cleanName: projObj.cleanName,
  });
  yield appConfig.writeConfig(readConfigFile);
});

/**
 * removeProjFromConfig() will delete a project's path to the main config file
 * based on the passed in project base path and the default config object
 *
 * @param {String} basePath
 * @param {Object} defaultConfig
 * @return {}
 */
export const removeProjFromConfig = co(function *g(projObj) {
  const configPath = defaultConfig.configPath();
  const readConfigFile = yield appConfig.readConfig(configPath);
  readConfigFile.projects =
    readConfigFile.projects.filter(obj => obj.basePath !== projObj.basePath);
  yield appConfig.writeConfig(readConfigFile);
  return true;
});

/**
 * undoInitProject() reverses any transactions from a failed project creation
 *
 * @param {Object} projObj
 * @return {} if reversal is successful it will return true, else throw specific error
 */
export const undoInitProject = co(function *g(projObj) {
  yield removeProjFromConfig(projObj);
  yield utils.rimrafProm(join(projObj.basePath, defaultConfig.projFolder));
  yield deleteProjectNetwork(projObj, true);
  return true;
});

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
  let projObj;
  try {
    // create initial project object
    projObj = createProj(basePath, projectName);
    // addProjToConfig confirms that the project name & path are unique
    yield addProjToConfig(projObj);
    // create .dockdev folder in selected project folder
    yield createDockDev(projObj);
    // write the project object into the dockdev.json file
    yield writeProj(projObj);
    // setup the docker network for the project
    yield createProjectNetwork(projObj);

    return projObj;
  } catch (e) {
    // send error to error logging
    errorHandler('initProject', e, [basePath, projectName]);
    // undo any part of the initProject function if unique (dont' remove existing)
    if (e !== PROJECT_DIR_USED && e !== PROJECT_NAME_EXISTS) {
      yield undoInitProject(projObj);
    }
    throw e;
  }
});
