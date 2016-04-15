import React from 'react';
import ContainerControls from './ProjButtons';

const ServerSpecs = ({ details, delContainer, uuid, logo }) => {
  const clickDelContainer = () => delContainer(uuid, details);
  return (
    <div>
     <div className="card project-server card-wrap">
        <img className="card-img-top" src={logo} alt="Card image cap" />
        <ul className="list-group list-group-flush">
          <li className="list-group-item">
            To switch directories, type <kbd>cd</kbd> followed by the name of the directory.
To edit settings, press <kbd><kbd>ctrl</kbd> + <kbd>,</kbd></kbd>
          </li>
          <li className="list-group-item">
            <ContainerControls />
          </li>
        </ul>
        <div className="card-block">
          <a href="#" className="card-link">Card link</a>
          <a href="#" className="card-link">Another link</a>
        </div>
      < /div>
      <div className="card-wrap details">
        <div className="card">
          <img src={ logo } className="card-img"/>
          <div>
          </div>
        </div>
      </div>
    </div>
  );
};

let controllerRow = {"padding":0};

ServerSpecs.propTypes = {
  details: React.PropTypes.object,
  delContainer: React.PropTypes.func,
  uuid: React.PropTypes.string,
};

export default ServerSpecs;
