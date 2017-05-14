import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { AppContainer } from 'react-hot-loader';
import Root from './Root/Root';

const render = () => {
  ReactDOM.render(
    <AppContainer>
      <BrowserRouter>
        <Root />
      </BrowserRouter>
    </AppContainer>,
    document.getElementById('app'), // eslint-disable-line
  );
};

render();

if (module.hot) {
  module.hot.accept('./Root/Root', () => {
    const NextRootContainer = require('./Root/Root'); // eslint-disable-line
    render(NextRootContainer);
  });
}
