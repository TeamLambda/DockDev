import React from 'react';
import { remote } from 'electron';
import { connect } from 'react-redux';
import { addProject } from '../../actions/index';

const AddProject = ({ submit }) => {
  let projectName;
  let projectPath;

  const popFileSelector = () => {
    projectPath = remote.dialog
      .showOpenDialog({ properties: ['openDirectory', 'createDirectory'] })[0];
  };

  const projNameHandler = event => { projectName = event.target.value; };

  return (
    <div className="full-page">
      <div className="settings-content">
        <h3>Add Project</h3>
        <div className="col-xs-12 form-input-spacing">
          <input
            className="form-control form-control-lg border-bottom-input"
            type="text"
            placeholder="Name"
            onChange={projNameHandler}
            />
        </div>
        <div className="col-xs-12 form-input-spacing">
          <label className="file width-12">
            <input type="file" id="file" />
            <span className="file-custom border-bottom-input" onClick={popFileSelector}></span>
          </label>
        </div>
        <div className="col-xs-6">
          Cancel
        </div>
        <div className="col-xs-6">
          <button className="btn btn-primary-outline btn-block"
            onClick={() => {submit(projectPath, projectName);}}
            >
            Add
          </button>
        </div>
      </div>

    </div>

  );
};

const mapStateToProps = (state) => state;

const mapDispatchToProps = (dispatch) => ({
  submit: (path, name) => {
    dispatch(addProject(path, name));
  },
});

AddProject.propTypes = {
  submit: React.PropTypes.func,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddProject);
