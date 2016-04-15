import React from 'react';

const DockerImage = ({ handler, style, logo }) => (
   <div className="card-wrap" onClick={handler} style={style}>
     <div className="card">
       <img src={ logo } className="card-img" />
     </div>
   </div>
);

DockerImage.propTypes = {
  logo: React.PropTypes.string,
  handler: React.PropTypes.func,
  style: React.PropTypes.object,
};

export default DockerImage;
