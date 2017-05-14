import React, { Component } from 'react';
import axios from 'axios';

export default path =>
  (WrappedComponent) => {
    class Fetch extends Component {
      state = { data: null, fetching: false };

      componentWillMount() {
        this.fetch();
      }

      fetch() {
        this.setState({ fetching: true }, async () => {
          const data = await axios.get(path);
          this.setState({ data, fetching: false });
        });
      }

      render() {
        const { data } = this.state;

        return <WrappedComponent data={data} />;
      }
    }

    return Fetch;
  };
