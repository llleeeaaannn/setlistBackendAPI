import { format } from 'date-fns';

const encodeQuery = (query) =>
  encodeURIComponent(query)
    .replace(/\-/g, '%2D')
    .replace(/\_/g, '%5F')
    .replace(/\./g, '%2E')
    .replace(/\!/g, '%21')
    .replace(/\~/g, '%7E')
    .replace(/\*/g, '%2A')
    .replace(/\'/g, '')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');

// .replace(/\'/g, '%27')

// Function to format date string into necessary pattern
const formatDate = (date, pattern) => {
  const dateArray = date.split('-');
  const formattedDate = format(new Date(dateArray[2], dateArray[1] - 1, dateArray[0]), pattern);
  return formattedDate;
}

// Function to create playlist name string
const createPlaylistName = (artist) => {
  return `${artist} Setlist`;
}

// Function to create playlist description string dependent on which variables are available
const createPlaylistDescription = (artist, venue, date) => {
  const artistApostrophe = artist.slice(-1) === 's' ? `${artist}'` : `${artist}'s`;
  if (artist && venue && date) return `${artistApostrophe} setlist at ${venue} on the ${date}`;
  if (artist && date) return `${artistApostrophe} setlist on the ${date}`;
  if (artist && venue) return `${artistApostrophe} setlist at ${venue}`;
  return `${artistApostrophe} setlist`;
}

// Get songs with at least 1 search result from Spotify search
const songToIDs = (songs) => {
  const validSongs = songs.filter((song) => song.tracks.total > 0);
  const songIDs = validSongs.map(song => song.tracks.items[0].id);
  return songIDs;
}

// Get songs with at least 1 search result from Spotify search while also strictly matching artist name (potentially prone to error due to being too strict)
const songToIDsWithArtistFilter = (songs, artist) => {
  const validSongs = songs.filter((song) => song.tracks.total > 0);
  const artistTracks = validSongs.filter(song => song.tracks.items[0].artists[0].name.toLowerCase() === artist);
  const songIDs = artistTracks.map(song => song.tracks.items[0].id);
  return songIDs;
}

// Function to get song names where the search to Spotify didnt return any results
const getUnfoundSongs = (songObjects, songNames, artist) => {
  const unfoundSongs = [];
  songObjects.forEach((song, i) => {
    if (song.tracks.total === 0) unfoundSongs.push({ name: songNames[i], artist: artist });
  });
  return unfoundSongs;
}

const trimString = (string, length) => {
  if (string.length <= length) return string;
  return string.substring(0, length);
}



export { encodeQuery, formatDate, createPlaylistName, createPlaylistDescription, songToIDs, songToIDsWithArtistFilter, getUnfoundSongs, trimString }
