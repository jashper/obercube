import React from 'react';
import ReactDOM from 'react-dom';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div>
        <h2> This is a test </h2>
        <h2> This test </h2>
      </div>
    );
  }
}

ReactDOM.render(
  React.createElement(App),
  document.getElementById('app')
);
