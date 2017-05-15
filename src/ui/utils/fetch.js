import React, { Component } from 'react';
import axios from 'axios';

export default path =>
  (WrappedComponent) => {
    class Fetch extends Component {
      state = { data: null, fetching: false };

      componentWillMount() {
        this.fetch();
      }

      fetch = () => {
        this.setState({ fetching: true }, async () => {
          const response = await axios.get(path);
          const data = response.data;
          this.setState({ data, fetching: false });
        });
      };

      render() {
        const { data } = this.state;

        return <WrappedComponent data={data} refresh={this.fetch} />;
      }
    }

    return Fetch;
  };
