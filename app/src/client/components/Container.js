import React from 'react';

const Container = (props) => {
  return (
    <li className="container-list">
      <div className="container-box">
        <h4 className="text-container">{ props.details[1].image }</h4>
        <p className="text-version">v1.1.1.0</p>
        <p className="text-description">
          A Docker project management tool that automatically syncs files,
          seamlessly integrate Docker with existing workflow, and
          manage Docker projects and easily deploy them</p>
      </div>
    </li>
  );
};

export default Container;
