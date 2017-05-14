import React from 'react';
import _ from 'lodash';
import fetch from '../utils/fetch';

const Home = ({ data }) => (
  <div>
    Home
  </div>
);

export default fetch('/interceptor/api/schema')(Home);
