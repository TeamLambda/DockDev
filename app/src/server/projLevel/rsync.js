import R from 'ramda';
import { exec } from '../utils/utils';

/**
* cleanFilePath() accepts a string file path and returns a string file path with any
* folder names with spaces qouted.
*
* @param {String} basePath
* @return {String} basePath
*/
export function cleanFilePath(basePath) {
  const splitPath = basePath.split('/');
  const cleanPath = splitPath.map(val => {
    if (val.indexOf(' ') > -1) return `"${val}"`;
    return val;
  }).join('/');

  return cleanPath;
}

/**
 * rsync() returns a promise that resolves to the stdout
 * based on the passed in string of arguments
 *
 * @param {String} args
 * @return {} returns a promise that resolves to the stdout
 */
export const rsync = (args) => exec(`rsync ${args}`);

/**
 * selectWithin() returns a result object
 * it is a helper function to select specified props from a nested object
 * based on the passed in array, key, and object
 *
 * @param {Array} Array
 * @param {String} key
 * @param {Object} obj
 * @return {Object} result
 */
const selectWithin = R.curry((array, key, obj) => {
  const result = {};
  array.forEach(val => { result[val] = obj[key][val]; });
  return result;
});

/**
 * selectSSHandIP() returns a result object
 * it is a composed function that takes in an object, parses it, and passes it
 * to selectWithin
 * Ultimately, it selects ssh and ip address from docker-machine inspect object
 * based on the passed in object when called
 *
 * @param {Object} docker-machine inspect object (passed in below)
 * @return {Object} result (from selectWithin)
 */
export const selectSSHandIP = R.compose(
  selectWithin(['SSHKeyPath', 'IPAddress'], 'Driver'),
  JSON.parse
);

/**
 * createRsyncArgs() returns the string of arguments for rsync to run
 * based on the passed in source, destination, and machine information
 *
 * @param {String} source
 * @param {String} dest
 * @param {String} machineInfo
 * @return {String}
 */
export const createRsyncArgs = (source, dest, machineInfo) =>
  `-aWOl --inplace --rsh="ssh -i ${machineInfo.SSHKeyPath} -o IdentitiesOnly=yes -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no" --delete ${source} docker@${machineInfo.IPAddress}:${dest}`;

/**
 * getServerCont() returns the containerId for the container where sync is turned on
 * based on the passed in project object
 *
 * @param {Object} projObj
 * @return {String} result
 */
export function getServerCont(projObj) {
  let result;
  for (const container in projObj.containers) {
    if (projObj.containers[container].server) {
      result = projObj.containers[container].dockerId;
      break;
    }
  }
  return result;
}

/**
 * ThrottleSync() ensures that the rsync function will run by
 * perventing multiple calls to rsync which will crash the app
 *
 * @param {Function} func
 * @param {Number} delay
 * @return {Object} new ThrottleSync()
 */
export function ThrottleSync(func, delay) {
  this.func = func;
  this.delay = delay;
  this.start = function() {
    if (this.last) clearTimeout(this.last);
    this.last = setTimeout(this.func, this.delay);
  };
}

// /**
//  * generateRsync() returns a promise to run the rsync terminal command
//  * initially, it calls a helper function which gathers the arguments for rsync
//  * it then runs the rsync terminal command with the given arguments
//  * based on the passed in project object
//  *
//  * @param {Object} projObj
//  * @return {} returns a promise to run the rsync terminal command
//  */
// export function generateRsync(projObj, destMachine) {
//   const getArgs = co(function *g() {
//     const machineInfo = selectSSHandIP(yield machine.inspect(projObj[destMachine]));
//     const targetContainerId = getServerCont(projObj);
//     const dest = projObj.containers[targetContainerId].dest;
//     const cleanPath = cleanFilePath(projObj.basePath);
//
//     return createRsyncArgs(`${cleanPath}/`, dest, machineInfo);
//   });
//
//   const args = getArgs();
//
//   return co(function *g() {
//     return yield rsync(yield args);
//   });
// }
