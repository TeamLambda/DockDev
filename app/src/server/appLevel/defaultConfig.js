import { join } from 'path';

/**
* @param {Object} config has default config settings for project and app level information
*
* App Config
*   @param {String} config.configFolder is where app config details are stored
*   @param {String} config.configFile is the file name for dockdev app config storage
*   @param {String} config.defaultPath is the path where the app config is stored by default
*   @param {String} config.DOToken is the placeholder for the user provided Access Token
*   @param {String} config.machine is the docker machine that we are create for the user
*   @param {Function} config.configPath is the full path to the app config file
*
* Projects Config
*   @param {String} config.projFolder is where project config details are stored
*   @param {String} config.projFile is the file name for dockdev project config storage
*   @param {[String]} config.projWriteParams lists the project config props to be written to disk
*   @param {Function} config.projPath is relative to projects base path (i.e. user's projFolder)
*/
const config = {
  // app config
  configFolder: '.dockdevConfig',
  configFile: 'dockdevConfig.json',
  errorLogFile: 'error.json',
  defaultPath: process.env.HOME,
  machine: 'dockdev',
  configPath(path = this.defaultPath) {
    return join(path, this.configFolder, this.configFile);
  },
  errorLogPath(path = this.defaultPath) {
    return join(path, this.configFolder, this.errorLogFile);
  },

  // projects config
  projFolder: '.dockdev',
  projFile: 'dockdev.json',
  projPath() {
    return join(this.projFolder, this.projFile);
  },

  // container config
  dest: '/home/docker',
  workDir: '/app',
  port: 3000,
  serverCmd: ['npm', 'start'],
  remoteDest: '/root',
};

export default config;
