import React from 'react';
// import TopNavList from './TopNavList.js';
import ProjectList from './ProjectList.js';
import BottomNavList from './BottomNavList.js';


// SIDEMENU ////////////////////////////////////
// NOTE : Ul element where the side navigation and project list will populate
// Relationship: App > Sidemenu
// Children: TopNavList, ProjectList, BottomNavList
// /////////////////////////////////////////////
const SideMenu = ({projects, addProject, settingsClick}) => {
  return (
    <div className="pane-sm sidebar">
      <ProjectList projects={projects} addProject={addProject} />
      <BottomNavList settingsClick={settingsClick}/>
    </div>
  )
}

export default SideMenu;
