import React from 'react';
import OutputPane from './output-pane.jsx';
import NavBar from './navbar.jsx';
import InputPane from './input-pane.jsx';

export default class Application extends React.Component {
  render() {
    return (
      <div className="panel panel-primary">
        <NavBar />
        <OutputPane />
        <InputPane />
      </div>
    );
  }
}
