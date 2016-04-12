import { push } from 'react-router-redux';
import moment from 'moment';
import chokidar from 'chokidar';
import Promise from 'bluebird';
import {
  appConfig,
  defaultConfig,
  projConfig,
  availableImages,
  containerMgmt,
  rsync,
  docker,
  machine,
  deploy,
} from './server/main';

export const REQUEST_CONFIG = 'REQUEST_CONFIG';
export const RECEIVE_CONFIG = 'RECEIVE_CONFIG';
export const REQUEST_PROJECT = 'REQUEST_PROJECT';
export const RECEIVE_PROJECT = 'RECEIVE_PROJECT';
export const ADDING_PROJECT = 'ADDING_PROJECT';
export const ADDED_PROJECT = 'ADDED_PROJECT';
export const ERROR_ADDING_PROJECT = 'ERROR_ADDING_PROJECT';
export const ERROR_LOADING_CONFIG = 'ERROR_LOADING_CONFIG';
export const ERROR_LOADING_PROJECT = 'ERROR_LOADING_PROJECT';
export const LOAD_IMAGES = 'LOAD_IMAGES';
export const TOGGLE_SELECT_IMAGE = 'TOGGLE_SELECT_IMAGE';
export const SETTING_UP_CONTAINER = 'SETTING_UP_CONTAINER';
export const ADDED_CONTAINER = 'ADDED_CONTAINER';
export const ERROR_CREATING_CONTAINER = 'ERROR_CREATING_CONTAINER';
export const PULLING_IMAGE = 'PULLING_IMAGE';
export const PULLED_IMAGE = 'PULLED_IMAGE';
export const ERROR_PULLING_IMAGE = 'ERROR_PULLING_IMAGE';
export const DELETED_CONTAINER = 'DELETED_CONTAINER';
export const ERROR_DELETING_CONTAINER = 'ERROR_DELETING_CONTAINER';
export const ERROR_STARTING_PROJECT = 'ERROR_STARTING_PROJECT';
export const START_PROJECT = 'START_PROJECT';
export const UPDATE_DOTOKEN = 'UPDATE_DOTOKEN';
export const ERROR_UPDATING_DOTOKEN = 'ERROR_UPDATING_DOTOKEN';
export const ERROR_STOPPING_PROJECT = 'ERROR_STOPPING_PROJECT';
export const STOPPED_PROJECT = 'STOPPED_PROJECT';
export const ERROR_SYNC_INFO = 'ERROR_SYNC_INFO';
export const ERROR_SYNCING_PROJECT = 'ERROR_SYNCING_PROJECT';
export const ERROR_RESTARTING_PROJECT = 'ERROR_RESTARTING_PROJECT';
export const ERROR_STARTING_CONTAINERS = 'ERROR_STARTING_CONTAINERS';
export const ERROR_STOPPING_CONTAINERS = 'ERROR_STOPPING_CONTAINERS';
export const ERROR_RESTARTING_CONTAINERS = 'ERROR_RESTARTING_CONTAINERS';
export const RESTARTED_PROJECT = 'RESTARTED_PROJECT';
export const ERROR_REMOVING_CONTAINERS = 'ERROR_REMOVING_CONTAINERS';
export const REMOVED_PROJECT = 'REMOVED_PROJECT';
export const MACHINE_RESTARTED = 'MACHINE_RESTARTED';
export const MACHINE_CREATED = 'MACHINE_CREATED';
export const ADDING_REMOTE = 'ADDING_REMOTE';
export const ADDED_REMOTE = 'ADDED_REMOTE';
export const STARTED_SYNC_TO_REMOTE = 'STARTED_SYNC_TO_REMOTE';
export const COMPLETED_SYNC_TO_REMOTE = 'COMPLETED_SYNC_TO_REMOTE';
export const START_SERVER_IMAGE_BUILD = 'START_SERVER_IMAGE_BUILD';
export const COMPLETED_SERVER_IMAGE_BUILD = 'COMPLETED_SERVER_IMAGE_BUILD';
export const PULLING_REMOTE_IMAGES = 'PULLING_REMOTE_IMAGES';
export const PULLED_REMOTE_IMAGES = 'PULLED_REMOTE_IMAGES';
export const CREATING_REMOTE_CONTAINERS = 'CREATING_REMOTE_CONTAINERS';
export const CREATED_REMOTE_CONTAINERS = 'CREATED_REMOTE_CONTAINERS';
export const STARTED_REMOTE_CONTAINERS = 'STARTED_REMOTE_CONTAINERS';
export const DELETE_REMOTE = 'DELETE_REMOTE';
export const COMPLETED_SERVER_IMAGE_UPDATE = 'COMPLETED_SERVER_IMAGE_UPDATE';
export const UPDATING_REMOTE_SERVER_CONTAINER = 'UPDATING_REMOTE_SERVER_CONTAINER';
export const COMPLETED_SERVER_CONTAINER_UPDATE = 'COMPLETED_SERVER_CONTAINER_UPDATE';

export function redirectHome() {
  return dispatch => dispatch(push('/'));
}

export function redirect(...args) {
  return dispatch => dispatch(push(`/${args.join('/')}`));
}

function createMessage(type, message) {
  return {
    type,
    message,
    time: moment(),
    timestamp: moment().format('MM-D-YYYY, h:mm:ss a'),
  };
}

function machineRestarting() {
  return createMessage(
    MACHINE_RESTARTED,
    `${defaultConfig.machine} has restarted`
  );
}

function machineCreated() {
  return createMessage(
    MACHINE_CREATED,
    `${defaultConfig.machine} has been created`
  );
}

function checkDockDevMachine() {
  return dispatch => {
    const machineList = machine.list();
    return machineList.then(list => {
      if (list.indexOf(defaultConfig.machine) === -1) {
        dispatch(redirect('init', 2));
        machine.createVirtualBox(defaultConfig.machine)
          .then(() => {
            dispatch(machineCreated());
            dispatch(redirectHome());
          })
          .catch(() => {
            dispatch(redirect('init', 4));
          });
      } else {
        machine.regenCerts(defaultConfig.machine);
        machine.checkMachineRunning(defaultConfig)
          .then(result => {
            if (result) {
              dispatch(redirect('init', 3));
              machine.restart(defaultConfig.machine)
                .then(() => {
                  dispatch(machineRestarting());
                  dispatch(redirectHome());
                });
            }
          });
      }
    });
  };
}

function checkDocker() {
  return dispatch => {
    appConfig.checkDockerInstall()
      .then(res => {
        if (!res) return dispatch(redirect('init', 1));
        return dispatch(checkDockDevMachine());
      });
  };
}

export function appInitiation() {
  return dispatch => {
    appConfig.checkDockerMachineInstalled()
      .then(res => {
        if (!res) return dispatch(redirect('init', 1));
        return dispatch(checkDocker());
      });
  };
}

function requestConfig() {
  return {
    type: REQUEST_CONFIG,
    isFetching: true,
  };
}

function receiveConfig(config) {
  return {
    type: RECEIVE_CONFIG,
    isFetching: false,
    projects: config.projects,
    DOToken: config.DOToken,
  };
}

function requestProject(project) {
  return createMessage(
    REQUEST_PROJECT,
    `Trying to load ${project.projectName} @ ${project.basePath}`
  );
}

function receiveProject(projObj) {
  return {
    type: RECEIVE_PROJECT,
    projObj,
  };
}

function loadProjectError(err, project) {
  return createMessage(
    ERROR_LOADING_PROJECT,
    `Couldn't load project ${project.projectName} @ ${project.basePath} error = ${err}`
  );
}

function loadProject(project) {
  return dispatch => {
    dispatch(requestProject(project));
    return projConfig.loadProject(project.basePath)
      .then(response => dispatch(receiveProject(response)))
      .catch(err => dispatch(loadProjectError(err, project)));
  };
}

function loadProjects(projects) {
  return dispatch => {
    projects.forEach(val => dispatch(loadProject(val)));
  };
}

function addingProject(path, name) {
  return createMessage(
    ADDING_PROJECT,
    `Adding project ${name}`
  );
}

function addedProject(projObj) {
  return {
    type: ADDED_PROJECT,
    projObj,
  };
}

function loadConfigError(err) {
  return createMessage(
    ERROR_LOADING_CONFIG,
    `Couldn't load config file: error = ${err}`
  );
}

export function loadConfig() {
  return dispatch => {
    dispatch(requestConfig());
    return appConfig.loadConfigFile()
      .then(response => {
        dispatch(receiveConfig(response));
        dispatch(loadProjects(response.projects));
      })
      .catch(err => dispatch(loadConfigError(err)));
  };
}

function addProjectError(err, name) {
  return createMessage(
    ERROR_ADDING_PROJECT,
    `Couldn't add ${name}: error = ${err}`
  );
}

export function addProject(path, name) {
  return dispatch => {
    dispatch(addingProject(path, name));
    return projConfig.initProject(path, name)
      .then(response => {
        dispatch(addedProject(response));
        dispatch(redirect('projects', response.cleanName));
      })
      .catch(err => dispatch(addProjectError(err, name)));
  };
}

export function loadImages(images) {
  return {
    type: LOAD_IMAGES,
    images,
  };
}

export function getImages(projectName) {
  return (dispatch, getState) => {
    const { projects } = getState();
    const containers = projects[projectName].containers
      .map(used => used.image);
    const images = availableImages.getImages()
      .map(image => ({
        ...image,
        used: containers.indexOf(image.name) > -1,
      }));
    dispatch(loadImages(images));
  };
}

export function toggleImage(image, idx) {
  return {
    type: TOGGLE_SELECT_IMAGE,
    image,
    idx,
  };
}

export function settingUpContainer(projObj, imageObj) {
  return createMessage(
    SETTING_UP_CONTAINER,
    `We're setting up a ${imageObj.name} container for ${projObj.projectName}`
  );
}

export function addedContainer(containerObj) {
  return {
    type: ADDED_CONTAINER,
    containerObj,
  };
}

export function createContainerError(err, projObj, imageObj) {
  return createMessage(
    ERROR_CREATING_CONTAINER,
    `There was an error adding ${imageObj.name} to ${projObj.projectName}, err = ${err}`
  );
}

export function pullingImage(imageName, projectName) {
  return createMessage(
    PULLING_IMAGE,
    `Pulling ${imageName} for ${projectName}`
  );
}

export function pulledImage(containerObj, idx) {
  return {
    type: PULLED_IMAGE,
    containerObj,
    idx,
  };
}

export function pullImageError(containerObj, projectName) {
  return createMessage(
    ERROR_PULLING_IMAGE,
    `There was an error pulling ${containerObj.image} for ${projectName}`
  );
}

export function pullImage(containerObj) {
  return (dispatch, getState) => {
    const { projectName, basePath, containers } = getState().projects[containerObj.cleanName];
    const idx = projConfig.findContainer(containers, containerObj.name);
    dispatch(pullingImage(containerObj.image, projectName));
    return containerMgmt.pullImageForProject(containerObj, basePath)
      .then(response => {
        dispatch(pulledImage(response, idx));
        if (response.status === 'error') dispatch(pullImageError(containerObj, projectName));
      });
  };
}

export function createContainerStatus(containerObj) {
  return dispatch => {
    dispatch(addedContainer(containerObj));
    if (containerObj.status === 'pending') dispatch(pullImage(containerObj));
  };
}

export function createContainer(projObj, imageObj) {
  return dispatch => {
    dispatch(settingUpContainer(projObj, imageObj));
    return containerMgmt.createContainer(projObj, imageObj)
      .then(response => dispatch(createContainerStatus(response)))
      .catch(err => dispatch(createContainerError(err, projObj, imageObj)));
  };
}

export function clickAddContainers(cleanName) {
  return (dispatch, getState) => {
    const images = getState().availableImages;
    const projObj = getState().projects[cleanName];
    images.forEach(imageObj => {
      if (imageObj.selected) dispatch(createContainer(projObj, imageObj));
    });
  };
}

export function deletedContainer(containerObj, idx) {
  return {
    type: DELETED_CONTAINER,
    containerObj,
    idx,
  };
}

export function deleteContainerError(err, container, projectName) {
  return createMessage(
    ERROR_DELETING_CONTAINER,
    `There was an error deleting ${container.name} from ${projectName}, err = ${err}`
  );
}

export function clickDelContainer(containerObj) {
  return (dispatch, getState) => {
    const { projectName, basePath, containers } = getState().projects[containerObj.cleanName];
    const idx = projConfig.findContainer(containers, containerObj.name);
    return containerMgmt.deleteProjectContainer(containerObj, basePath)
      .then(() => dispatch(deletedContainer(containerObj, idx)))
      .catch(err => dispatch(deleteContainerError(err, containerObj, projectName)));
  };
}

function startProject(project, watcher) {
  return {
    type: START_PROJECT,
    project,
    watcher,
  };
}

function startProjectError(err, projectName) {
  return createMessage(
    ERROR_STARTING_PROJECT,
    `There was an error starting ${projectName}, err = ${err}`
  );
}

function startContainersError(err, projectName) {
  return createMessage(
    ERROR_STARTING_CONTAINERS,
    `There was an error starting containers for ${projectName}, err = ${err}`
  );
}

function startContainers(project, watcher) {
  return dispatch => {
    const containerArray = project.containers.map(cont =>
      docker.containerStart(cont.machine, cont.dockerId));
    Promise.all(containerArray)
      .then(() => dispatch(startProject(project, watcher)))
      .catch(err => dispatch(startContainersError(err, project.projectName)));
  };
}

function rsyncInfoError(err, project) {
  return createMessage(
    ERROR_SYNC_INFO,
    `There was an error grabbing syncing info for ${project.projectName}, err = ${err}`
  );
}

function fileWatchError(err, project) {
  return createMessage(
    ERROR_SYNCING_PROJECT,
    `There was an error syncing ${project.projectName}, err = ${err}`
  );
}

function fileWatching(project, syncArgs) {
  return dispatch => {
    const projectSync = () =>
      rsync.rsync(syncArgs)
        .catch(err => dispatch(fileWatchError(err, project)));
    const throttled = new rsync.ThrottleSync(projectSync, 100);
    const watcher = chokidar.watch(project.basePath);
    watcher.on('all', throttled.start.bind(throttled));
    return dispatch(startContainers(project, watcher));
  };
}

function rsyncProj(project) {
  return dispatch => {
    const basePath = rsync.cleanFilePath(project.basePath);
    const server = project.containers.filter(cont => cont.server)[0];
    const destPath = server.dest;
    return machine.inspect(project.machine)
      .then(rsync.selectSSHandIP)
      .then(machineInfo =>
        dispatch(
          fileWatching(project, rsync.createRsyncArgs(`${basePath}/*`, destPath, machineInfo)))
        )
      .catch(err => dispatch(rsyncInfoError(err, project)));
  };
}

export function clickStartProject(cleanName) {
  return (dispatch, getState) => {
    const { activeProject, projects } = getState();
    const project = projects[cleanName];
    if (activeProject.project) {
      const error =
        `Couldn't start ${project.projectName}, ${activeProject.project.projectName} is active`;
      return dispatch(startProjectError(error, project.projectName));
    }
    return dispatch(rsyncProj(project));
  };
}

function stopProjectError(err, projectName) {
  return createMessage(
    ERROR_STOPPING_PROJECT,
    `There was an error stopping ${projectName}, err = ${err}`
  );
}

function stopContainersError(err, projectName) {
  return createMessage(
    ERROR_STOPPING_CONTAINERS,
    `There was an error stopping containers for ${projectName}, err = ${err}`
  );
}

function stopProject(projectName) {
  return createMessage(
    STOPPED_PROJECT,
    `Project ${projectName} has stopped`
  );
}

function stopContainers(project, del) {
  return dispatch => {
    const containerArray = project.containers.map(cont =>
      docker.containerStop(cont.machine, cont.dockerId)
        .catch(err => {
          if (err.statusCode !== 304) throw err;
        })
      );
    Promise.all(containerArray)
      .then(() => dispatch(stopProject(project.projectName)))
      .then(() => {
        if (del) dispatch(clickRemoveProject(project.cleanName));
      })
      .catch(err => dispatch(stopContainersError(err, project.projectName)));
  };
}

export function clickStopProject(cleanName, del = false) {
  return (dispatch, getState) => {
    const { activeProject } = getState();
    if (activeProject.project && activeProject.project.cleanName === cleanName) {
      activeProject.watcher.close();
      return dispatch(stopContainers(activeProject.project, del));
    }
    const error =
    `Couldn't stop ${cleanName} because it is not active`;
    return dispatch(stopProjectError(error, cleanName));
  };
}

function restartProjectError(err, projectName) {
  return createMessage(
    ERROR_RESTARTING_PROJECT,
    `There was an error restarting ${projectName}, err = ${err}`
  );
}

function restartContainersError(err, projectName) {
  return createMessage(
    ERROR_RESTARTING_CONTAINERS,
    `There was an error restarting containers for ${projectName}, err = ${err}`
  );
}

function restartProject(projectName) {
  return createMessage(
    RESTARTED_PROJECT,
    `${projectName} was restarted`
  );
}

function restartContainers(project) {
  return dispatch => {
    const containerArray = project.containers.map(cont =>
      docker.containerRestart(cont.machine, cont.dockerId));
    Promise.all(containerArray)
      .then(() => dispatch(restartProject(project.projectName)))
      .catch(err => dispatch(restartContainersError(err, project.projectName)));
  };
}

export function clickRestartProject(cleanName) {
  return (dispatch, getState) => {
    const { activeProject } = getState();

    if (activeProject.project && activeProject.project.cleanName === cleanName) {
      activeProject.watcher.close();
      return dispatch(restartContainers(activeProject.project));
    }
    const error =
      `Couldn't restart ${cleanName} because the project is not active`;
    return dispatch(restartProjectError(error, cleanName));
  };
}

function removeContainersError(err, projectName) {
  return createMessage(
    ERROR_REMOVING_CONTAINERS,
    `There was an error removing containers for ${projectName}, err = ${err}`
  );
}

function removeProject(project) {
  return {
    type: REMOVED_PROJECT,
    project,
  };
}

function removeContainers(cleanName) {
  return (dispatch, getState) => {
    const project = getState().projects[cleanName];
    const containerArray = project.containers.map(cont =>
      docker.containerRemove(cont.machine, cont.dockerId));
    Promise.all(containerArray)
      .then(() => projConfig.undoInitProject(project))
      .then(() => dispatch(removeProject(project)))
      .catch(err => dispatch(removeContainersError(err, project.projectName)));
  };
}

export function clickRemoveProject(cleanName) {
  return (dispatch, getState) => {
    const { activeProject } = getState();
    if (activeProject.project && activeProject.project.cleanName === cleanName) {
      return dispatch(clickStopProject(cleanName, true));
    }
    return dispatch(removeContainers(cleanName));
  };
}

function updateDOToken(token) {
  return {
    type: UPDATE_DOTOKEN,
    token,
  };
}

function updateDOTokenError(err) {
  return createMessage(
    ERROR_UPDATING_DOTOKEN,
    `There was an error updating the Digital Ocean token, err = ${err}`
  );
}

export function clickUpdateDOToken(token) {
  return dispatch =>
    appConfig.updateDOToken(token)
      .then(() => dispatch(updateDOToken(token)))
      .catch(err => dispatch(updateDOTokenError(err)));
}

function startedRemoteContainers(remoteObj) {
  return {
    type: STARTED_REMOTE_CONTAINERS,
    remoteObj,
  };
}

function startRemoteServer(remoteObj, isPush = false) {
  return dispatch => {
    const server = remoteObj.containers.filter(cont => cont.server)[0];
    docker.containerStart(server.machine, server.dockerId)
      .then(() => {
        const newRemoteObj = { ...remoteObj, status: 5 };
        projConfig.writeRemote(newRemoteObj, newRemoteObj.basePath);
        dispatch(startedRemoteContainers(newRemoteObj));
        if (isPush) {
          docker.containerStop(server.machine, newRemoteObj.oldServer.dockerId);
        }
      });
  };
}

function startingRemoteContainers(remoteObj) {
  return dispatch => {
    dispatch(
      { ...createMessage(
        CREATED_REMOTE_CONTAINERS,
        `Created remote containers for ${remoteObj.cleanName}`
        ),
        remoteObj,
      }
    );
    const containerArray = remoteObj.containers.filter(cont => !cont.nginx && !cont.server)
      .map(cont => docker.containerStart(cont.machine, cont.dockerId));
    Promise.all(containerArray)
      .then(() => {
        const newRemoteObj = { ...remoteObj, status: 5 };
        projConfig.writeRemote(newRemoteObj, newRemoteObj.basePath);
        dispatch(startRemoteServer(newRemoteObj));
      });
  };
}

function startProxyServer(remoteObj) {
  return dispatch => {
    const proxy = remoteObj.containers.filter(cont => cont.nginx)[0];
    docker.containerStart(proxy.machine, proxy.dockerId)
      .then(() => dispatch(startingRemoteContainers(remoteObj)));
  };
}

function completedServerContainerUpdate(remoteObj) {
  return dispatch => {
    dispatch({
      type: COMPLETED_SERVER_CONTAINER_UPDATE,
      remoteObj,
    });
    dispatch(startRemoteServer(remoteObj, true));
  };
}

function createUpdatedServerContainer(remoteObj) {
  return dispatch => {
    dispatch(
      { ...createMessage(
        UPDATING_REMOTE_SERVER_CONTAINER,
        `Updating remote server container for ${remoteObj.cleanName}`
        ),
        remoteObj,
      });
    const dbs = remoteObj.containers.filter(cont => !cont.server && !cont.nginx)
      .map(cont => `${cont.name}:${cont.name}`);
    const newRemoteObj = { ...remoteObj, links: dbs };
    const server = newRemoteObj.containers.filter(cont => cont.server)[0];
    const idx = projConfig.findContainer(newRemoteObj.containers, server.name);
    deploy.createRemoteContainer(server, newRemoteObj)
      .then(res => dispatch(completedServerContainerUpdate({
        ...remoteObj,
        containers: [
          ...remoteObj.containers.slice(0, idx),
          res,
          ...remoteObj.containers.slice(idx + 1),
        ],
        status: 4,
      })));
  };
}

function createRemoteContainers(remoteObj) {
  return dispatch => {
    dispatch(
      { ...createMessage(
        CREATING_REMOTE_CONTAINERS,
        `Creating remote containers for ${remoteObj.cleanName}`
        ),
        remoteObj,
      });
    const dbs = remoteObj.containers.filter(cont => !cont.server && !cont.nginx)
      .map(cont => `${cont.name}:${cont.name}`);
    const newRemoteObj = { ...remoteObj, links: dbs };
    const containerArray = remoteObj.containers.map(cont =>
      deploy.createRemoteContainer(cont, newRemoteObj));
    Promise.all(containerArray)
      .then(res => dispatch(startProxyServer({
        ...remoteObj,
        containers: [...res],
        status: 4,
      })));
  };
}

function pulledRemoteImages(remoteObj) {
  return dispatch => {
    dispatch(
      { ...createMessage(
          PULLED_REMOTE_IMAGES,
          `Pulled images on remote for ${remoteObj.cleanName}`
        ),
        remoteObj,
      });
    dispatch(createRemoteContainers({ ...remoteObj }));
  };
}

function completedServerImageBuild(remoteObj) {
  return (dispatch, getState) => {
    dispatch(
      { ...createMessage(
          COMPLETED_SERVER_IMAGE_BUILD,
          `Completed server image build for ${remoteObj.cleanName}`
        ),
        remoteObj,
      });
    dispatch(createMessage(
      PULLING_REMOTE_IMAGES,
      `Started pulling images on remote machine for ${remoteObj.cleanName}`
    ));
    const project = getState().projects[remoteObj.cleanName];
    const dbs =
      deploy.addNginxContainer(project.containers.filter(cont => !cont.server), remoteObj);
    const pullDbs = dbs.map(cont => docker.pullImage(remoteObj.machine, cont.image));
    Promise.all(pullDbs)
      .then(() => {
        const newRemoteObj = {
          ...remoteObj,
          containers: [...remoteObj.containers, ...dbs],
          status: 3,
        };
        projConfig.writeRemote(newRemoteObj, project.basePath)
          .then(() => dispatch(pulledRemoteImages(newRemoteObj)));
      });
  };
}

function completedServerImageUpdate(remoteObj) {
  return dispatch => {
    dispatch(
      { ...createMessage(
        COMPLETED_SERVER_IMAGE_UPDATE,
        `Completed server image update for ${remoteObj.cleanName}`
        ),
        remoteObj,
      }
    );
    dispatch(createUpdatedServerContainer(remoteObj));
  };
}

function startServerImageBuild(remoteObj) {
  return dispatch => {
    dispatch(createMessage(
      START_SERVER_IMAGE_BUILD,
      `Started building server image for ${remoteObj.cleanName}`
    ));
    return deploy.buildServerImage(remoteObj)
      .then(() => {
        const serverObj = deploy.remoteServerObj(remoteObj);
        const newRemoteObj = {
          ...remoteObj,
          containers: [serverObj],
          counter: remoteObj.counter + 1,
          status: 2,
        };
        return dispatch(completedServerImageBuild(newRemoteObj));
      });
  };
}

function startServerImageUpdate(remoteObj) {
  return dispatch => {
    const oldServer = { ...remoteObj.containers.filter(cont => cont.server)[0] };
    const idx = projConfig.findContainer(remoteObj.containers, oldServer.name);
    return deploy.buildServerImage(remoteObj)
      .then(() => {
        const serverObj = deploy.remoteServerObj(remoteObj);
        const newRemoteObj = {
          ...remoteObj,
          containers: [
            ...remoteObj.containers.slice(0, idx),
            serverObj,
            ...remoteObj.containers.slice(idx + 1),
          ],
          oldServer,
          counter: remoteObj.counter + 1,
          status: 3,
        };
        dispatch(completedServerImageUpdate(newRemoteObj));
      });
  };
}

function syncedToRemote(remoteObj, isPush = false) {
  return dispatch => {
    dispatch(
      { ...createMessage(
          COMPLETED_SYNC_TO_REMOTE,
          `Completed sync to remote for ${remoteObj.cleanName}`
        ),
        remoteObj,
      });
    if (isPush) return dispatch(startServerImageUpdate(remoteObj));
    return dispatch(startServerImageBuild(remoteObj));
  };
}

function syncingToRemote(remoteObj, isPush = false) {
  return dispatch => {
    dispatch(createMessage(
      STARTED_SYNC_TO_REMOTE,
      `Started syncing ${remoteObj.cleanName}`
    ));
    return deploy.syncFilesToRemote(remoteObj)
      .then(res => dispatch(syncedToRemote({ ...res, status: 1 }, isPush)));
  };
}

function createDockerfile(remoteObj, isPush = false) {
  return (dispatch, getState) => {
    const project = getState().projects[remoteObj.cleanName];
    return deploy.createDockerfile(project.containers, remoteObj.basePath)
      .then(() => dispatch(syncingToRemote(remoteObj, isPush)));
  };
}

function addingRemote(project) {
  return {
    ...createMessage(
      ADDING_REMOTE,
      `Starting deploy of ${project.projectName} to Digital Ocean`
    ),
    remoteObj: { cleanName: project.cleanName, machine: 'n/a', status: 0 },
  };
}

function addedRemote(remoteObj) {
  return dispatch => {
    dispatch({
      type: ADDED_REMOTE,
      remoteObj,
    });
    return dispatch(createDockerfile(remoteObj));
  };
}

export function clickDeployRemote(cleanName) {
  return (dispatch, getState) => {
    const project = getState().projects[cleanName];
    dispatch(addingRemote(project));
    return deploy.initRemote(cleanName, project.basePath)
      .then(res => dispatch(addedRemote(res)));
  };
}

function deleteRemote(cleanName) {
  return {
    type: DELETE_REMOTE,
    cleanName,
  };
}

export function clickDeleteRemote(cleanName) {
  return (dispatch, getState) => {
    const project = getState().projects[cleanName];
    if (project.remote.machine) {
      dispatch(redirect('projects', cleanName));
      deploy.deleteRemoteHost(project.remote.machine, project.basePath)
        .then(dispatch(deleteRemote(project.cleanName)));
    }
  };
}

export function clickUpdateRemote(cleanName) {
  return (dispatch, getState) => {
    const project = getState().projects[cleanName];
    const remote = project.remote;
    if (remote.status === 5) {
      dispatch(createDockerfile(remote, true));
    }
  };
}
