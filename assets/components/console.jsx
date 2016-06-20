import React from 'react';

export default class Console extends React.Component {
  render() {
    return (
      <div className="console">
        <div className="output">
          Data
        </div>
        <div className="input">
          <input type="text" />
        </div>
      </div>
    );
  }
}
