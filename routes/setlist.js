import express from 'express';
import fetch from 'node-fetch';
import { sfmKey, spotifyKey } from '../keys.js';
import { encodeQuery, formatDate, createPlaylistName, createPlaylistDescription, songToIDs, songToIDsWithArtistFilter, getUnfoundSongs, trimString } from '../methods.js';

const router = express.Router();

// API endpoints
const SETLISTFMAPI = 'https://api.setlist.fm/rest/1.0/setlist/';
const PLAYLISTAPI = 'https://api.spotify.com/v1/playlists/';
const SEARCHAPI = 'https://api.spotify.com/v1/search?';
const USERSAPI = 'https://api.spotify.com/v1/users/';
const MEAPI = 'https://api.spotify.com/v1/me';

const DATEFORMAT = "do 'of' LLLL yyyy";

const bhSetlist = '7388264d';
const ariesSetlist = '3bf8d33';
const the1975Setlist = '4bbf3316';
const emptySetlist = '33bf0069';

// Middleware to GET setlist from setlist.fm based on setlist ID
const getSetlist = async function(req, res, next) {
  try {
    const setlistID = req.body.setlistID;
    const fetchResponse = await fetch(SETLISTFMAPI + setlistID, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'x-api-key': sfmKey
      }
    });
    const setlistData = await fetchResponse.json();
    req.setlist = setlistData;
    next();
  } catch(error) {
    next(error);
  }
}

// Middleware to parse setlist JSON and save data to request
const parseSetlist = function(req, res, next) {
  try {
    const songs = [], covers = [];
    const sets = req.setlist.sets.set;
    sets.forEach((list) => list.song.forEach((track) => track.hasOwnProperty('cover') ? covers.push({ name: track.name, artist: track.cover.name }) : songs.push(track.name)));
    const artist = req.setlist.artist?.name;
    const venue = req.setlist.venue?.name;
    const date = req.setlist.eventDate;
    const formattedDate = formatDate(date, DATEFORMAT)
    const name = req.body.name ? trimString(req.body.name, 100) : createPlaylistName(artist);
    const description = req.body.description ? trimString(req.body.description, 300) : createPlaylistDescription(artist, venue, formattedDate);
    console.log(req.body.accessToken);
    req.songs = songs;
    req.covers = covers;
    req.artist = artist;
    req.formattedDate = formattedDate;
    next();
  } catch(error) {
    next(error);
  }
}

// Middleware to set values from client request body
const parseRequest = function(req, res, next) {
  try {
    const accessToken = req.body.accessToken
    const name = req.body.name ? trimString(req.body.name, 100) : createPlaylistName(req.artist);
    const description = req.body.description ? trimString(req.body.description, 300) : createPlaylistDescription(req.artist, req.venue, req.formattedDate);
    req.accessToken = accessToken;
    req.playlistName = name;
    req.playlistDescription = description;
    next();
  } catch(error) {
    next(error)
  }
}

// Middleware to GET Spotify URI for each track
const getSongID = async function(req, res, next) {
  try {
    const songs = req.songs;
    const artist = req.artist.toLowerCase();
    const songObjects = await Promise.all(
      songs.map(async song => {
        const songURI = encodeQuery(song);
        const artistURI = encodeQuery(artist);
        const query = 'type=track' + '&' + `q=track:${songURI}` + encodeURIComponent(' ') + `artist:${artistURI}` + '&' + 'limit=1';
        const songResponse = await fetch(SEARCHAPI + query, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + req.accessToken
          }
        })
        const songJSON = await songResponse.json();
        return songJSON;
      })
    );
    const trackIDs = songToIDs(songObjects)
    req.trackIDs = trackIDs;
    const unfoundSongs = getUnfoundSongs(songObjects, songs, req.artist);
    req.unfoundSongs = unfoundSongs;
    next();
  } catch(error) {
    next(error);
  }
}

// Middleware to get the Spotify user's username/ID
const getUser = async function(req, res, next) {
  try {
    const user = await fetch(MEAPI, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + req.accessToken
      }
    })
    const userData = await user.json();
    req.userID = userData.id;
    next();
  } catch(error) {
    next(error)
  }
}

// Middleware to create playlist in user's account
const makePlaylist = async function(req, res, next) {
  try {
    const userID = req.userID;
    const playlist = await fetch(USERSAPI + userID + '/playlists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + req.accessToken
      },
      body: JSON.stringify({
        'name': req.playlistName,
        'description': req.playlistDescription
      })
    })
    const playlistData = await playlist.json();
    req.playlistLink = playlistData.external_urls.spotify;
    req.playlistID = playlistData.id;
    next();
  } catch(error) {
    next(error);
  }
}

// Middleware to add all setlist tracks to created playlist
const addSongs = async function(req, res, next) {
  try {
    const trackIDs = req.trackIDs;
    const formattedTrackIDs = trackIDs.map(track => 'spotify:track:' + track);
    const playlistID = req.playlistID;
    const playlist = await fetch(PLAYLISTAPI + playlistID + '/tracks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + req.accessToken
      },
      body: JSON.stringify({
        uris: formattedTrackIDs
      })
    })
    const playlistData = await playlist.json();
    next();
  } catch(error) {
    next(error);
  }
}

router
  .route('/')
  .post([getSetlist, parseSetlist, parseRequest, getSongID, getUser, makePlaylist, addSongs], function(req, res) {
    console.log('Playlist created, W ');
    const links = {
      coverSongs: req.covers,
      unfoundSongs: req.unfoundSongs,
      playlistID: req.playlistID,
      playlistLink: req.playlistLink
    }
    res.send(links);
  })

export default router;

// Add way to make tell user the setlist is empty
// Add way to include covers (and option in UI)
// Editing comment
