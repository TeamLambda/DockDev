import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';

import {
  REQUEST_CONFIG,
  RECEIVE_CONFIG,
  ADDING_PROJECT,
  ADDED_PROJECT,
  REQUEST_PROJECT,
  RECEIVE_PROJECT,
  ERROR_ADDING_PROJECT,
  ERROR_LOADING_PROJECT,
  ERROR_LOADING_CONFIG,
  LOAD_IMAGES,
  TOGGLE_SELECT_IMAGE,
  SETTING_UP_CONTAINER,
  ADDED_CONTAINER,
  ERROR_PULLING_IMAGE,
  PULLING_IMAGE,
  ERROR_CREATING_CONTAINER,
  PULLED_IMAGE,
  DELETED_CONTAINER,
  ERROR_DELETING_CONTAINER,
  START_PROJECT,
  ERROR_STARTING_PROJECT,
  ERROR_UPDATING_DOTOKEN,
  UPDATE_DOTOKEN,
  STOPPED_PROJECT,
  ERROR_STOPPING_PROJECT,
  ERROR_SYNC_INFO,
  ERROR_SYNCING_PROJECT,
  ERROR_RESTARTING_PROJECT,
  ERROR_STARTING_CONTAINERS,
  ERROR_STOPPING_CONTAINERS,
  ERROR_RESTARTING_CONTAINERS,
  RESTARTED_PROJECT,
  ERROR_REMOVING_CONTAINERS,
  REMOVED_PROJECT,
  MACHINE_RESTARTED,
  MACHINE_CREATED,
  ADDING_REMOTE,
  ADDED_REMOTE,
  STARTED_SYNC_TO_REMOTE,
  COMPLETED_SYNC_TO_REMOTE,
  START_SERVER_IMAGE_BUILD,
  COMPLETED_SERVER_IMAGE_BUILD,
  PULLING_REMOTE_IMAGES,
  PULLED_REMOTE_IMAGES,
  CREATING_REMOTE_CONTAINERS,
  CREATED_REMOTE_CONTAINERS,
  STARTED_REMOTE_CONTAINERS,
  DELETE_REMOTE,
  COMPLETED_SERVER_IMAGE_UPDATE,
  COMPLETED_SERVER_CONTAINER_UPDATE,
} from '../actions';

function config(state = { isFetching: false }, action) {
  switch (action.type) {
    case REQUEST_CONFIG:
      return { ...state, isFetching: true };
    case RECEIVE_CONFIG:
      return { ...state,
        isFetching: false,
        projects: action.projects,
        DOToken: action.DOToken,
      };
    case UPDATE_DOTOKEN:
      return { ...state, DOToken: action.token };
    default:
      return state;
  }
}

function alerts(state = [], action) {
  switch (action.type) {
    case ADDING_PROJECT:
    case REQUEST_PROJECT:
    case SETTING_UP_CONTAINER:
    case PULLING_IMAGE:
    case ERROR_ADDING_PROJECT:
    case ERROR_LOADING_PROJECT:
    case ERROR_LOADING_CONFIG:
    case ERROR_PULLING_IMAGE:
    case ERROR_CREATING_CONTAINER:
    case ERROR_DELETING_CONTAINER:
    case ERROR_SYNC_INFO:
    case ERROR_SYNCING_PROJECT:
    case ERROR_STARTING_PROJECT:
    case ERROR_UPDATING_DOTOKEN:
    case ERROR_STOPPING_PROJECT:
    case STOPPED_PROJECT:
    case ERROR_RESTARTING_PROJECT:
    case ERROR_STARTING_CONTAINERS:
    case ERROR_STOPPING_CONTAINERS:
    case RESTARTED_PROJECT:
    case ERROR_RESTARTING_CONTAINERS:
    case ERROR_REMOVING_CONTAINERS:
    case MACHINE_RESTARTED:
    case MACHINE_CREATED:
    case ADDING_REMOTE:
    case STARTED_SYNC_TO_REMOTE:
    case COMPLETED_SYNC_TO_REMOTE:
    case START_SERVER_IMAGE_BUILD:
    case COMPLETED_SERVER_IMAGE_BUILD:
    case PULLING_REMOTE_IMAGES:
    case PULLED_REMOTE_IMAGES:
    case CREATING_REMOTE_CONTAINERS:
    case CREATED_REMOTE_CONTAINERS:
      return [
        ...state,
        {
          message: action.message,
          time: action.time,
          timestamp: action.timestamp,
        },
      ];
    default:
      return state;
  }
}

function remote(state = {}, action) {
  switch (action.type) {
    case ADDING_REMOTE:
    case ADDED_REMOTE:
      return {
        ...action.remoteObj,
      };
    case COMPLETED_SYNC_TO_REMOTE:
    case CREATING_REMOTE_CONTAINERS:
    case STARTED_REMOTE_CONTAINERS:
      return {
        ...state,
        status: action.remoteObj.status,
        ipAddress: action.remoteObj.ipAddress,
      };
    case COMPLETED_SERVER_IMAGE_BUILD:
    case PULLED_REMOTE_IMAGES:
    case CREATED_REMOTE_CONTAINERS:
    case COMPLETED_SERVER_IMAGE_UPDATE:
    case COMPLETED_SERVER_CONTAINER_UPDATE:
      return {
        ...state,
        status: action.remoteObj.status,
        containers: [...action.remoteObj.containers],
        counter: action.remoteObj.counter,
        oldServer: action.remoteObj.oldServer || '',
      };
    default:
      return state;
  }
}

function container(state = {}, action) {
  switch (action.type) {
    case ADDED_CONTAINER:
    case PULLED_IMAGE:
      return {
        ...action.containerObj,
      };
    default:
      return state;
  }
}

function containers(state = [], action) {
  switch (action.type) {
    case ADDED_CONTAINER:
      return [
        ...state,
        container({}, action),
      ];
    case PULLED_IMAGE:
      return [
        ...state.slice(0, action.idx),
        container({}, action),
        ...state.slice(action.idx + 1),
      ];
    case DELETED_CONTAINER:
      return [
        ...state.slice(0, action.idx),
        ...state.slice(action.idx + 1),
      ];
    default:
      return state;
  }
}

function project(state = {}, action) {
  switch (action.type) {
    case ADDED_PROJECT:
    case RECEIVE_PROJECT:
      return { ...state,
        ...action.projObj,
      };
    case ADDED_CONTAINER:
    case PULLED_IMAGE:
    case DELETED_CONTAINER:
      return {
        ...state,
        containers: containers(state.containers, action),
      };
    case ADDING_REMOTE:
    case ADDED_REMOTE:
    case COMPLETED_SYNC_TO_REMOTE:
    case COMPLETED_SERVER_IMAGE_BUILD:
    case PULLED_REMOTE_IMAGES:
    case CREATING_REMOTE_CONTAINERS:
    case CREATED_REMOTE_CONTAINERS:
    case STARTED_REMOTE_CONTAINERS:
    case COMPLETED_SERVER_IMAGE_UPDATE:
    case COMPLETED_SERVER_CONTAINER_UPDATE:
      return {
        ...state,
        remote: remote(state.remote, action),
      };
    case DELETE_REMOTE:
      return {
        ...state,
        remote: {},
      };
    default:
      return state;
  }
}

function projects(state = {}, action) {
  switch (action.type) {
    case ADDED_PROJECT:
    case RECEIVE_PROJECT:
      return { ...state,
        [action.projObj.cleanName]: project(state[action.projObj.cleanName], action),
      };
    case ADDED_CONTAINER:
    case PULLED_IMAGE:
    case DELETED_CONTAINER:
      return { ...state,
        [action.containerObj.cleanName]: project(state[action.containerObj.cleanName], action),
      };
    case REMOVED_PROJECT: {
      const newProj = { ...state };
      delete newProj[action.project.cleanName];
      return {
        ...newProj,
      };
    }
    case ADDING_REMOTE:
    case ADDED_REMOTE:
    case COMPLETED_SYNC_TO_REMOTE:
    case COMPLETED_SERVER_IMAGE_BUILD:
    case PULLED_REMOTE_IMAGES:
    case CREATING_REMOTE_CONTAINERS:
    case CREATED_REMOTE_CONTAINERS:
    case STARTED_REMOTE_CONTAINERS:
    case COMPLETED_SERVER_IMAGE_UPDATE:
    case COMPLETED_SERVER_CONTAINER_UPDATE:
      return { ...state,
        [action.remoteObj.cleanName]: project(state[action.remoteObj.cleanName], action),
      };
    case DELETE_REMOTE:
      return {
        ...state,
        [action.cleanName]: project(state[action.cleanName], action),
      };
    default:
      return state;
  }
}

function availableImages(state = [], action) {
  switch (action.type) {
    case LOAD_IMAGES:
      return [
        ...action.images,
      ];
    case TOGGLE_SELECT_IMAGE:
      return [
        ...state.slice(0, action.idx),
        action.image,
        ...state.slice(action.idx + 1),
      ];
    default:
      return state;
  }
}

function activeProject(state = {}, action) {
  switch (action.type) {
    case START_PROJECT:
      return {
        project: action.project,
        watcher: action.watcher,
      };
    case STOPPED_PROJECT:
      return {};
    default:
      return state;
  }
}

const rootReducer = combineReducers({
  config,
  routing,
  projects,
  alerts,
  availableImages,
  activeProject,
});

export default rootReducer;
