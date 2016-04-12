import React, { PropTypes } from 'react';
import { Link } from 'react-router';

const ProjNavLinks = ({ cleanName }) => (
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
      <a className="dropdown-item" href="#">Delete </a>
    </div>
  </div>
);

ProjNavLinks.propTypes = {
  cleanName: PropTypes.string,
};

export default ProjNavLinks;
