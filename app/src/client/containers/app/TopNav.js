import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { redirect } from '../../actions/index';

const TopNav = ({ clickSettings, active, activeProject, projectName }) => {
  let clickActive = () => active('');
  if (activeProject.project) {
    clickActive = () => active('projects', activeProject.project.cleanName);
  }

  return (
    <div className="content-top-nav">
    {projectName}
     <div className="btn-group top-nav-btn-group" data-toggle="buttons">

       <label className="btn btn-primary active">
        <input type="radio" name="options" id="option1" autoComplete="off"></input>
          <img src="./client/images/png/sound.png"></img>
       </label>

       {/*<label className="btn btn-primary" onClick={clickActive}>
         <input type="radio" name="options" id="option2" autoComplete="off"></input>
           <img src="./client/images/png/circle.png"></img>
       </label>*/}

       <label className="btn btn-primary" onClick={clickSettings}>
         <input type="radio" name="options" id="option3" autoComplete="off"></input>
           <img src="./client/images/png/gear.png"></img>

       </label>
     </div>
    </div>
  );
};

TopNav.propTypes = {
  clickSettings: PropTypes.func.isRequired,
  active: PropTypes.func.isRequired,
  activeProject: PropTypes.object.isRequired,
  projectName: PropTypes.string,
};

function mapStateToProps(state, ownProps) {
  const { activeProject, projects } = state;
  const proj = ownProps.params.projectName;
  const projectName = proj ? projects[proj].projectName : '';
  return { activeProject, projectName };
}

function mapDispatchToProps(dispatch) {
  return {
    active: (...args) => dispatch(redirect(...args)),
    clickSettings: () => dispatch(redirect('settings')),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TopNav);


// var svgAStyle = {"stroke":"#660000", "fill":"none"};
//
//
// <svg xmlns="http://www.w3.org/2000/svg"
// xmlns="http://www.w3.org/1999/xlink">
//
//
//
//
// </svg>
