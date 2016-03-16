'use strict';

import { spawn } from 'fs';
import { cmdLine, machines, readFile } from './utils.js';
import { coroutine as co } from 'bluebird';

// dockerMachine :: string -> promise(string)
// accepts an array of cmd line args for docker-machine
// returns a promise that resolves to the stdout
export const exec = cmdLine('docker-machine');

/**
* inspect :: string -> promise(object)
* accepts a machine name and returns the inspect results
*/
export const inspect = (machineName) => exec(`inspect ${ machineName }`);

export const env = (machineName) => exec(`env ${ machineName }`);

/**
* config :: string -> promise(object)
* accepts a machine name and returns the parsed config results
*/
export const config = co(function *(machineName) {
  const result = JSON.parse(yield inspect(machineName));
  const configObj = {
    uri: `https://${ result.Driver.IPAddress }:2376`,
    cert: (yield readFile(`${ result.HostOptions.AuthOptions.ClientCertPath }`)).toString(),
    key: (yield readFile(`${ result.HostOptions.AuthOptions.ClientKeyPath }`)).toString(),
    ca: (yield readFile(`${ result.HostOptions.AuthOptions.CaCertPath }`)).toString()
  }
  return configObj;
});

// creates a Droplet on DigitalOcean
//** promisify this function
const createDroplet = (accessToken, dropletName) => {
 dropletName = "test9";
 accessToken = 'eedf80c21a790ed8328a1f64447a2b239ba98c8137051a362b8bee89530968a7';
 return spawn('docker-machine', ['create', '--driver', 'digitalocean', '--digitalocean-access-token', accessToken, dropletName]);
}

// also stops a Droplet on digitalocean
const stopMachine = machineName => dockerMachine(`stop ${ machineName }`);

// also removes a Droplet on DigitalOcean
const removeMachine = machineName => dockerMachine(`rm -y ${ machineName }`);
