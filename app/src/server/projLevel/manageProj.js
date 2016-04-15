import * as container from '../dockerAPI/docker';
import fileWatch from '../projLevel/fileWatch';
import { coroutine as co } from 'bluebird';
import { removeMachineFolder, createMachineFolder } from '../dockerAPI/machine';
import errorHandler from '../appLevel/errorHandler';

/**
* checkStatus() accepts a machine name and container id and returns the status
* -2 === couln't access docker-machine
* -1 === container does not exists
*  0 === container is stopped
*  1 === container is Running
*
* @param {String} machineName
* @param {String} containerId
* @return {Number}
*/

const checkStatus = co(function *g(machineName, containerId, errorCallback) {
  try {
    const inspectResults = yield container.inspect(machineName, containerId);
    return inspectResults.State.Running ? 1 : 0;
  } catch (e) {
    const error = yield errorHandler('checkStatus', e, arguments, errorCallback);
    if (error.code === 404) return -1;
    return -2;
  }
});

function getServer(projObj) {
  for (const cont in projObj.containers) {
    if (projObj.containers[cont].server) return cont;
  }
  return undefined;
}

export const stopProject = co(function *g(projObj, errorCallback) {
  const containersArray = Object.keys(projObj.containers);

  for (let i = 0; i < containersArray.length; i++) {
    const containerId = containersArray[i];
    const containerStatus = yield checkStatus(projObj.machine, containerId, errorCallback);
    switch (containerStatus) {
      case -2: {
        const error = {
          statusCode: 'FATAL',
          message: 'Failed to access docker-machine (dockdev)',
        };
        throw error;
      }
      case -1: {
        delete projObj.containers[containerId];
        errorCallback({ stateAction: 'delContainer', uuid: projObj.uuid, containerId });
        break;
      }
      case 1: {
        try {
          container.stop(projObj.machine, containerId);
        } catch (e) {
          yield errorHandler('stopProject', e, arguments, errorCallback);
          const error = {
            statusCode: 'FATAL',
            message: `Failed to stop the project containers uuid: ${projObj.uuid}`
            + `project name: ${projObj.projectName} containerId: ${containerId}`,
          };
          // turn off file watching to prevent syncing errors
          if (projObj.fileWatcher) projObj.fileWatcher.close();
          throw error;
        }
        break;
      }
      default:
        break;
    }
  }
  if (projObj.fileWatcher) projObj.fileWatcher.close();
  return projObj;
});

export const startProject = co(function *g(projObj, activeProject, errorCallback) {
  const server = getServer(projObj);
  try {
    yield removeMachineFolder(projObj);
  } catch (e) {
    yield errorHandler('startProject', e, arguments, errorCallback);
  }

  try {
    yield createMachineFolder(projObj);
  } catch (e) {
    yield errorHandler('startProject', e, arguments, errorCallback);

    // error thrown here will be caught at the App level catch
    const error = {
      statusCode: 'FATAL',
      message: `Failed to create server folder, aborted start ${projObj.uuid} `
      + `${projObj.projectName}`,
    };
    throw error;
  }

  try {
    if (activeProject) yield stopProject(activeProject);
  } catch (e) {
    yield errorHandler('startProject', e, arguments, errorCallback);
    // error thrown here will be caught at the App level catch
    const error = {
      statusCode: 'FATAL',
      message: `Failed to stop active project, aborted start ${projObj.uuid}`
        + `${projObj.projectName}`,
    };
    throw error;
  }

  // add file watching to the project
  if (server) fileWatch(projObj);

  // start the containers
  const containersArray = Object.keys(projObj.containers);
  for (let i = 0; i < containersArray.length; i++) {
    const containerId = containersArray[i];
    const containerStatus = yield checkStatus(projObj.machine, containerId, errorCallback);
    switch (containerStatus) {
      case -2: {
        const error = {
          statusCode: 'FATAL',
          message: 'Failed to access docker-machine (dockdev)',
        };
        if (projObj.fileWatcher) projObj.fileWatcher.close();
        throw error;
      }
      case -1: {
        delete projObj.containers[containerId];
        errorCallback({ stateAction: 'delContainer', uuid: projObj.uuid, containerId });
        break;
      }
      case 0: {
        try {
          container.start(projObj.machine, containerId);
        } catch (e) {
          yield errorHandler('startProject', e, arguments, errorCallback);
          const error = {
            statusCode: 'FATAL',
            message: `Failed to start the project containers uuid: ${projObj.uuid} `
            + `project name: ${projObj.projectName} containerId:${containerId}`,
          };
          // turn off file watching to prevent syncing errors
          if (projObj.fileWatcher) projObj.fileWatcher.close();
          yield stopProject(projObj, errorCallback);
          throw error;
        }
        break;
      }
      default:
        break;
    }
  }

  return projObj;
});

export const restartProject = co(function *g(projObj, activeProject, errorCallback) {
  yield stopProject(projObj, errorCallback);
  yield startProject(projObj, activeProject, errorCallback);

  return projObj;
});

export const removeProject = co(function *g(projObj, errorCallback) {
  // remove the containers
  const containersArray = Object.keys(projObj.containers);
  for (let i = 0; i < containersArray.length; i++) {
    const containerId = containersArray[i];
    const containerStatus = yield checkStatus(projObj.machine, containerId, errorCallback);
    switch (containerStatus) {
      case -2: {
        const error = {
          statusCode: 'FATAL',
          message: 'Failed to access docker-machine (dockdev)',
        };
        throw error;
      }
      case -1: {
        delete projObj.containers[containerId];
        errorCallback({ stateAction: 'delContainer', uuid: projObj.uuid, containerId });
        break;
      }
      default: {
        try {
          container.remove(projObj.machine, containerId);
        } catch (e) {
          yield errorHandler('removeProject', e, arguments, errorCallback);
          const error = {
            statusCode: 'FATAL',
            message: `Failed to remove the project containers uuid: ${projObj.uuid} `
            + `project name: ${projObj.projectName} containerId:${containerId}`,
          };
          // turn off file watching to prevent syncing errors
          if (projObj.fileWatcher) projObj.fileWatcher.close();
          throw error;
        }
        break;
      }
    }
  }

  yield container.networkDelete(projObj.machine, projObj.uuid);

  return projObj;
});
