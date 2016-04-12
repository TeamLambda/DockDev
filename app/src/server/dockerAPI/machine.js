import { coroutine as co } from 'bluebird';
import R from 'ramda';
import { readFile, addPath, exec as execProm } from '../utils/utils';
import { FAILED_TO_ACCESS_MACHINE } from '../appLevel/errorMsgs';

const envVar = addPath({});

/**
 * exec() returns a docker-machine terminal command promise that resolves to the stdout
 * based on the passed in string for the 'docker-machine' terminal command
 *
 * @param {String} args
 * @return {} returns a promise that resolves to the stdout
 */
const exec = (args) => execProm(`docker-machine ${args}`, { env: envVar });

// exec('ls')
//   .then(console.log)
//   .catch(console.log);

/**
 * inspect() returns a docker-machine terminal inspect command promise that resolves to the stdout
 * based on the passed in 'MachineName' string
 *
 * @param {String} machineName
 * @return {} returns a promise that resolves to the stdout
 */
export const inspect = (machineName) =>
  exec(`inspect ${machineName}`)
    .catch(() => {throw FAILED_TO_ACCESS_MACHINE;});

/**
 * status() returns a string indicating the status of the specified machineName
 * return value is a string that is (i) Running, (ii) Stopped
 *
 * @param {String} machineName
 * @return {} returns a promise that resolves to the stdout
 */
export const status = (machineName) => exec(`status ${machineName}`);

/**
 * checkMachineRunning() returns true/false if the docker machine is running
 *
 * @param {Object} defaultConfig
 * @return {Boolean} returns a list docker machines
 */
export const checkMachineRunning = co(function *g(defaultConfig) {
  const running = yield status(defaultConfig.machine);
  return running.trim() !== 'Running';
});

/**
 * removeMachine() deletes the specified machine returning true or error;
 *
 * @param {Object} defaultConfig
 * @return {Boolean} returns a list docker machines
 */
export const removeMachine = (machineName) => exec(`rm -f ${machineName}`);

/**
 * regenCerts() regenerates the certificates for the machine with force (no stdout output)
 *
 * @param {String} machineName
 * @return {} returns a promise that resolves to the stdout
 */
export const regenCerts = (machineName) => exec(`regenerate-certs -f ${machineName}`);

/**
 * start() starts the docker machine specified in arguments
 *
 * @param {String} machineName
 * @return {} returns a promise that resolves to the stdout
 */
export const start = (machineName) => exec(`start ${machineName}`);

/**
 * restart() restarts the docker machine specified in arguments
 *
 * @param {String} machineName
 * @return {} returns a promise that resolves to the stdout
 */
export const restart = (machineName) => exec(`restart ${machineName}`);


/**
 * createMachine() executes 'docker-machine create' with an indeterminant number
 * of arguments. https://docs.docker.com/machine/drivers/os-base/
 *
 * @param {...Args} args
 * @return {} returns a promise that resolves to the stdout
 */
export const createMachine = (...args) => {
  const params = ['create', ...args].join(' ');
  return exec(params);
};

/**
 * createVirtualBox() returns a new docker-machine without a shared folder
 * based on the passed in 'machineName' string
 *
 * @param {String} machineName
 * @return {} returns a promise that resolves to the stdout
 */
export const createVirtualBox = (machineName) =>
  createMachine('--driver virtualbox', '--virtualbox-no-share', machineName);

/**
 * env() returns an object with environment variables of a given machine
 * based on the passed in 'machineName' string
 *
 * @param {String} machineName
 * @return {Object} result
 */
export const env = co(function *g(machineName) {
  let result = yield exec(`env --shell sh ${machineName}`);
  result = R.fromPairs(result.split('\n').slice(0, 4).map(val => val.substr(7).split('=')));
  for (const prop in result) {
    if (result.hasOwnProperty(prop)) {
      const len = result[prop].length - 2;
      result[prop] = result[prop].substr(1).substr(0, len);
    }
  }
  return result;
});

/**
 * ssh() returns a docker-machine terminal ssh command to connect a remote machine
 * based on the passed in 'machineName' string and arguments for the terminal command
 *
 * @param {String} machineName
 * @param {String} args
 * @return {} returns a promise that resolves to the stdout
 */
export const ssh = (machineName, args) => exec(`ssh ${machineName} ${args}`);

/**
 * machineConfig() returns a config object for a given machine with its certificates, uri, and key
 * based on the passed in machine name
 *
 * @param {String} machineName
 * @param {String} containerInfo
 * @return {Object} configObj
 */
export const machineConfig = co(function *g(machineName) {
  const result = JSON.parse(yield inspect(machineName));
  const configObj = {
    uri: `https://${result.Driver.IPAddress}:2376`,
    cert: (yield readFile(`${result.HostOptions.AuthOptions.ClientCertPath}`)).toString(),
    key: (yield readFile(`${result.HostOptions.AuthOptions.ClientKeyPath}`)).toString(),
    ca: (yield readFile(`${result.HostOptions.AuthOptions.CaCertPath}`)).toString(),
  };
  return configObj;
});

/**
 * version() returns the docker machine version
 *
 * @return {} returns the docker machine version
 */
export const version = () => exec('version');

/**
 * version() returns a list of docker machines
 *
 * @return {} returns a list docker machines
 */
export const list = () => exec('ls');

/**
 * removeMachineFolder() removes the /tmp folder where project data is stored
 *
 * @param {Object} projObj
 * @return {String}
 */
export const removeMachineFolder = (projObj) =>
  ssh(projObj.machine, 'rm -rf /home/docker/tmp');


/**
 * createMachineFolder() adds the /tmp folder where project data is stored
 *
 * @param {Object} projObj
 * @return {String}
 */
export const createMachineFolder = (projObj) =>
  ssh(projObj.machine, 'mkdir /home/docker/tmp');

// machineConfig('dockdev')
//   .then(console.log)
//   .catch(console.log);
