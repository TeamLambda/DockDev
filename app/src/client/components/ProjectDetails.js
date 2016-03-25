import React from 'react';
import R from 'ramda';
import Container from './Container';

const ProjectDetail = ({ projects, params }) => {
  const proj = projects[params.uuid];
  const containers = R.toPairs(proj.containers)
    .map(container => <Container key={container[0]} details={container} />);
  return (
    <div className="project-details">
      <h1 className="display-4 text-capitalize">
        {proj.projectName} Details
      </h1>
      <button>Start</button>
      <button>Stop</button>
      <button>Restart</button>
      <button>Delete</button>
      <p className="lead">
        All the awesome information about your project,
        container, are right here.  Take a look around.
      </p>
      <ul>
        {containers}
      </ul>
    </div>
  );
};

ProjectDetail.propTypes = {
  projects: React.PropTypes.object,
  params: React.PropTypes.object
};

export default ProjectDetail;
