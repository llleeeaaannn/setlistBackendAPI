import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import { client_id, client_secret, redirect_uri } from '../keys.js';

const router = express.Router();

router.use(cors());

const AUTHORIZE = 'https://accounts.spotify.com/authorize';

// Middleware to create an authorization link for Spotify accounts
const sendAuthLink = function(req, res, next) {
  try {
    const clientQ = '?client_id=' + client_id;
    const responseQ = '&response_type=code';
    const redirectQ = '&redirect_uri=' + encodeURI(redirect_uri);
    const dialogQ = '&show_dialog=true';
    const scopeQ = '&scope=user-read-private user-read-private playlist-modify-private playlist-modify-public';
    const url = AUTHORIZE + clientQ + responseQ + redirectQ + dialogQ + scopeQ;
    const link = {
      auth: url
    }
    req.link = link;
    next();
  } catch(error) {
    next(error);
  }
}

router
  .route('/')
  .get([sendAuthLink], function(req, res) {
    console.log('Sent Auth URl');
    res.send(req.link);
  })

export default router;
