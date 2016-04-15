import { coroutine as co } from 'bluebird';
import defaultConfig from '../appLevel/defaultConfig';
import { writeContainer } from './projConfig';
import {
  containerRemove,
  imagesList,
  containerCreate,
  pullImage,
  networkCreate,
  networkDelete,
} from '../dockerAPI/docker';

/**
 * setServerParams() returns an object with the image, project path, network mode, and working dir
 * based on the passed in image and project uuid
 *
 * @param {String} image
 * @param {String} uuid
 * @return {Object} returns an object with the image, project path, network mode, and working dir
 */
export const setServerParams = (image, cleanName) => ({
  image,
  name: `${cleanName}_${image}`,
  HostConfig: {
    Binds: [`${defaultConfig.dest}:${defaultConfig.workDir}:ro`],
    NetworkMode: cleanName,
    PortBindings: { [`${defaultConfig.port}/tcp`]: [{ HostPort: `${defaultConfig.port}` }] },
  },
  WorkingDir: defaultConfig.workDir,
  Cmd: defaultConfig.serverCmd,
  ExposedPorts: {
    [`${defaultConfig.port}/tcp`]: {},
  },
});

/**
 * setDbParams() returns an object with the networkMode
 * based on the passed in image and project uuid
 *
 * @param {String} image
 * @param {String} uuid
 * @return {Object} returns an object with the networkMode
 */
export const setDbParams = (image, cleanName) => ({
  image,
  name: `${cleanName}_${image}`,
  HostConfig: {
    NetworkMode: cleanName,
  },
});

/**
 * getContainerConfig() returns the container config object controlling for server or db
 *
 * @param {Object} imageObj
 * @return {Object} returns the docker configuration object to create a container
 */
const getContainerConfig = (container) => (
  container.server ?
    setServerParams(container.image, container.cleanName) :
    setDbParams(container.image, container.cleanName)
);

/**
 * setNetworkParams() returns an object with the project uuid
 * based on the passed in project uuid
 *
 * @param {String} uuid
 * @return {Object} returns an object with the uuid
 */
export const setNetworkParams = (cleanName) => ({
  name: cleanName,
});

/**
 * createProjectNetwork() creates a new network for the project
 *
 * @param {Object} projObj
 * @return {Promise} returns true or throws an error if unable to create the network
 */
export const createProjectNetwork = (projObj) =>
  networkCreate(defaultConfig.machine, setNetworkParams(projObj.cleanName))
    .then(() => true);

/**
 * createRemoteNetwork() creates a new network for the project
 *
 * @param {Object} projObj
 * @return {Promise} returns true or throws an error if unable to create the network
 */
export const createRemoteNetwork = (remoteObj) =>
  networkCreate(remoteObj.machine, setNetworkParams(remoteObj.cleanName))
    .then(() => true);

/**
 * deleteProjectNetwork() creates a new network for the project
 *
 * @param {Object} projObj
 * @return {Promise} returns true or throws an error if unable to delete the network
 */
export const deleteProjectNetwork = (projObj, ignoreErrors) =>
  networkDelete(defaultConfig.machine, projObj.cleanName)
    .then(() => true)
    .catch(err => {
      if (!ignoreErrors) throw err;
    });

/**
 * containerObj() returns the base container object based on the project and image
 *
 * @param {String} cleanName
 * @param {Object} imageObj
 * @return {Object} returns a baseline container object
 */
export const containerObj = (cleanName, imageObj) => ({
  cleanName,
  image: imageObj.name,
  dockerId: '',
  name: `${cleanName}_${imageObj.name}`,
  dest: (imageObj.server ? defaultConfig.dest : ''),
  server: imageObj.server,
  status: 'pending',
  machine: defaultConfig.machine,
});

/**
 * createContainer() creates creates a container for the specified project
 *
 * @param {Object} projObj
 * @param {Object} imageObj
 * @return {Object} returns a container object that is held in store and written to disk
 */
export const createContainer = co(function *g(projObj, imageObj) {
  const container = containerObj(projObj.cleanName, imageObj);

  // if the image is not available on the local machine then tell UI pull it
  if (!(yield imagesList(defaultConfig.machine, imageObj.name)).length) {
    container.status = 'pending';
  } else {
    // create the container & update the object with the docker generated id
    const dockCont = yield containerCreate(defaultConfig.machine, getContainerConfig(container));
    container.dockerId = dockCont.Id;
    container.status = 'complete';
  }

  // write changes to project file
  yield writeContainer(container, projObj.basePath, 'add');
  return container;
});

/**
 * pullImageForProject() pulls the specified docker image for when selected for a project
 *
 * @param {Object} container
 * @param {String} path
 * @return {Object} returns a container object with status updated to (i) complete or (ii) error
 */
export const pullImageForProject = co(function *g(container, path) {
  let newContainer;
  try {
    yield pullImage(container.machine, container.image);
    const dockCont = yield containerCreate(defaultConfig.machine, getContainerConfig(container));
    newContainer = { ...container, status: 'complete', dockerId: dockCont.Id };
  } catch (e) {
    newContainer = { ...container, status: 'error' };
  }

  yield writeContainer(newContainer, path, 'update');
  return newContainer;
});

/**
 * deleteProjectContainer() removes the specified container and deletes from project file
 *
 * @param {Object} containerName
 * @param {String} path
 * @return {Object} returns true or throws an error
 */
export const deleteProjectContainer = co(function *g(container, path) {
  if (container.status === 'complete') {
    yield containerRemove(container.machine, container.dockerId);
  }
  yield writeContainer(container, path, 'delete');
  return true;
});
