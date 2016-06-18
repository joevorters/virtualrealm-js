import React from 'react';
import Console from './console.jsx';
import NavBar from './navbar.jsx';

export default class Application extends React.Component {
  render() {
    return (
      <div className="panel panel-primary app-container">
        <NavBar />
        <Console />
      </div>
    );
  }
}
