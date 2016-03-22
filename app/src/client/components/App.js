import React from 'react';
import NavLink from './NavLink';
import Projects from './Projects';

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      projects: {
        1: {
          projectName: 'project1',
          uuid: 1,
          other: 'test1'
        },
        2: {
          projectName: 'project2',
          uuid: 2,
          other: 'test2'
        },
        3: {
          projectName: 'project3',
          uuid: 3,
          other: 'test3'
        },
        10: {
          projectName: 'project10',
          uuid: 10,
          other: 'test3'
        }
      }
    };
  }

  render() {
    return (
      <div>
        <div id="header">
          <h5>DockDev <small>beta</small></h5>
        </div>
        <ul role="nav" id="menu">
          <li><NavLink to="/" onlyActiveOnIndex>Home</NavLink></li>
          <li><NavLink to="/addProject">Add Project</NavLink></li>
          <Projects projects={this.state.projects} />
        </ul>
        {React.cloneElement(this.props.children, { projects: this.state.projects })}
      </div>
    );
  }
}

App.propTypes = {
  children: React.PropTypes.object
};

export default App;
