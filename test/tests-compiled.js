'use strict';

var _chai = require('chai');

var _utils = require('../app/lib/utils.js');

var utils = _interopRequireWildcard(_utils);

var _path = require('path');

var _rimraf = require('rimraf');

var _rimraf2 = _interopRequireDefault(_rimraf);

var _fs = require('fs');

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

describe('initiate new DockDev project via individual functions', () => {
  const projectName = 'project1';
  const basePath = (0, _path.join)(__dirname, 'userFolder', projectName);
  const dockDevPath = (0, _path.join)(basePath, '.dockdev');
  let result;
  let projObj;

  before(() => {
    // make sure there is a userFolder
    try {
      (0, _fs.mkdirSync)((0, _path.join)(__dirname, 'userFolder'));
    } catch (e) {}

    // remove project projFolder if it exists
    _rimraf2.default.sync(basePath);

    // add back the project projFolder
    (0, _fs.mkdirSync)(basePath);
  });

  it('createProj should create a config object with a unique id and project name', () => {
    projObj = utils.createProj(basePath, projectName);
    (0, _chai.expect)(projObj.projectName).to.equal(projectName);
    (0, _chai.expect)(projObj.uuid).to.be.a('string');
    (0, _chai.expect)(projObj.basePath).to.be.a('string');
    (0, _chai.expect)(projObj.basePath).to.equal(basePath);
  });

  it('createDockDev should create .dockdev projFolder when none exists', () => {
    result = utils.createDockDev(projObj);
    return result.then(() => {
      (0, _chai.expect)((0, _fs.readdirSync)((0, _path.join)(projObj.basePath, utils.config.projFolder))).to.be.empty;
    });
  });

  it('writeProj should write a specified object to the configFile', () => {
    return utils.writeProj(projObj).then(() => (0, _fs.readFileSync)((0, _path.join)(projObj.basePath, '.dockdev', 'dockdev.json'))).then(_ramda2.default.toString).then(JSON.parse).then(data => (0, _chai.expect)(data).to.deep.equal(_ramda2.default.pick(utils.config.projWriteParams, projObj)));
  });

  it('addProjToMemory should add the config object to the apps memory object', () => {
    utils.addProjToMemory(utils.memory, projObj);
    (0, _chai.expect)(utils.memory[projObj.uuid]).to.equal(projObj);
  });

  it('createDockDev should fail when the projFolder already exists', () => {
    const tryAgain = utils.createDockDev(projObj);
    return tryAgain.then(data => (0, _chai.expect)(data).to.equal(undefined), err => (0, _chai.expect)(err.code).to.equal('EEXIST'));
  });
});

describe('initiate new DockDev project via initiateProject', () => {
  const projectName = 'project2';
  const basePath = (0, _path.join)(__dirname, 'userFolder', projectName);
  const dockDevPath = (0, _path.join)(basePath, '.dockdev');
  let result;

  before(() => {
    // make sure there is a userFolder
    try {
      (0, _fs.mkdirSync)((0, _path.join)(__dirname, 'userFolder'));
    } catch (e) {}

    // remove project projFolder if it exists
    _rimraf2.default.sync(basePath);

    // add back the project projFolder
    (0, _fs.mkdirSync)(basePath);
  });

  it('should create a projObj', () => {
    result = utils.initProject(basePath, projectName);
    return result.then(data => {
      (0, _chai.expect)(data).to.be.an('object');
      (0, _chai.expect)(data.uuid).to.be.a('string');
      (0, _chai.expect)(data.projectName).to.equal(projectName);
      (0, _chai.expect)(data.basePath).to.equal(basePath);
    });
  });

  it('should write the config file to dockdev.json', () => {
    return result.then(() => (0, _fs.readFileSync)((0, _path.join)(basePath, '.dockdev', 'dockdev.json'))).then(_ramda2.default.toString).then(JSON.parse).then(data => result.then(orig => (0, _chai.expect)(_ramda2.default.pick(utils.config.projWriteParams, orig)).to.deep.equal(data)));
  });

  it('should add the config to app memory', () => {
    return result.then(data => (0, _chai.expect)(data).to.equal(utils.memory[data.uuid]));
  });

  it('should fail if a project already exists', () => {
    return utils.initProject(basePath, projectName).then(data => (0, _chai.expect)(data).to.be(undefined)).catch(err => (0, _chai.expect)(err.code).to.equal('EEXIST'));
  });
});

describe('read and modify an existing project', () => {
  const projectName = 'project3';
  const basePath = (0, _path.join)(__dirname, 'userFolder', projectName);
  const dockDevPath = (0, _path.join)(basePath, '.dockdev');
  let result;

  before(() => {
    // make sure there is a userFolder
    try {
      (0, _fs.mkdirSync)((0, _path.join)(__dirname, 'userFolder'));
    } catch (e) {}

    // remove project projFolder if it exists
    _rimraf2.default.sync(basePath);

    // add back the project projFolder
    (0, _fs.mkdirSync)(basePath);

    result = utils.initProject(basePath, projectName);
  });

  // this should probably be moved to the existing project tests (project2)
  it('readProj should read an existing config file returning an object', () => {
    return result.then(data => utils.readProj(data.basePath)).then(data => result.then(orig => (0, _chai.expect)(data).to.deep.equal(orig)));
  });
});

describe('find our target files in specified directory', () => {});
