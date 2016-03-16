import { expect } from 'chai';
import * as utils from '../app/lib/utils.js';
import { join } from 'path';
import rimraf from 'rimraf';
import { readFileSync, mkdirSync, readdirSync } from 'fs';
import R from 'ramda';

describe('initiate new DockDev project via individual functions', () => {
  const projectName = 'project1'
  const basePath = join(__dirname, 'userFolder', projectName);
  const dockDevPath = join(basePath, '.dockdev');
  let result;
  let projObj;

  before(() => {
    // make sure there is a userFolder
    try { mkdirSync(join(__dirname, 'userFolder')) }
    catch (e) {}

    // remove project projFolder if it exists
    rimraf.sync(basePath);

    // add back the project projFolder
    mkdirSync(basePath);
  });

  it('createProj should create a config object with a unique id and project name', () => {
    projObj = utils.createProj(basePath, projectName);
    expect(projObj.projectName).to.equal(projectName);
    expect(projObj.uuid).to.be.a('string');
    expect(projObj.basePath).to.be.a('string');
    expect(projObj.basePath).to.equal(basePath);
  })

  it('createDockDev should create .dockdev projFolder when none exists', () => {
    result = utils.createDockDev(projObj);
    return result.then(() => {
      expect(readdirSync(join(projObj.basePath, utils.config.projFolder))).to.be.empty;
    });
  });

  it('writeProj should write a specified object to the configFile', () => {
    return utils.writeProj(projObj)
      .then(() => readFileSync(join(projObj.basePath, '.dockdev', 'dockdev.json')))
      .then(R.toString)
      .then(JSON.parse)
      .then(data => expect(data).to.deep.equal(R.pick(utils.config.projWriteParams, projObj)));
  })

  it('addProjToMemory should add the config object to the apps memory object', () => {
    utils.addProjToMemory(utils.memory, projObj);
    expect(utils.memory[projObj.uuid]).to.equal(projObj);
  })

  it('createDockDev should fail when the projFolder already exists', () => {
    const tryAgain = utils.createDockDev(projObj);
    return tryAgain
    .then(
      data => expect(data).to.equal(undefined),
      err => expect(err.code).to.equal('EEXIST')
    )
  })
});

describe('initiate new DockDev project via initiateProject', () => {
  const projectName = 'project2'
  const basePath = join(__dirname, 'userFolder', projectName);
  const dockDevPath = join(basePath, '.dockdev');
  let result;

  before(() => {
    // make sure there is a userFolder
    try { mkdirSync(join(__dirname, 'userFolder')) }
    catch (e) {}

    // remove project projFolder if it exists
    rimraf.sync(basePath);

    // add back the project projFolder
    mkdirSync(basePath);
  });

  it('should create a projObj', () => {
    result = utils.initProject(basePath, projectName);
    return result
      .then(data => {
        expect(data).to.be.an('object');
        expect(data.uuid).to.be.a('string');
        expect(data.projectName).to.equal(projectName);
        expect(data.basePath).to.equal(basePath);
      });
  })

  it('should write the config file to dockdev.json', () => {
    return result
      .then(() => readFileSync(join(basePath, '.dockdev', 'dockdev.json')))
      .then(R.toString)
      .then(JSON.parse)
      .then(data => result.then(orig => expect(R.pick(utils.config.projWriteParams, orig)).to.deep.equal(data)))
  })

  it('should add the config to app memory', () => {
    return result
      .then(data => expect(data).to.equal(utils.memory[data.uuid]))
  })

  it('should fail if a project already exists', () => {
    return utils.initProject(basePath, projectName)
      .then(data => expect(data).to.be(undefined))
      .catch(err => expect(err.code).to.equal('EEXIST'))
  })

})

describe('read and modify an existing project', () => {
  const projectName = 'project3'
  const basePath = join(__dirname, 'userFolder', projectName);
  const dockDevPath = join(basePath, '.dockdev');
  let result;

  before(() => {
    // make sure there is a userFolder
    try { mkdirSync(join(__dirname, 'userFolder')) }
    catch (e) {}

    // remove project projFolder if it exists
    rimraf.sync(basePath);

    // add back the project projFolder
    mkdirSync(basePath);

    result = utils.initProject(basePath, projectName);
  });

  // this should probably be moved to the existing project tests (project2)
  it('readProj should read an existing config file returning an object', () => {
    return result
    .then(data => utils.readProj(data.basePath))
    .then(data => result.then(orig => expect(data).to.deep.equal(orig)))
  })

})

describe('find our target files in specified directory', () => {


})
