import React from 'react';
import {Link} from 'react-router';

// import { remote } from 'electron';

const Notifications = ({ DOToken, updateToken }) => (
  <div className="full-page">
    <div className="notification-content">
      <div className="list-group">
        <a href="#" className="list-group-item active">
          <h4 className="list-group-item-heading">List group item heading</h4>
        <p className="list-group-item-text">Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.</p>
        </a>
        <a href="#" className="list-group-item">
          <h4 className="list-group-item-heading">List group item heading</h4>
        <p className="list-group-item-text">Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.</p>
        </a>
        <a href="#" className="list-group-item">
          <h4 className="list-group-item-heading">List group item heading</h4>
        <p className="list-group-item-text">Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.</p>
        </a>
      </div>
    </div>
  </div>

);

Notifications.propTypes = {
  updateToken: React.PropTypes.func,
  DOToken: React.PropTypes.string,
};

export default Notifications;
