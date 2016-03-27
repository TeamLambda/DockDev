import React from 'react';
import * as container from './server/container.js';
import * as images from './server/availableImages.js';
import DockerImage from './DockerImage';

class AddContainer extends React.Component {
  constructor() {
    super();
    this.clickServer = this.clickServer.bind(this);
    this.clickDb = this.clickDb.bind(this);
    this.submit = this.submit.bind(this);
    this.state = {
      selServer: 'node',
      selDbs: [],
      servers: [],
      dbs: [],
    };
  }

  componentDidMount() {
    this.addImagesToState();
  }

  addImagesToState() {
    const servers = images.getServers();
    const dbs = images.getDbs();
    this.setState({ servers, dbs });
  }

  clickServer(selServer) {
    return () => {
      this.setState({ selServer });
    };
  }

  clickDb(selDb) {
    return () => {
      // if already in the array, remove it
      const selDbs = this.state.selDbs;
      const idx = selDbs.indexOf(selDb);
      if (idx > -1) {
        selDbs.splice(idx, 1);
      } else {
        selDbs.push(selDb);
      }
      this.setState({ selDbs });
    };
  }

  submit() {
    const containers = this.state.selDbs.concat(this.state.selServer);
    containers.forEach(val => {
      container.add(this.props.params.uuid, val, this.props.addContainer);
    });

    this.props.context.router.replace(`/projects/${this.props.params.uuid}`);
  }

  render() {
    const serverDisplay = this.state.servers.map((val, idx) => {
      const style = {};
      if (val.name === this.state.selServer) style.color = 'red';
      return (
        <DockerImage key={idx} style={style}
          name={val.name} handler={this.clickServer(val.name)}
        />
      );
    });

    const dbDisplay = this.state.dbs.map((val, idx) => {
      const style = {};
      if (this.state.selDbs.indexOf(val.name) > -1) style.color = 'blue';
      return (
        <DockerImage key={idx} style={style}
          name={val.name} handler={this.clickDb(val.name)}
        />
      );
    });

    return (
      <div className="row">
        <div className="col-xs-12" id="servers">
          <h4>Servers</h4>
          <button
            className="btn btn-sm btn-primary-outline container-save"
            onClick={this.submit}
          >
            Save
          </button>
          <div className="divider"></div>
          {serverDisplay}
        </div>
        <div className="col-xs-12" id="servers">
          <h4>Databases</h4>
          <div className="divider"></div>
          {dbDisplay}
        </div>
      </div>
    );
  }
}

AddContainer.propTypes = {
  params: React.PropTypes.object,
  addContainer: React.PropTypes.func,
  context: React.PropTypes.object,
};


// const AddContainer = ({ params, addContainer }) => {
//   let error;
//   const errors = [
//     <div key="1">Error</div>,
//     '',
//   ];
//
//   const server = ['node', 'notNode'];
//   let serverSelect = server[0];
//   const serverChange = event => {
//     console.log(event.target.value);
//     serverSelect = event.target.value;
//   };
//
//   const submit = () => {
//     if (serverSelect === 'notNode') {
//       error = errors[0];
//       console.log(error);
//     } else {
//       container.add(params.uuid, serverSelect)
//       .then(result => addContainer(params.uuid, result));
//     }
//   };
//
//   const serverElements = server.map((val, idx) => <option key={idx} value={val}>{val}</option>);
//
//   return (
//     <div>
//       <select onChange={serverChange}>
//         {serverElements}
//       </select>
//       AddContainer
//       <button onClick={submit}>Submit</button>
//       {error}
//     </div>
//   );
// };
export default AddContainer;
