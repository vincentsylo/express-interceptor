import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Home from '../Home/Home';
import NoMatch from '../NoMatch/NoMatch';

export default () => (
  <div>
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NoMatch} />
    </Switch>
  </div>
);
