import React from 'react';

export default class NavBar extends React.Component {
  render() {
    return (
      <div className="nav">
        <div className="nav-actions">
          <div className="nav-action-table">
            <div className="nav-action-row">
              <div className="nav-action">
                <i className="material-icons">menu</i>
              </div>
            </div>
          </div>
        </div>
        <div className="title">Virtualrealm</div>
        <div className="nav-actions">
          <div className="nav-action-table">
            <div className="nav-action-row">
              <div className="nav-action">
                <i className="material-icons">person</i>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
