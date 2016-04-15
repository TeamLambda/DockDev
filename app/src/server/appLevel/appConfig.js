import { join } from 'path';
import { coroutine as co } from 'bluebird';
import * as utils from '../utils/utils';
import * as machine from '../dockerAPI/machine';
import defaultConfig from './defaultConfig';
import {
  FAILED_READ_CONFIG,
  FAILED_TO_WRITE_CONFIG,
  EEXIST,
  FAILED_TO_CREATE_CONFIG_DIR,
  FAILED_TO_UPDATE_DOTOKEN,
} from './errorMsgs';

/**
 * checkDockerMachineInstalled() returns true if docker machine is installed or false if not
 * based on checking the version of the docker machine
 *
 * @return {Boolean} returns true or false
 */
export const checkDockerMachineInstalled = co(function *g() {
  const result = yield machine.version();
  return result.substr(0, 6) === 'docker';
});


/**
 * checkDockerInstall() returns true if docker is installed or false if not
 * based on running docker in the command line and checking the resulting output
 *
 * @return {Boolean} returns true or false
 */
export const checkDockerInstall = co(function *g() {
  const result = yield utils.exec('docker');
  return result.split('\n').length > 1;
});

/**
 * initConfig() returns an object outlining the main config file information
 * based on the passed in DockDev default config object
 *
 * @param {Object} defaultConfig
 * @return {Object} configObj
 */
export const initConfig = () => ({
  path: defaultConfig.configPath(),
  projects: [],
  userDir: process.env.HOME,
  DOToken: '',
});

/**
 * readCongig() returns an object with the main config file information
 * based on the passed in path to the config folder
 *
 * @param {String} configPath
 * @return {Object} configObj
 */
export const readConfig = (configPath) =>
  utils.readFile(configPath)
    .then(JSON.parse)
    .catch(() => {throw FAILED_READ_CONFIG;});

/**
 * writeConfig() return a promise to write the initial config file
 * based on the passed in config object
 *
 * @param {Object} configObj
 * @return {} writes config file
 */
export const writeConfig = (configObj) => {
  const strObj = utils.jsonStringifyPretty(configObj);
  return utils.writeFile(configObj.path, strObj)
    .then(() => true)
    .catch(() => {throw FAILED_TO_WRITE_CONFIG; });
};

/**
 * createCongigFolder() returns a promise to make the folder for the config file
 * based on the passed in default config object
 *
 * @param {Object} defaultConfig
 * @return {} makes a folder
 */
const createConfigFolder = () =>
  utils.mkdir(join(defaultConfig.defaultPath, defaultConfig.configFolder))
    .then(() => true)
    .catch(err => {
      if (err.code !== EEXIST) throw FAILED_TO_CREATE_CONFIG_DIR;
      return false;
    });

/**
 * loadConfigFile() returns the config object from ~/.dockdevconfig or creates/writes it
 * based on passing in the default config object
 *
 * @param {Object} defaultConfig
 * @return {Object} config
 */
export const loadConfigFile = co(function *g() {
  try {
    if (yield createConfigFolder()) {
      const config = initConfig();
      yield writeConfig(config);
      return config;
    }
    return yield readConfig(defaultConfig.configPath());
  } catch (e) {
    throw e; // potentially need to additional handling here
  }
});

/**
 * updateDOToken() update the Digital Ocean toke stored on disk, it return true or throws error
 *
 * @param {String} token
 * @return {} true or throws error
 */
export const updateDOToken = (token) =>
  readConfig(defaultConfig.configPath())
    .then(config => ({ ...config, DOToken: token }))
    .then(writeConfig)
    .catch(() => {throw FAILED_TO_UPDATE_DOTOKEN;});

/**
 * initApp() will run through several processes at app initiation. First,
 * it will check if docker machine is installed, then docker, then check
 * if there is a dockdev machine created yet, then it will redirect to the
 * home page and load all the projects
 * based on the passed in default config object, router, add config and project functions
 *
 * @param {Object} defaultConfig
 * @param {Function} router
 * @param {Function} addConfig
 * @param {Function} addProject
 * @return {Boolean} true
 */
// export const initApp = co(function *g(defaultConfig, router, addConfig, addProject) {
//   try {
//     yield checkDockerMachineInstalled();
//   } catch (e) {
//     router.replace('/init/1');
//     return false;
//   }
//
//   try {
//     yield checkDockerInstall();
//   } catch (e) {
//     router.replace('/init/2');
//     return false;
//   }
//
//   const checkDockDevMachine = yield machine.list();
//   if (checkDockDevMachine.indexOf('dockdev') === -1) {
//     router.replace('/init/3');
//     yield machine.createVirtualBox(defaultConfig.machine);
//   }
//
//   router.replace('/');
//
//   const config = yield loadConfigFile(defaultConfig);
//
//   addConfig(config);
//
//   loadPaths(config, defaultConfig, addProject);
//
//   return true;
// });
