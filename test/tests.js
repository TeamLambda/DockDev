import { expect } from 'chai';
import { join } from 'path';
import rimraf from 'rimraf';
import { readFileSync, mkdirSync, readdirSync, writeFileSync } from 'fs';
import R from 'ramda';
import * as rsync from '../app/build/server/rsync.js';
import { addFileWatcher } from '../app/build/server/fileWatch.js';
import { removeContainer, addContainer } from '../app/build/server/container.js';
import * as projConfig from '../app/build/server/projConfig.js';
import defaultConfig from '../app/build/server/defaultConfig.js';

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
=======
import * as defaultConfig from '../app/build/server/defaultConfig.js';
>>>>>>> 4dff9998496b4d51db2f8364acaabd7fe0d3be26

describe('initiate new DockDev project via individual functions', () => {
  const projectName = 'project1';
  const basePath = join(__dirname, 'userFolder', projectName);
  // const dockDevPath = join(basePath, '.dockdev');
  let result;
  let projObj;

  before(() => {
    // make sure there is a userFolder
    try { mkdirSync(join(__dirname, 'userFolder')); }
    catch (e) {}

    // remove project projFolder if it exists
    rimraf.sync(basePath);

    // add back the project projFolder
    mkdirSync(basePath);
  });

  it('createProj should create a config object with a unique id and project name', () => {
    projObj = projConfig.createProj(basePath, projectName);
    expect(projObj.projectName).to.equal(projectName);
    expect(projObj.uuid).to.be.a('string');
    expect(projObj.basePath).to.be.a('string');
    expect(projObj.basePath).to.equal(basePath);
  });

  it('createDockDev should create .dockdev projFolder when none exists', () => {
    result = projConfig.createDockDev(projObj);
    return result.then(() => {
      expect(readdirSync(join(projObj.basePath, defaultConfig.projFolder))).to.be.empty;
    });
  });

  it('writeProj should write a specified object to the configFile', () => {
    return projConfig.writeProj(projObj)
      .then(() => readFileSync(join(projObj.basePath, '.dockdev', 'dockdev.json')))
      .then(R.toString)
      .then(JSON.parse)
      .then(data => expect(data).to.deep.equal(R.pick(defaultConfig.projWriteParams, projObj)));
  });

  it('createDockDev should fail when the projFolder already exists', () => {
    const tryAgain = projConfig.createDockDev(projObj);
    return tryAgain
    .then(
      data => expect(data).to.equal(undefined),
      err => expect(err.code).to.equal('EEXIST')
    );
  });
});

describe('initiate new DockDev project via initiateProject', () => {
  const projectName = 'project2';
  const basePath = join(__dirname, 'userFolder', projectName);
  // const dockDevPath = join(basePath, '.dockdev');
  let result;

  before(() => {
    // make sure there is a userFolder
    try { mkdirSync(join(__dirname, 'userFolder')); }
    catch (e) {}

    // remove project projFolder if it exists
    rimraf.sync(basePath);

    // add back the project projFolder
    mkdirSync(basePath);
  });

  it('should create a projObj', () => {
    result = projConfig.initProject(basePath, projectName);
    return result
      .then(data => {
        expect(data).to.be.an('object');
        expect(data.uuid).to.be.a('string');
        expect(data.projectName).to.equal(projectName);
        expect(data.basePath).to.equal(basePath);
      });
  });

  it('should write the config file to dockdev.json', () => {
    return result
      .then(() => readFileSync(join(basePath, '.dockdev', 'dockdev.json')))
      .then(R.toString)
      .then(JSON.parse)
      .then(data => result.then(orig =>
        expect(R.pick(defaultConfig.projWriteParams, orig)).to.deep.equal(data)));
  });

  it('should fail if a project already exists', () => {
    return projConfig.initProject(basePath, projectName)
      .then(data => expect(data).to.be(undefined))
      .catch(err => expect(err.code).to.equal('EEXIST'));
  });
});

describe('read and modify an existing project', () => {
  const projectName = 'project3';
  const basePath = join(__dirname, 'userFolder', projectName);
  // const dockDevPath = join(basePath, '.dockdev');
  let result;

  before(() => {
    // make sure there is a userFolder
    try { mkdirSync(join(__dirname, 'userFolder')); }
    catch (e) {}

    // remove project projFolder if it exists
    rimraf.sync(basePath);

    // add back the project projFolder
    mkdirSync(basePath);

    result = projConfig.initProject(basePath, projectName);
  });

  // this should probably be moved to the existing project tests (project2)
  it('readProj should read an existing config file returning an object', () => {
    return result
    .then(data => projConfig.readProj(data.basePath))
    .then(data => result.then(orig => expect(data).to.deep.equal(orig)));
  });
});

// describe('find our target files in specified directory', () => {
//
//
// })


describe('add and modify containers within a project', () => {
  const projectName = 'project4';
  const basePath = join(__dirname, 'userFolder', projectName);
  // const dockDevPath = join(basePath, '.dockdev');
  const image = 'node';
  let result;
  let containerId;

  before(() => {
    // make sure there is a userFolder
    try { mkdirSync(join(__dirname, 'userFolder')); }
    catch (e) {}

    // remove project projFolder if it exists
    rimraf.sync(basePath);

    // add back the project projFolder
    mkdirSync(basePath);

    result = projConfig.initProject(basePath, projectName);
  });

  it('should add a container to the project', (done) => {
    return result
      .then(data => addContainer(data, image))
      .then(id => {
        containerId = id;
        expect(containerId).to.not.equal(undefined);
        result.then(data => {
          expect(data.containers[containerId].image).to.equal(image);
          expect(data.containers[containerId].containerId).to.equal(containerId);
<<<<<<< HEAD
          done();
=======
>>>>>>> 4dff9998496b4d51db2f8364acaabd7fe0d3be26
        });
      });
  });

  it('should delete a container from a project', () => {
    return result
      .then(data => removeContainer(data, containerId))
      .then(data => {
        expect(data).to.equal(true);
        expect(data.containers).to.be.empty;
      });
  });
});


describe('should sync files to docker machine', () => {
  const projectName = 'project5';
  const basePath = join(__dirname, 'userFolder', projectName);
  // const dockDevPath = join(basePath, '.dockdev');
  const image = 'node';
  let result;
  let containerId;

  before(() => {
    // make sure there is a userFolder
    try { mkdirSync(join(__dirname, 'userFolder')); }
    catch (e) {}

    // remove project projFolder if it exists
    rimraf.sync(basePath);

    // add back the project projFolder
    mkdirSync(basePath);

    containerId = projConfig.initProject(basePath, projectName)
      .then(data => {
        result = data;
        return addContainer(data, image);
      });
  });

  it('should sync folder to docker-machine', () => {
    return containerId
      .then(id => {
        const syncFunc = rsync.generateRsync(result);
        writeFileSync(join(result.basePath, 'test.txt'));
        return syncFunc();
      });
  });

  it('should watch and sync files to the docker-machine', (done) => {
    return containerId
      .then(id => {
        addFileWatcher(result);
        writeFileSync(join(result.basePath, 'test1.txt'));
        writeFileSync(join(result.basePath, 'test2.txt'));
        writeFileSync(join(result.basePath, 'test3.txt'));
        writeFileSync(join(result.basePath, 'test4.txt'));
        writeFileSync(join(result.basePath, 'test10.txt'));

        setTimeout(done, 1900);
        expect(true).to.be.true;
        return;
      });
<<<<<<< HEAD
  });
=======
  });
});

xdescribe('should write a config file', () => {
  let result;
  const basePath = join(__dirname, 'configFolder');

// need to delete the configFolder and File before, then run the
  before(() => {
    try { mkdirSync(basePath); }
    catch (e) {}

    // remove configFolder if it exists
    rimraf.sync(basePath);

    // will create in basePath and also searches for projectFolders in the test directory
    projConfig.writeConfig(__dirname, basePath);
    result = readFileSync(defaultConfig.configPath(basePath));
  });

  // this should probably be moved to the existing project tests (project2)
  it('writeConfig should write a file', () => {
    return result
      .then(data => {
        expect(data.userSelectedDirectory).to.equal(process.env.HOME);
        expect(data.projects).to.be.empty;
      });
  });
>>>>>>> 4dff9998496b4d51db2f8364acaabd7fe0d3be26
});
