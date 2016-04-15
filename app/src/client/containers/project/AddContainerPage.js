import { connect } from 'react-redux';
import AddContainer from '../../components/project/AddContainer';
import { getImages, toggleImage, clickAddContainers, redirect } from '../../actions/index';

function mapStateToProps(state, ownProps) {
  const project = state.projects[ownProps.params.projectName];
  const { availableImages } = state;
  return { project, availableImages };
}

function mapDispatchToProps(dispatch) {
  return {
    getImages: (projectName) => dispatch(getImages(projectName)),
    clickAddContainers: (cleanName) => {
      dispatch(clickAddContainers(cleanName));
      dispatch(redirect('projects', cleanName));
    },
    onClick: (image, idx) => {
      if (!image.used) {
        dispatch(toggleImage({ ...image, selected: !image.selected }, idx));
      }
    },
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddContainer);
