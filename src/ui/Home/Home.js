import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import axios from 'axios';
import fetch from '../utils/fetch';

const statusCodes = [200, 400, 401, 403, 404, 500, 502, 503, 504];

class Home extends Component {
  static propTypes = {
    data: PropTypes.shape({
      selectedMethod: PropTypes.string,
      selectedStatus: PropTypes.string,
    }).isRequired,
  };

  state = {
    selectedApi: null,
  };

  async updateMethod(api, method) {
    await axios.post('/interceptor/api/mock/method', {
      urlPath: api,
      method,
    });
  }

  async updateStatus(api, statusCode) {
    await axios.post('/interceptor/api/mock/status', {
      urlPath: api,
      statusCode,
    });
  }

  render() {
    const { data } = this.props;

    return (
      <div>
        {
          _.map(data, (apiData, api) => (
            <div key={api}>
              {api}
              <select value={apiData.selectedMethod} onChange={event => this.updateMethod(api, event.target.value)}>
                {
                  _.map(apiData.methods, method => <option key={method}>{method}</option>)
                }
              </select>
              <select value={apiData.selectedStatus} onChange={event => this.updateStatus(api, event.target.value)}>
                {
                  _.map(statusCodes, status => <option key={status}>{status}</option>)
                }
              </select>
              <button onClick={() => this.openJsonEditor(api)}>Edit Response</button>
            </div>
          ))
        }
      </div>
    );
  }
}

export default fetch('/interceptor/api/schema')(Home);
