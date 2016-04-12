import React, { PropTypes } from 'react';
var ReactTooltip = require("react-tooltip");

const Container = ({ details, onClick, logo }) => (
  <div className="card-wrap">
    <div className="card">
      <img src={ logo } className="card-img" />
      <div>
        <button onClick={onClick} className="delete-container-btn" >
          <img src="./client/images/png/delete.png"></img>
          {/*<ReactTooltip place="bottom" type="info" effect="float"/>*/}

        </button>
        <div className="container-download-status" >

          { details.image }
          { details.status }
        </div>
      </div>
    </div>
  </div>
);

Container.propTypes = {
  details: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  logo: PropTypes.string.isRequired,
};

export default Container;
