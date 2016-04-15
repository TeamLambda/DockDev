import React, { PropTypes } from 'react';
import ContainerControls from './ContainerControls';
import ProjNavLinks from './projNavLinks';

const ServerDetailContainer = ({ details, logo, dockdevIP, dbInfo }) => {
  const ipString = `IPAddress = ${dockdevIP}:3000`;
  const dbDisplay = dbInfo.map((info, idx) =>
    (<li className="list-group-item" key={idx}>{info}</li>));
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
               <ContainerControls cleanName={details.cleanName} />
              </li>
            </ul>
          </div>
          <div className="card server-configuration">
              <div className="card-header">
                Server Details
              </div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item">
                <input className="form-control form-control-lg" type="text" defaultValue={ipString} />
              </li>
              <li className="list-group-item">
                <p className="card-text">
                  To start your project you only need to press
                  <kbd>Play</kbd>
                  button that is located to the left under the server logo.
                  Last, visit the above URL to with your preferred browser to see your project.
                </p>
              </li>
              {dbDisplay}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

ServerDetailContainer.propTypes = {
  details: PropTypes.object.isRequired,
  logo: PropTypes.string,
  dockdevIP: PropTypes.string,
  dbInfo: PropTypes.array,
};

export default ServerDetailContainer;
