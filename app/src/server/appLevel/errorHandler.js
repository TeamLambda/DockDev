import { coroutine as co } from 'bluebird';
import moment from 'moment';
import * as utils from '../utils/utils';
import defaultConfig from '../appLevel/defaultConfig';

function ErrorMessage(from, error, args) {
  this.time = moment().format('MM-D-YYYY, h:mm:ss a');
  this.from = from;
  this.message = error;
  this.args = args;
}

/**
* errorHandler() accepts an error payload (i) calling function/action name, (ii) error message,
* and (iii) type (fatal/warning)
* it will write the error to disk and optionally redirect the error to the client UI
* @param {string} calling function/action
* @param {Object} error
* @param {Function} clientCallback
* @return {String} complete
*/
const errorHandler = co(function *g(from, error, args) {
  // read existing error log if it exists
  let errorLog;
  try {
    errorLog = JSON.parse(yield utils.readFile(defaultConfig.errorLogPath()));
  } catch (e) {
    errorLog = [];
  }

  // add to log & write back to file
  const errorObj = new ErrorMessage(from, error, args);
  errorLog.push(errorObj);
  yield utils.writeFile(defaultConfig.errorLogPath(), utils.jsonStringifyPretty(errorLog));

  return errorObj;
});

export default errorHandler;
