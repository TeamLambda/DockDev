'use strict'

import { cmdLine } from './utils.js';

const docker = cmdLine('docker');

const dockerStart = (container_name) => {
 return docker(`start ${ container_name }`);
}

dockerStart('angry_heisenberg').then(console.log);

const dockerStop = (container_name) => {
 docker(['stop', container_name]);
}

// alternatively we can use docker create and then docker start
const dockerRun = (network, image_name) => {
 docker(['run', '-itd', `'--net=${network}'`, image_name]);
}

const dockerSearch = (imageSearch) => {
 docker(['search', imageSearch]);
}

// will compose with dockerSearch
const dockerPull = (imageToPull) => {
 docker(['pull', imageToPull]);
}

// what other options to add for this?
const dockerCommit = (container_id, image_name, tag) => {
 docker(['commit', container_id, `'${image_name}:${tag}'`])
}

// can't get rsync to copy images - this is slow but it works
// how to manage password input for automated process??
const copyImages = (image_name, user, ip_address) => {
 docker([`save ${image_name} | bzip2 |  ssh ${user}@${ip_address} 'bunzip2 | docker load'`]);
}

// things to work on:

// 1: creating docker networks
const dockerNetworkCreate = (newNetworkName) => {
 docker(['network', 'create', '-d', 'bridge', newNetworkName]);
}
