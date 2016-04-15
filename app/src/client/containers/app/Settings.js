import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { clickUpdateDOToken } from '../../actions/index';

const Settings = ({ DOToken, updateToken }) => (
  <div className="full-page">
    <div className="settings-content">
      <div className="col-xs-12 form-input-spacing">
        <h5>Digital Ocean Token</h5>
        <input
          className="form-control form-control-lg border-bottom-input padding-left-none"
          value={DOToken}
          onChange={updateToken}
          type="text"
        />
      </div>
    </div>
  </div>
);

Settings.propTypes = {
  updateToken: PropTypes.func,
  DOToken: PropTypes.string,
};

function mapStateToProps(state) {
  return {
    DOToken: state.config.DOToken,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateToken: (e) => dispatch(clickUpdateDOToken(e.target.value)),
  };
}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings);
