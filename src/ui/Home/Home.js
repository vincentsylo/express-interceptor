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
    }),
  };

  static defaultProps = {
    data: null,
  };

  state = {
    responses: {},
  };

  onChange(api, value) {
    this.setState({
      responses: {
        ...this.state.responses,
        [api]: value,
      },
    });
  }

  async updateMethod(api, method) {
    const { refresh } = this.props;

    await axios.post('/interceptor/api/mock/method', {
      urlPath: api,
      method,
    });

    refresh();
  }

  async updateStatus(api, statusCode) {
    const { refresh } = this.props;

    await axios.post('/interceptor/api/mock/status', {
      urlPath: api,
      statusCode,
    });

    refresh();
  }

  async loadJsonResponse(api) {
    try {
      const json = await axios.get(`/interceptor/api/mock?path=${api}`);
      this.setState({
        responses: {
          ...this.state.responses,
          [api]: JSON.stringify(json.data),
        },
      });
    } catch (error) {
      this.setState({
        responses: {
          ...this.state.responses,
          [api]: JSON.stringify({}),
        },
      });
    }
  }

  async updateJsonResponse(api) {
    if (this.state.responses[api]) {
      await axios.post(`/interceptor/api/mock?path=${api}`, { data: this.state.responses[api] });
    }
  }

  render() {
    const { data } = this.props;
    const { responses } = this.state;

    return (
      <div>
        {
          _.map(data, (apiData, api) => (
            <div key={api}>
              <div>
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
                <button onClick={() => this.loadJsonResponse(api)}>Edit Response</button>
              </div>
              {
                responses[api] ? (
                  <textarea value={responses[api]} onChange={event => this.onChange(api, event.target.value)} onBlur={() => this.updateJsonResponse(api)} />
                ) : null
              }
            </div>
          ))
        }
      </div>
    );
  }
}

export default fetch('/interceptor/api/schema')(Home);
