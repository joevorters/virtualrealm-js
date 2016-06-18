import React from 'react';

export default class OutputPane extends React.Component {
  render() {
    return (
      <div className="panel-body">
        <div>
          Data
        </div>
        <input type="text" class="form-control" />
      </div>
    );
  }
}
