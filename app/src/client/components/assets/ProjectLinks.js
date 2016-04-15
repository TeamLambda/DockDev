import React from 'react';
import { Link } from 'react-router';
import { utils } from './server/main';
import NavLink from './NavLink';

const ProjectLinks = ({ projects }) => {
  const projArray = utils.projectsObjToArray(projects);
  const projLinks = projArray.map((proj, idx) => (
      <li key={idx} className="nav-item">
        <Link className="nav-link" to={`/projects/${proj.cleanName}`}>{proj.projectName}</Link>
      </li>
    )
  );

  return (
    <ul role="nav" id="menu" className="nav">
      <li className="nav-item proj-anchor">
        <NavLink to="/" onlyActiveOnIndex>
          <label>
            Projects
          </label>
        </NavLink>
      </li>
      <li className="add-proj-wrapper">
        <NavLink to="/addProject" className="add-proj-icon">
          <img src="./client/images/png/Add-01.png"></img>
        </NavLink>
      </li>
      <div id="projectMenu">
        <ul className="nav">
          {projLinks}
        </ul>
      </div>
    </ul>
  );
};

ProjectLinks.propTypes = {
  projects: React.PropTypes.object,
};

export default ProjectLinks;
