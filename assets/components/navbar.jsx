import React from 'react';

export default class NavBar extends React.Component {
  render() {
    return (
      <div className="nav">
        <span className="title">Virtualrealm</span>
        <span className="nav-actions">
          <i className="material-icons">person</i>
        </span>
      </div>
    )
  }
}
