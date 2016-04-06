import { connect } from 'react-redux';
import AddContainer from '../components/AddContainer';
import { getImages, toggleImage } from '../actions/index';

function mapStateToProps(state, ownProps) {
  const project = state.projects[ownProps.params.projectName];
  const { availableImages } = state;
  return { project, availableImages };
}

function mapDispatchToProps(dispatch) {
  return {
    getImages: (projectName) => dispatch(getImages(projectName)),
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
