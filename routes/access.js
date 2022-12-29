import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import { client_id, client_secret, redirect_uri } from '../keys.js';

const router = express.Router();

router.use(cors());

const sendAccessTokenQuery = function(req, res, next) {
  try {
    const grantQ = 'grant_type=authorization_code';
    const redirectQ = '&redirect_uri=' + encodeURI(redirect_uri);
    const clientQ = '&client_id=' + client_id;
    const secretQ = '&client_secret=' + client_secret;
    const queryLink1 = grantQ;
    const queryLink2 = redirectQ + clientQ + secretQ;
    const queries = {
      query1: queryLink1,
      query2: queryLink2
    }
    req.queries = queries;
    next();
  } catch(error) {
    next(error)
  }
}

router
  .route('/')
  .get([sendAccessTokenQuery], function(req, res) {
    console.log('Gimme a link');
    res.send(req.queries);
  })

export default router;
