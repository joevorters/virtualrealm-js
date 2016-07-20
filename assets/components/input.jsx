import React from 'react';

export default class Input extends React.Component {
  render() {
    return (
      <div className="input">
        <div className="input-container">
          <div className="form-input">
            <input type="text" />
            <div className="send-action">
              <i className="material-icons">send</i>
            </div>
          </div>
        </div>
        <div className="action-container">
          <div className="action-row">
            <div className="action">
              <i className="material-icons">visibility</i>
            </div>
            <div className="action">
              <i className="material-icons">grade</i>
            </div>
            <div className="action">
              <i className="material-icons">explore</i>
            </div>
            <div className="action">
              <i className="material-icons">event</i>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
