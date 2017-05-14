import express from 'express';
import _ from 'lodash';
import fs from 'fs-extra';
import mkdirp from 'mkdirp';
import path from 'path';

const FOLDER_NAME = 'interceptor';
const statusCodes = {};

function middleware() {
  return (req, res, next) => {
    if (!_.includes(req.url, FOLDER_NAME)) {
      const url = `${FOLDER_NAME}${req.url}`;
      fs.readJson(`${url}.json`)
        .then((json) => {
          const selectedStatusCode = statusCodes[req.url] || 200;
          res.json(json[selectedStatusCode]).end();
        })
        .catch(() => {
          console.error(`No mock found for ${url} - moving next()`);
          next();
        });
    } else {
      next();
    }
  };
}

function init(app) {
  const mocks = _(app._router.stack)
    .filter(item => item.route && item.route.path)
    .map(item => ({ path: item.route.path, methods: item.route.methods }))
    .value();

  const newSchema = _.zipObject(
    _.map(mocks, 'path'),
    _.map(mocks, mock => _.keys(mock.methods)),
  );

  mkdirp(FOLDER_NAME, (err) => {
    if (err) {
      console.error(err);
    } else {
      fs.writeJson(`${FOLDER_NAME}/schema.json`, newSchema);
    }
  });

  app.use('/interceptor', express.static(path.join(__dirname, 'public')));

  /**
   * Retrieve the schema for the URLs to mock on the server
   */
  app.get('/interceptor/api/schema', (req, res) => {
    fs.readJson(`${FOLDER_NAME}/schema.json`)
      .then((json) => {
        res.json(json);
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
        res.json(json);
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
   * @body {} - injected into the mock
   */
  app.post('/interceptor/api/mock', (req, res) => {
    const urlPath = req.query.path;
    const body = req.body;

    mkdirp(`${FOLDER_NAME}${urlPath}`, (err) => {
      if (err) {
        console.error(err);
        res.status(404).end();
      } else {
        fs.writeJson(`${FOLDER_NAME}${urlPath}.json`, body);
        res.json(body);
      }
    });
  });

  /**
   * Update the selected mock status code
   *
   * @query path - URL as a key for mapping
   * @body statusCode - update the selected status code in memory
   */
  app.post('/interceptor/api/mock/status', (req, res) => {
    const urlPath = req.query.path;
    const { statusCode } = req.body;

    statusCodes[urlPath] = statusCode;

    res.status(200).end();
  });
}

export default {
  middleware,
  init,
};
