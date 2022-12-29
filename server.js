import fetch from 'node-fetch';
import express from 'express';
import cors from 'cors';

import auth from './routes/auth.js';
import access from './routes/access.js';
import setlist from './routes/setlist.js';

const app = express();

const PORT = process.env.PORT || 4000;

const errorHandler = function(error, req, res, next) {
  console.log( `error ${error.message}`);
  res.status(404);
  res.send('Invalid Path');
}

app.use(cors());
app.use(express.json());

app.use('/auth', auth);
app.use('/access', access);
app.use('/setlist', setlist);

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
