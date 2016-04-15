import React from 'react';
import { Route, IndexRoute } from 'react-router';

import App from './containers/app/App';
import Home from './components/app/Home';
import AddProject from './containers/app/AddProject';
import ProjectDetails from './containers/project/ProjectDetails';
// import ProjectSettings from './components/project/ProjectSettings';
import ProjectDeploy from './containers/project/ProjectDeploy';
import ProjectNavPage from './containers/project/ProjectNavPage';
import AddContainerPage from './containers/project/AddContainerPage';
import Init from './components/app/Init';
import Settings from './containers/app/Settings';
import Notifications from './components/app/Notifications';

export default (
  <div>
  <Route path="/" component={App} >
    <IndexRoute component={Home} />
    <Route path="/addProject" component={AddProject} />
    <Route path="/settings" component={Settings} />
    <Route path="/notifications" component={Notifications} />
    <Route path="/projects/:projectName" component={ProjectNavPage} >
      <IndexRoute component={ProjectDetails} />
      <Route path="/projects/:projectName/container" component={AddContainerPage} />
      <Route path="/projects/:projectName/deploy" component={ProjectDeploy} />
    </Route>
  </Route>
  <Route path="/init/:id" component={Init} />
  </div>
);

//
//   <Route path="/projects/:projectName/settings" component={ProjectSettings} />
//
