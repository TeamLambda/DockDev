import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { clickDeployRemote, clickDeleteRemote, clickUpdateRemote } from '../../actions/index';

const ProjectDeploy = ({ deployProject, updateProject, remote, deleteProject }) => {
  const notifTable = [
    'Provisioning Digital Ocean droplet',
    'Building server image',
    'Pulling database and proxy server images',
    'Creating containers on remote host',
    'Starting containers',
    'Project is deployed!',
    '',
  ];

  const btn = remote.machine ?
    (<button onClick={updateProject}>Update</button>) :
    (<button onClick={deployProject}>Deploy</button>);
  const ipAddress = remote.machine ?
    (<div>Remote IP Address: {remote.ipAddress}</div>) :
    (<div>This project is not deployed!</div>);
  const notitification = remote.status !== undefined ?
    (<div>Status: {notifTable[remote.status]}</div>) :
    (<div></div>);

  return (
    <div>
      <div className="alert alert-success" role="alert">
        {btn}
        <button onClick={deleteProject}>Delete</button>
      </div>
      {ipAddress}
      {notitification}
    </div>
  );
};

function mapStateToProps(state, ownProps) {
  const { remote } = state.projects[ownProps.params.projectName];
  return { remote };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    deployProject: () => dispatch(clickDeployRemote(ownProps.params.projectName)),
    updateProject: () => dispatch(clickUpdateRemote(ownProps.params.projectName)),
    deleteProject: () => dispatch(clickDeleteRemote(ownProps.params.projectName)),
  };
}

ProjectDeploy.propTypes = {
  deployProject: PropTypes.func.isRequired,
  updateProject: PropTypes.func.isRequired,
  deleteProject: PropTypes.func.isRequired,
  remote: PropTypes.object,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectDeploy);
