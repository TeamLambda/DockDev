/*eslint-env mocha */
import { expect } from 'chai';
import { join } from 'path';
import * as rsync from '../../app/build/server/projLevel/rsync.js';
import * as deploy from '../../app/build/server/projLevel/deploy.js';
import * as docker from '../../app/build/server/projLevel/deploy.js';
import * as containerMgmt from '../../app/build/server/projLevel/containerMgmt.js';
import { removeMachine } from '../../app/build/server/dockerAPI/machine.js';
import rimraf from 'rimraf';

const genBasePath = (projectName) => join(__dirname, '..', '..', 'example-deploy', projectName);

// this will test provisioning a droplet which takes significant time
// suggest that it remain pending unless specifically modifying the function
xdescribe('provision digitalocean droplet', function test() {
  this.timeout(600000);
  const dropName = 'test';
  // need to add grab token from a specified file
  after(() => removeMachine('test'));

  it('should provision a default droplet', () =>
    deploy.createDroplet(dropName, DOtoken)
      .then(data => expect(data).to.be.a.string)
  );
});

// for speed this deploys to an already created local docker-machine
// you need to create a virtual box machine named 'test' for these to work
// you should also pull node, redis, and mongo
describe('deploy containers to test machine', () => {
  const projectPath = genBasePath('deploy');

  before(() => {
    // delete the Dockerfile if there
    rimraf.sync(join(projectPath, 'Dockerfile'));
  });

  it('should create a dockerfile', () => {
    const containers = [
      {
        server: true,
        image: 'node',
      },
    ];
    return deploy.createDockerfile(containers, projectPath)
      .then(res => expect(res).to.be.true);
  });


  it('should sync files to remote machine', () =>
    deploy.syncFilesToRemote(projectPath, 'test2', true)
      .then(res => expect(res).to.be.true)
  );

  it('should build the image on the remote machine', function build(done) {
    this.timeout(600000);
    return deploy.buildServerImage('proj2', {
      machine: 'test2',
      counter: 0,
    })
    .then(res => {
      done();
      return expect(res).to.be.true;
    });
  });
});
