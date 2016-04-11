import React, { PropTypes } from 'react';
import ContainerControls from './ProjButtons';
import ProjNavLinks from './projNavLinks';

const ServerDetailContainer = ({ details, logo }) => {
  return (
    <div>
      <div className="card-deck-wrapper">
        <div className="card-deck">
          <div className="card active-server">
            <div className="card-header">
              Server
              <ProjNavLinks cleanName={details.cleanName} />
            </div>
            <img className="card-img-top" src={logo} alt="Card image cap" />
            <ul className="list-group list-group-flush controler-wrapper">
              <li className="list-group-item">
               <ContainerControls />
              </li>
            </ul>
          </div>
          <div className="card server-configuration">
              <div className="card-header">
                Server Details
              </div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item">
                <input className="form-control form-control-lg" type="text"
                  placeholder="PORT http:168.158.0.1:3000"
                />
              </li>
              <li className="list-group-item">
                <p className="card-text">
                  To start your project you only need to press
                  <kbd>Play</kbd>
                  button that is located to the left under the server logo.
                  Last, visit the above URL to with your preferred browser to see your project.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

ServerDetailContainer.propTypes = {
  details: PropTypes.object,
  logo: PropTypes.string,
};

export default ServerDetailContainer;
