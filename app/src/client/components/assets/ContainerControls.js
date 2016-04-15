import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import {
  clickStartProject,
  clickStopProject,
  clickRestartProject,
} from '../../actions/index';

const ContainerControls = ({ start, stop, restart }) => (
  <div className="btn-group btn-group-sm container-controls"
    role="group" aria-label="Container Controls"
  >
    <button type="button" onClick={stop} className="btn btn-secondary btn-info-outline">
      Stop
    </button>
    <button type="button" onClick={start} className="btn btn-secondary btn-info-outline">
      Play
    </button>
    <button type="button" onClick={restart} className="btn btn-secondary btn-info-outline">
      Restart
    </button>
  </div>

);

function mapStateToProps(state) {
  return state;
}

function mapDispatchToProps(dispatch, ownProps) {
  const { cleanName } = ownProps;
  return {
    start: () => dispatch(clickStartProject(cleanName)),
    stop: () => dispatch(clickStopProject(cleanName)),
    restart: () => dispatch(clickRestartProject(cleanName)),
  };
}


ContainerControls.propTypes = {
  start: PropTypes.func,
  stop: PropTypes.func,
  restart: PropTypes.func,
  remove: PropTypes.func,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContainerControls);
