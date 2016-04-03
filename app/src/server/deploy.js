import { spawn } from 'child_process';
import Promise from 'bluebird';
import defaultConfig from './defaultConfig';
import { ssh } from './machine.js';
import { generateRsync } from './rsync.js';
import { writeFile } from './utils.js';
import { coroutine as co } from 'bluebird';

/**
 * getOceanToken() returns the accessToken provided by the user after storing it
 * based on the passed in accessToken from the user
 *
 * @param {String} accessToken
 * @return {String} defaultConfig.DOToken
 */
function storeOceanToken(accessToken) {
  defaultConfig.DOToken = accessToken;
  return defaultConfig.DOToken;
}

/**
 * dropletOnOcean() returns a promise to create a droplet on DigitalOcean
 * based on the passed in accessToken and dropletMachName
 *
 * @param {String} accessToken
 * @param {String} dropletMachName
 * @return {} returns a promise to create a droplet on DigitalOcean
 */
function dropletOnOcean(DOToken, dropletMachName) {
  let result = '';
  const createDroplet = spawn('docker-machine',
    ['create', '--driver', 'digitalocean',
    '--digitalocean-access-token', DOToken, dropletMachName]);

  createDroplet.stdout.on('data', data => { result += data; });

  return new Promise((resolve, reject) => {
    createDroplet.stderr.on('data', reject);
    createDroplet.stdout.on('close', () => {
      resolve(result);
    });
  });
}

/**
 * getDbNames() returns the images and names of all the database in the project
 * based on the passed in project object
 *
 * @param {Object} projObj
 * @return {Array} dbImageNames
 */
function getDbNames(projObj) {
  const dbImageNames = [];
  for (const contId in projObj.containers) {
    if (!projObj.containers[contId].server) {
      dbImageNames.push(projObj.containers[contId].image);
      dbImageNames.push(projObj.containers[contId].name);
    }
  }
  return dbImageNames;
}

/**
 * pullImagesOcean() returns true after pulling and running all the db images on DigitalOcean
 * based on the passed in digital ocean machine neame and array of db images and names
 *
 * @param {String} dropletMachName
 * @param {Array} dbNamesArr
 * @return {Boolean} true
 */
const pullImagesOcean = co(function *g(dropletMachName, dbNamesArr) {
  for (let i = 0; i < dbNamesArr.length; i += 2) {
    try {
      yield ssh(dropletMachName, `docker run -d --name ${dbNamesArr[i + 1]} ${dbNamesArr[i]}`);
    } catch (e) {
      console.log(e);
    }
  }
  return true;
});

/**
 * buildDockerFile() returns true after creating a Dockerfile
 *
 * @return {Boolean} true
 */
const buildDockerFile = co(function *g() {
  // what if they deploy twice and it already exists??
  yield writeFile('../Dockerfile',
    "From node:latest\nCOPY . /app\nWORKDIR /app\nRUN ['npm', 'install']\nCMD ['npm', 'start']"
  );
  return true;
});

/**
 * deployToOcean() returns true after walking through a sequence of events to deploy
 * a project to digital ocean
 * based on the passed in project object, remote machine name, and access token
 *
 * @param {Object} projObj
 * @param {String} accessToken
 * @return {Boolean} true
 */
export const deployToOcean = co(function *g(projObj, accessToken) {
  const remoteMachName = projObj.projectName.replace(' ', '_');
  const Token = storeOceanToken(accessToken);
  yield dropletOnOcean(Token, remoteMachName);
  const dbNamesArray = getDbNames(projObj);
  yield pullImagesOcean(remoteMachName, dbNamesArray);
  yield buildDockerFile();
  const remoteSync = generateRsync(projObj, 'remoteMachine');
  yield remoteSync;
  yield ssh(remoteMachName, 'docker build .');
  return true;
});

// /var/lib/docker/tmp
// const DO = 'eedf80c21a790ed8328a1f64447a2b239ba98c8137051a362b8bee89530968a7'
