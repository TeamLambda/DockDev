'use strict';

var _chai = require('chai');

var _path = require('path');

var _rimraf = require('rimraf');

var _rimraf2 = _interopRequireDefault(_rimraf);

var _fs = require('fs');

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _rsync = require('../app/build/server/rsync.js');

var rsync = _interopRequireWildcard(_rsync);

var _fileWatch = require('../app/build/server/fileWatch.js');

var _container = require('../app/build/server/container.js');

var _projConfig = require('../app/build/server/projConfig.js');

var projConfig = _interopRequireWildcard(_projConfig);

var _defaultConfig = require('../app/build/server/defaultConfig.js');

var _defaultConfig2 = _interopRequireDefault(_defaultConfig);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//
// describe('should write an app level config file', () => {
//   let result;
//   const basePath = join(__dirname, 'configFolder');
//
// // need to delete the configFolder and File before, then run the
//   before(() => {
//     // remove configFolder if it exists
//     rimraf.sync(basePath);
//
//     // will create in basePath and also searches for projectFolders in the test directory
//     mkdirSync(basePath);
//   });
//
//   // this should probably be moved to the existing project tests (project2)
//   it('writeConfig should write a file', () => {
//     appConfig.writeConfig(__dirname, basePath);
//     result = readFileSync(defaultConfig.configPath(basePath));
//     return result
//       .then(data => {
//         expect(data.userSelectedDirectory).to.equal(process.env.HOME);
//         expect(data.projects).to.be.empty;
//       });
//   });
// });

describe('initiate new DockDev project via individual functions', () => {
  const projectName = 'project1';
  const basePath = (0, _path.join)(__dirname, 'userFolder', projectName);
  // const dockDevPath = join(basePath, '.dockdev');
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
    projObj = projConfig.createProj(basePath, projectName);
    (0, _chai.expect)(projObj.projectName).to.equal(projectName);
    (0, _chai.expect)(projObj.uuid).to.be.a('string');
    (0, _chai.expect)(projObj.basePath).to.be.a('string');
    (0, _chai.expect)(projObj.basePath).to.equal(basePath);
  });

  it('createDockDev should create .dockdev projFolder when none exists', () => {
    result = projConfig.createDockDev(projObj);
    return result.then(() => {
      (0, _chai.expect)((0, _fs.readdirSync)((0, _path.join)(projObj.basePath, _defaultConfig2.default.projFolder))).to.be.empty;
    });
  });

  it('writeProj should write a specified object to the configFile', () => {
    return projConfig.writeProj(projObj).then(() => (0, _fs.readFileSync)((0, _path.join)(projObj.basePath, '.dockdev', 'dockdev.json'))).then(_ramda2.default.toString).then(JSON.parse).then(data => (0, _chai.expect)(data).to.deep.equal(_ramda2.default.pick(_defaultConfig2.default.projWriteParams, projObj)));
  });

  it('createDockDev should fail when the projFolder already exists', () => {
    const tryAgain = projConfig.createDockDev(projObj);
    return tryAgain.then(data => (0, _chai.expect)(data).to.equal(undefined), err => (0, _chai.expect)(err.code).to.equal('EEXIST'));
  });
});

describe('initiate new DockDev project via initiateProject', () => {
  const projectName = 'project2';
  const basePath = (0, _path.join)(__dirname, 'userFolder', projectName);
  // const dockDevPath = join(basePath, '.dockdev');
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
    result = projConfig.initProject(basePath, projectName);
    return result.then(data => {
      (0, _chai.expect)(data).to.be.an('object');
      (0, _chai.expect)(data.uuid).to.be.a('string');
      (0, _chai.expect)(data.projectName).to.equal(projectName);
      (0, _chai.expect)(data.basePath).to.equal(basePath);
    });
  });

  it('should write the config file to dockdev.json', () => {
    return result.then(() => (0, _fs.readFileSync)((0, _path.join)(basePath, '.dockdev', 'dockdev.json'))).then(_ramda2.default.toString).then(JSON.parse).then(data => result.then(orig => (0, _chai.expect)(_ramda2.default.pick(_defaultConfig2.default.projWriteParams, orig)).to.deep.equal(data)));
  });

  it('should fail if a project already exists', () => {
    return projConfig.initProject(basePath, projectName).then(data => (0, _chai.expect)(data).to.be(undefined)).catch(err => (0, _chai.expect)(err.code).to.equal('EEXIST'));
  });
});

describe('read and modify an existing project', () => {
  const projectName = 'project3';
  const basePath = (0, _path.join)(__dirname, 'userFolder', projectName);
  // const dockDevPath = join(basePath, '.dockdev');
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

    result = projConfig.initProject(basePath, projectName);
  });

  // this should probably be moved to the existing project tests (project2)
  it('readProj should read an existing config file returning an object', () => {
    return result.then(data => projConfig.readProj(data.basePath)).then(data => result.then(orig => (0, _chai.expect)(data).to.deep.equal(orig)));
  });
});

// describe('find our target files in specified directory', () => {
//
//
// })

describe('add and modify containers within a project', () => {
  const projectName = 'project4';
  const basePath = (0, _path.join)(__dirname, 'userFolder', projectName);
  // const dockDevPath = join(basePath, '.dockdev');
  const image = 'node';
  let result;
  let containerId;

  before(() => {
    // make sure there is a userFolder
    try {
      (0, _fs.mkdirSync)((0, _path.join)(__dirname, 'userFolder'));
    } catch (e) {}

    // remove project projFolder if it exists
    _rimraf2.default.sync(basePath);

    // add back the project projFolder
    (0, _fs.mkdirSync)(basePath);

    result = projConfig.initProject(basePath, projectName);
  });

  it('should add a container to the project', done => {
    return result.then(data => (0, _container.addContainer)(data, image)).then(id => {
      containerId = id;
      (0, _chai.expect)(containerId).to.not.equal(undefined);
      result.then(data => {
        (0, _chai.expect)(data.containers[containerId].image).to.equal(image);
        (0, _chai.expect)(data.containers[containerId].containerId).to.equal(containerId);
        done();
      });
    });
  });

  it('should delete a container from a project', () => {
    return result.then(data => (0, _container.removeContainer)(data, containerId)).then(data => {
      (0, _chai.expect)(data).to.equal(true);
      (0, _chai.expect)(data.containers).to.be.empty;
    });
  });
});

describe('should sync files to docker machine', () => {
  const projectName = 'project5';
  const basePath = (0, _path.join)(__dirname, 'userFolder', projectName);
  // const dockDevPath = join(basePath, '.dockdev');
  const image = 'node';
  let result;
  let containerId;

  before(() => {
    // make sure there is a userFolder
    try {
      (0, _fs.mkdirSync)((0, _path.join)(__dirname, 'userFolder'));
    } catch (e) {}

    // remove project projFolder if it exists
    _rimraf2.default.sync(basePath);

    // add back the project projFolder
    (0, _fs.mkdirSync)(basePath);

    containerId = projConfig.initProject(basePath, projectName).then(data => {
      result = data;
      return (0, _container.addContainer)(data, image);
    });
  });

  it('should sync folder to docker-machine', () => {
    return containerId.then(id => {
      const syncFunc = rsync.generateRsync(result);
      (0, _fs.writeFileSync)((0, _path.join)(result.basePath, 'test.txt'));
      return syncFunc();
    });
  });

  it('should watch and sync files to the docker-machine', done => {
    return containerId.then(id => {
      (0, _fileWatch.addFileWatcher)(result);
      (0, _fs.writeFileSync)((0, _path.join)(result.basePath, 'test1.txt'));
      (0, _fs.writeFileSync)((0, _path.join)(result.basePath, 'test2.txt'));
      (0, _fs.writeFileSync)((0, _path.join)(result.basePath, 'test3.txt'));
      (0, _fs.writeFileSync)((0, _path.join)(result.basePath, 'test4.txt'));
      (0, _fs.writeFileSync)((0, _path.join)(result.basePath, 'test10.txt'));

      setTimeout(done, 1900);
      // need to add test here
      return;
    });
  });
});

xdescribe('should write a config file', () => {
  let result;
  const basePath = (0, _path.join)(__dirname, 'configFolder');

  // need to delete the configFolder and File before, then run the
  before(() => {
    try {
      (0, _fs.mkdirSync)(basePath);
    } catch (e) {}

    // remove configFolder if it exists
    _rimraf2.default.sync(basePath);

    // will create in basePath and also searches for projectFolders in the test directory
    projConfig.writeConfig(__dirname, basePath);
    result = (0, _fs.readFileSync)(_defaultConfig2.default.configPath(basePath));
  });

  // this should probably be moved to the existing project tests (project2)
  it('writeConfig should write a file', () => {
    return result.then(data => {
      (0, _chai.expect)(data.userSelectedDirectory).to.equal(process.env.HOME);
      (0, _chai.expect)(data.projects).to.be.empty;
    });
  });
});