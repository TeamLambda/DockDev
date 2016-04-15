import React, { PropTypes } from 'react';

const ProjectNav = (props) => (
  <div >
    <div className="proj-nav">
      <div className="col-xs-4 proj-detail-title" style={{ padding: '0px' }}>
        <h5 className="text-capitalize">
          test
        </h5>
      </div>
    </div>
    {React.cloneElement(props.children, props)}
  </div>
);

ProjectNav.propTypes = {
  children: PropTypes.object.isRequired,
};

export default ProjectNav;
