import React from 'react';
import Console from './console.jsx';
import NavBar from './navbar.jsx';
import Input from './input.jsx';

export default class Application extends React.Component {
  render() {
    return (
      <div className="application">
        <NavBar />
        <Console />
        <Input />
      </div>
    );
  }
}
