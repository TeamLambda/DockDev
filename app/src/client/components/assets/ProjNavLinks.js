import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { clickRemoveProject, redirect } from '../../actions/index';

const ProjNavLinks = ({ cleanName, remove }) => (
  <div className="btn-group">
    <button type="button" className="btn btn-info-outline dropdown-toggle"
      data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
    >
      <span className="sr-only">Toggle Dropdown</span>
    </button>
    <div className="dropdown-menu">
      <ul>
        <li>
          <Link className="nav-link" to={`/projects/${cleanName}/container`}>Add</Link>
        </li>
        <li>
          <Link className="nav-link" to={`/projects/${cleanName}/deploy`}>Deploy</Link>
        </li>
      </ul>
      <div className="dropdown-divider"></div>
      <button className="dropdown-item" onClick={remove}>Delete</button>
    </div>
  </div>
);

ProjNavLinks.propTypes = {
  cleanName: PropTypes.string.isRequired,
  remove: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return state;
}

function mapDispatchToProps(dispatch, ownProps) {
  const { cleanName } = ownProps;
  return {
    remove: () => {
      dispatch(clickRemoveProject(cleanName));
      return dispatch(redirect(''));
    },
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjNavLinks);
