import fs from 'fs';
import childProcess from 'child_process';
import Promise from 'bluebird';
import rimraf from 'rimraf';

// promisify certain callback functions
export const mkdir = Promise.promisify(fs.mkdir);
export const writeFile = Promise.promisify(fs.writeFile);
export const readFile = Promise.promisify(fs.readFile);
export const exec = Promise.promisify(childProcess.exec);
export const rimrafProm = Promise.promisify(rimraf);

/**
 * find() returns an array of data using the 'find' terminal command
 * based on the passed in array of options for the 'find' terminal command
 *
 * @param {Array} array
 * @return {Array} 'find' results array
 */
export const find = (array) => {
  let result = '';
  const spawnFind = childProcess.spawn('find', array);

  spawnFind.stdout.on('data', data => {result += data;});

  return new Promise((resolve, reject) => {
    spawnFind.stderr.on('data', reject);
    spawnFind.stdout.on('close', () => {
      resolve(result.split('\n').slice(0, -1));
    });
  });
};

/**
 * jsonStringifyPretty() returns a string (JSON.stringify) with indent formatting
 * based on the passed in object
 *
 * @param {Object} obj
 * @return {String}
 */
export const jsonStringifyPretty = (obj) => JSON.stringify(obj, null, 2);

export const cleanName = (str) => str.replace(/[\W_]+/g, '').toLowerCase();

export const projectsObjToArray = (obj) => {
  const result = [];
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) result.push(obj[prop]);
  }
  return result;
};

export const addPath = (obj) => ({
  ...obj,
  PATH: '/usr/local/bin:/usr/bin',
  HOME: process.env.HOME,
});

// PATH: '/Users/samhagan/.rbenv/shims:/Users/samhagan/.rbenv/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/Library/TeX/texbin',
// TMPDIR: '/var/folders/d0/884kl82x5gs2wdphhwdm8vr40000gn/T/',
// LOGNAME: 'samhagan',
// XPC_FLAGS: '0x0',
// HOME: '/Users/samhagan',
// Apple_PubSub_Socket_Render: '/private/tmp/com.apple.launchd.wziLhNnOJu/Render',
// LANG: 'en_US.UTF-8',
// COLORFGBG: '7;0',
// USER: 'samhagan',
// SSH_AUTH_SOCK: '/private/tmp/com.apple.launchd.I0iayJm2HW/Listeners',
// TERM: 'xterm-256color',
// ITERM_PROFILE: 'Default',
// TERM_PROGRAM: 'iTerm.app',
// XPC_SERVICE_NAME: '0',
// SHELL: '/bin/zsh',
// ITERM_SESSION_ID: 'w0t0p1',
// PWD: '/Users/samhagan/dev/codesmith/DockDev/app/build/server/dockerAPI',
// __CF_USER_TEXT_ENCODING: '0x1F5:0x0:0x0',
// SHLVL: '1',
// OLDPWD: '/Users/samhagan/dev/codesmith/DockDev/app/build/server',
// ZSH: '/Users/samhagan/.oh-my-zsh',
// RBENV_SHELL: 'zsh',
// PAGER: 'less',
// LESS: '-R',
// LC_CTYPE: 'en_US.UTF-8',
// LSCOLORS: 'Gxfxcxdxbxegedabagacad',


// PATH: '/Users/samhagan/.rbenv/shims:/Users/samhagan/.rbenv/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/Library/TeX/texbin',
// function promisify(fun) {
//   return function(...args) {
//     return new Promise((resolve, reject) => {
//       args.push((err, result) => {
//         if (err) reject({ message: err.toString().substr(7), code: err.code });
//         else resolve(result);
//       });
//       fun.apply(null, args);
//     });
//   };
// }
