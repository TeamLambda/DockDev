import rp from 'request-promise';
import * as machine from './machine.js';
import { coroutine as co } from 'bluebird';
import { exec as execProm, addPath } from '../utils/utils';
import {
  FAILED_TO_ACCESS_MACHINE,
  FAILED_TO_START_CONTAINER,
  FAILED_TO_STOP_CONTAINER,
  FAILED_TO_INSPECT_CONTAINER,
  FAILED_TO_LIST_CONTAINERS,
  FAILED_TO_CREATE_CONTAINER,
  FAILED_TO_RESTART_CONTAINER,
  FAILED_TO_REMOVE_CONTAINER,
  FAILED_TO_GET_IMAGES,
  FAILED_TO_CREATE_NETWORK,
  FAILED_TO_INSPECT_NETWORK,
  FAILED_TO_DELETE_NETWORK,
} from '../appLevel/errorMsgs';

// promisify callback function
const exec = (args, env) => execProm(`docker ${args}`, env);

/**
* @param {Object} commands that will be passed into the command line function below
*/
const commands = {
  // starts a container
  containerStart: {
    cmd: 'start',
    method: 'POST',
    uri(containerId) {
      return `/containers/${containerId}/${this.cmd}`;
    },
    error: FAILED_TO_START_CONTAINER,
  },
  // stops a container
  containerStop: {
    cmd: 'stop',
    method: 'POST',
    uri(containerId) {
      return `/containers/${containerId}/${this.cmd}`;
    },
    error: FAILED_TO_STOP_CONTAINER,
  },
  // inspects a container
  containerInspect: {
    cmd: 'json',
    method: 'GET',
    uri(containerId) {
      return `/containers/${containerId}/${this.cmd}`;
    },
    error: FAILED_TO_INSPECT_CONTAINER,
  },
  // creates a list of containers
  containerList: {
    cmd: 'json',
    method: 'GET',
    uri() {
      return `/containers/${this.cmd}`;
    },
    error: FAILED_TO_LIST_CONTAINERS,
  },
  // creates a container
  containerCreate: {
    cmd: 'create',
    method: 'POST',
    uri(obj) {
      return `/containers/${this.cmd}?name=${obj.name}`;
    },
    error: FAILED_TO_CREATE_CONTAINER,
  },
  // restarts a container
  containerRestart: {
    cmd: 'restart',
    method: 'POST',
    uri(containerId) {
      return `/containers/${containerId}/${this.cmd}`;
    },
    error: FAILED_TO_RESTART_CONTAINER,
  },
  // removes a container
  containerRemove: {
    cmd: '',
    method: 'DELETE',
    uri(containerId) {
      return `/containers/${containerId}?v=1&force=1`;
    },
    error: FAILED_TO_REMOVE_CONTAINER,
  },
  // returns the list of images already on the local computer
  imagesList: {
    cmd: 'json',
    method: 'GET',
    uri(imageName) {
      if (imageName) return `/images/${this.cmd}?filter=${imageName}`;
      return `/images/${this.cmd}?all`;
    },
    error: FAILED_TO_GET_IMAGES,
  },
  // creates a network for the containers
  networkCreate: {
    cmd: 'create',
    method: 'POST',
    uri() {
      return `/networks/${this.cmd}`;
    },
    error: FAILED_TO_CREATE_NETWORK,
  },
  // inspects a network
  networkInspect: {
    cmd: '',
    method: 'GET',
    uri(uuid) {
      return `/networks/${uuid}`;
    },
    error: FAILED_TO_INSPECT_NETWORK,
  },
  // delete a network
  networkDelete: {
    cmd: '',
    method: 'DELETE',
    uri(uuid) {
      return `/networks/${uuid}`;
    },
    error: FAILED_TO_DELETE_NETWORK,
  },
};

/**
 * dockerCommand() returns a function that takes 2 parameters
 * based on the passed in command object, which represents a task to perform in the command line
 *
 * @param {Object} cmd
 * @return {Function} returns a function that takes 2 parameters
 */
function dockerCommand(cmd) {
  return co(function *g(machineName, arg) {
    let error;
    try {
      const config = yield machine.machineConfig(machineName);
      config.uri += cmd.uri(arg);
      config.method = cmd.method;
      config.json = true;
      error = cmd.error;
      if (cmd.cmd === 'create') config.body = arg;
      return yield rp(config);
    } catch (e) {
      // if (e === FAILED_TO_ACCESS_MACHINE) throw FAILED_TO_ACCESS_MACHINE;
      throw e;
    }
  });
}

/**
 * each function below will take in two parameters and return a machine config object
 * which will have the information necessary to perform the commands on the Docker API
 *
 * @param {String} machineName
 * @param {String} containerInfo
 * @return {Object} returns a promise to supply the config object
 */
export const containerStart = dockerCommand(commands.containerStart);
export const containerStop = dockerCommand(commands.containerStop);
export const containerList = dockerCommand(commands.containerList);
export const containerInspect = dockerCommand(commands.containerInspect);
export const containerCreate = dockerCommand(commands.containerCreate);
export const containerRestart = dockerCommand(commands.containerRestart);
export const containerRemove = dockerCommand(commands.containerRemove);
export const imagesList = dockerCommand(commands.imagesList);
export const networkCreate = dockerCommand(commands.networkCreate);
export const networkDelete = dockerCommand(commands.networkDelete);
export const networkInspect = dockerCommand(commands.networkInspect);

/**
 * pullImage() returns a promise to execute a docker command, 'pull' which will pull
 * an image from the registry/host
 *
 * @param {String} machineName
 * @param {String} image
 * @return {} returns a promise to pull the image or reject if there is an error
 */
export const pullImage = co(function *g(machineName, image) {
  const env = addPath(yield machine.env(machineName));
  return yield exec(`pull ${image}`, { env });
});

// pullImage('dockdev-example', 'mongo')
//   .then(console.log)
//   .catch(console.log);

/**
 * logs() returns a promise to execute docker logs on the command line
 * based on the passed in machine name and container id
 *
 * @param {String} machineName
 * @param {String} containreId
 * @return {} returns a promise to execute docker logs
 */
export const containerLogs = co(function *g(machineName, containerId) {
  const env = addPath(yield machine.env(machineName));
  return yield exec(`logs ${containerId}`, { env });
});
