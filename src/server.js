/**
 * Example server implementation
 */
import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import interceptor from './interceptor';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'production') {
  app.use(interceptor.middleware()); // Add middleware
}

// Add endpoints
app.get('/api/example', (req, res) => {
  res.json({ mock: false });
});

app.get('/api/example2', (req, res) => {
  res.json({ mock: false });
});

app.post('/api/example2', (req, res) => {
  res.json({ mock: false });
});

if (process.env.NODE_ENV !== 'production') {
  interceptor.init(app); // Init after declaring routes
}

app.listen(8081);
