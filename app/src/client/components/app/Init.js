import React from 'react';

const InitPage = ({ params }) => {
  let text = '';

  if (params.id === '1') {
    text = 'You do not have the docker toolbox installed. Please go to the following' +
    ' link and download the docker toolbox for Mac' +
    <a href="https://www.docker.com/products/docker-toolbox">
      Docker Toolbox for Mac
    </a> + ' Once the toolbox is installed, please restart DockDev';
  } else if (params.id === '2') {
    text = 'We are creating a dockdev machine for you. You will be redirected to the DockDev' +
    ' home page once this is complete. This only needs to happen once and might take a couple' +
    ' of minutes.';
  } else if (params.id === '3') {
    text = 'Your machine is being restarted. You will be redirected to the DockDev' +
     ' home page once this is complete. If you are not redirected within a couple of minutes,' +
     ' please refresh and try again.';
  } else {
    text = 'There was a problem creating your machine. Please refresh our app and try again.';
  }

  return (
  <div className="loader-wrapper">
    <main>
      <div className="wrapper">
        <aside className="aside aside-1-loader">
          <img src="./client/images/png/DD-icon-text@2x.png"></img>
        </aside>
        <aside className="aside">
        </aside>
        <aside className="aside aside-2-loader load-text">
         {text}
        </aside>
      </div>
    </main>
  </div>
  );
};

InitPage.propTypes = {
  params: React.PropTypes.object,
};

export default InitPage;
