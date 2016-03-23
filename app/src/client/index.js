import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import App from './components/App';
import Home from './components/Home';
import AddProject from './components/AddProject';
import ProjectDetails from './components/ProjectDetails';
import ProjectSettings from './components/ProjectSettings';
import ProjectDeploy from './components/ProjectDeploy';
import ProjectNav from './components/ProjectNav';

render((
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Home} />
      <Route path="/addProject" component={AddProject} />
      <Route path="/projects/:uuid" component={ProjectNav} >
        <IndexRoute component={ProjectDetails} />
        <Route path="/projects/:uuid/settings" component={ProjectSettings} />
        <Route path="/projects/:uuid/deploy" component={ProjectDeploy} />
      </Route>
    </Route>
  </Router>
), document.getElementById('app'));
