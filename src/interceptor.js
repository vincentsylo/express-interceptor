import express from 'express';
import _ from 'lodash';
import fs from 'fs-extra';
import mkdirp from 'mkdirp';
import path from 'path';

const FOLDER_NAME = 'interceptor';
const statusCodes = {};
const methods = {};
const enabledMocks = {};
const delays = {};

function middleware() {
  return (req, res, next) => {
    if (!_.includes(req.url, FOLDER_NAME) && enabledMocks[req.url]) {
      const url = `${FOLDER_NAME}${req.url}`;
      fs.readJson(`${url}.json`)
        .then((json) => {
          const selectedStatusCode = statusCodes[req.url] || 200;

          setTimeout(() => {
            res.status(selectedStatusCode).json(json[selectedStatusCode]).end();
          }, delays[req.url]);
        })
        .catch(() => {
          console.error(`No mock found for ${req.url} - moving next()`);
          next();
        });
    } else {
      next();
    }
  };
}

function init(app) {
  const filtered = _.filter(app._router.stack, item => item.route && item.route.path);
  const unique = {};
  _.each(filtered, (item) => {
    const duplicate = unique[item.route.path] || {};
    unique[item.route.path] = {
      methods: [
        ...(duplicate.methods || []),
        ..._.keys(item.route.methods),
      ],
    };
  });

  mkdirp(FOLDER_NAME, (err) => {
    if (err) {
      console.error(err);
    } else {
      fs.writeJson(`${FOLDER_NAME}/schema.json`, unique);
    }
  });

  app.use('/interceptor', express.static(path.join(__dirname, 'public')));

  /**
   * Retrieve the schema for the URLs to mock on the server
   */
  app.get('/interceptor/api/schema', (req, res) => {
    fs.readJson(`${FOLDER_NAME}/schema.json`)
      .then((json) => {
        const schema = json;
        _.each(statusCodes, (status, key) => {
          schema[key] = {
            ...schema[key],
            selectedStatus: status,
          };
        });

        _.each(methods, (method, key) => {
          schema[key] = {
            ...schema[key],
            selectedMethod: method,
          };
        });

        _.each(enabledMocks, (item, key) => {
          schema[key] = {
            ...schema[key],
            enabled: item,
          };
        });

        _.each(delays, (delay, key) => {
          schema[key] = {
            ...schema[key],
            delay,
          };
        });

        res.json(schema);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).end();
      });
  });

  /**
   * Retrieve the selected mock JSON structure
   *
   * @query path - URL as a key for mapping
   *
   */
  app.get('/interceptor/api/mock', (req, res) => {
    const urlPath = req.query.path;

    fs.readJson(`${FOLDER_NAME}${urlPath}.json`)
      .then((json) => {
        const code = statusCodes[urlPath] || 200;
        res.json(json[code]);
      })
      .catch((err) => {
        console.error(err);
        res.status(404).end();
      });
  });

  /**
   * Update the selected mock JSON structure
   *
   * @query path - URL as a key for mapping
   * @body data - injected into the mock
   */
  app.post('/interceptor/api/mock', (req, res) => {
    const urlPath = req.query.path;
    const { data } = req.body;

    if (data) {
      const code = statusCodes[urlPath] || 200;
      mkdirp(`${FOLDER_NAME}${urlPath.substring(0, _.lastIndexOf(urlPath, '/'))}`, (err) => {
        if (err) {
          console.error(err);
          res.status(404).end();
        } else {
          const jsonFile = `${FOLDER_NAME}${urlPath}.json`;
          fs.readJson(jsonFile)
            .then((json) => {
              fs.writeJson(jsonFile, {
                ...json,
                [code]: JSON.parse(data),
              });
              res.json(data);
            })
            .catch(() => {
              fs.writeJson(jsonFile, {
                [code]: JSON.parse(data),
              });
              res.json(data);
            });
        }
      });
    } else {
      res.status(500).end();
    }
  });

  /**
   * Update the selected mock HTTP method
   *
   * @body urlPath (string) - URL as a key for the mapping
   * @body method - update the selected method in memory
   */
  app.post('/interceptor/api/mock/method', (req, res) => {
    const { urlPath, method } = req.body;

    methods[urlPath] = method;

    res.status(200).end();
  });

  /**
   * Update the selected mock status code
   *
   * @body urlPath (string) - URL as a key for the mapping
   * @body statusCode - update the selected status code in memory
   */
  app.post('/interceptor/api/mock/status', (req, res) => {
    const { urlPath, statusCode } = req.body;

    statusCodes[urlPath] = statusCode;

    res.status(200).end();
  });

  /**
   * Enable the mock
   *
   * @body urlPath (string) - URL as a key for the mapping
   * @body enabled (bool) - on/off status for mocking
   */
  app.post('/interceptor/api/mock/enable', (req, res) => {
    const { urlPath, enabled } = req.body;

    enabledMocks[urlPath] = enabled;

    res.status(200).end();
  });

  /**
   * Set a delay for the mock
   *
   * @body urlPath (string) - URL as a key for the mapping
   * @body delay - in milliseconds
   */
  app.post('/interceptor/api/mock/delay', (req, res) => {
    const { urlPath, delay } = req.body;

    delays[urlPath] = delay;

    res.status(200).end();
  });
}

export default {
  middleware,
  init,
};
