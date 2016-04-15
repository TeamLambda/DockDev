import { connect } from 'react-redux';
import ProjectNav from '../../components/project/ProjectNav';
import { clickStartProject, clickStopProject, clickRestartProject } from '../../actions/index';

function mapStateToProps(state) {
  return state;
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    clickStartProject: () => dispatch(clickStartProject(ownProps.params.projectName)),
    clickStopProject: () => dispatch(clickStopProject(ownProps.params.projectName)),
    clickRestartProject: () => dispatch(clickRestartProject(ownProps.params.projectName)),
    clickRemoveProject: () => dispatch(clickRestartProject(ownProps.params.projectName)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectNav);
