const nodeEnv = require('./nodeEnv');
const axios = require('axios');

/**
 * @description - /api/token => retrieves the access and refresh tokens
 * @param {string} authCode - The authorization code for a new user
 * @param {string} refreshToken - the refresh token for the current user
 * @returns {Object} an object
 */
const getAccessToken = async (authCode, refreshToken) => {
  // Initialize response object
  const tmpObj = {};
  tmpObj.status = null;
  tmpObj.message = null;
  tmpObj.accessToken = null;
  tmpObj.refreshToken = null;

  return new Promise(async (resolve, reject) => {
    // Create the payload
    const formData = new URLSearchParams();
    if (authCode) {
      formData.append('code', authCode);
      formData.append('redirect_uri', nodeEnv.REDIRECT_URI);
      formData.append('grant_type', 'authorization_code');
    } else {
      formData.append('refresh_token', refreshToken);
      formData.append('grant_type', 'refresh_token');
    }
    formData.append('client_id', nodeEnv.CLIENT_ID);
    formData.append('client_secret', nodeEnv.CLIENT_SECRET);

    // Perform the request
    return axios.post('https://accounts.spotify.com/api/token', formData.toString())
      .then((response) => {
        tmpObj.status = 'SUCCESS';
        tmpObj.message = '';
        tmpObj.accessToken = response && response.data && response.data.access_token ? response.data.access_token : null;
        tmpObj.refreshToken = response && response.data && response.data.refresh_token ? response.data.refresh_token : null;
        return resolve(tmpObj);
      })
      .catch((error) => {
        tmpObj.status = 'FAILURE';
        tmpObj.message = error && error.response && error.response.data && error.response.data.error ? error.response.data.error : `${error}`;
        return resolve(tmpObj);
      })
  });
}

/**
 * @description /me => gets profile info for the profile who's access_token is being used
 * @param {string} accessToken - The access token recently pulled via API
 * @returns {Object} an object
 */
const getUserId = async (accessToken) => {
  if (!accessToken) {
    return null;
  }

  // Initialize response object
  const tmpObj = {};
  tmpObj.status = null;
  tmpObj.message = null;
  tmpObj.id = null;

  return new Promise(async (resolve, reject) => {
    // Perform the request
    return axios.get(`https://api.spotify.com/v1/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
      .then((response) => {
        tmpObj.status = 'SUCCESS';
        tmpObj.message = '';
        tmpObj.id = response && response.data && response.data.id ? response.data.id : null;
        return resolve(tmpObj);
      })
      .catch((error) => {
        tmpObj.status = 'FAILURE';
        tmpObj.message = `${error}`;
        return resolve(tmpObj);
      })
  });
}

/**
 * @description /users/{user_id}/playlists => retrieves all playlists a user currently has
 * @param {string} accessToken - The access token recently pulled via API
 * @param {string} userId - the id of the current user
 * @returns {Object} an object
 */
const getUsersPlaylists = async (accessToken, userId) => {
  if (!accessToken) {
    return null;
  }

  // Initialize response object
  const tmpObj = {};
  tmpObj.status = null;
  tmpObj.message = null;
  tmpObj.playlists = null;

  return new Promise(async (resolve, reject) => {
    let continueReqs = true;
    let offset = 0;
    let limit = 50; // min 0, max 50
    let numRequests = 0;
    let maxRequests = 20;

    while (continueReqs && numRequests < maxRequests) {
      try {
        // Perform the request
        const response = await axios.get(`https://api.spotify.com/v1/users/${userId}/playlists?offset=${offset}&limit=${limit}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        // Access the playlist information
        if (response && response.data && Array.isArray(response.data.items)) {
          // Ensure the playlists return property is not null
          if (!tmpObj.playlists) {
            tmpObj.playlists = {};
          }

          // Store the playlist names and ids
          for (let i = 0; i < response.data.items.length; i++) {
            const playlist = response.data.items[i];
            tmpObj.playlists[playlist.name] = playlist.id;
          }

          // Stop if there are no more playlists to retrieve
          if (response.data.items.length < limit) {
            continueReqs = false;
          }
        }

        // Update counters for looping
        numRequests += 1;
        offset += limit;
      } catch (error) {
        // On an error, immediately resolve an error response
        tmpObj.status = 'FAILURE';
        tmpObj.message = `${error}`;
        return resolve(tmpObj);
      }
    }
    
    // Send the final response
    tmpObj.status = 'SUCCESS';
    tmpObj.message = '';
    return resolve(tmpObj);
  });
}

/**
 * @description /users/{user_id}/playlists => creates a new playlist
 * @param {string} accessToken - The access token recently pulled via API
 * @param {string} userId - the id of the current user
 * @param {string} name - the name of the new playlist
 * @param {string} [description = ''] - the description for the new playlist
 * @param {boolean} [public = false] - whether or not the playlist will be public
 * @returns {Object} an object
 */
const createNewPlaylist = async (accessToken, userId, name, description = '', public = false) => {
  if (!accessToken || !name) {
    return null;
  }

  // Initialize response object
  const tmpObj = {};
  tmpObj.status = null;
  tmpObj.message = null;
  tmpObj.playlistName = null;
  tmpObj.playlistId = null;

  return new Promise(async (resolve, reject) => {
    // Create the payload
    const payload = {
      name: name,
      description: description,
      public: public
    };

    // Perform the request
    return axios.post(`https://api.spotify.com/v1/users/${userId}/playlists`, payload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
      .then((response) => {
        tmpObj.status = 'SUCCESS';
        tmpObj.message = '';
        tmpObj.playlistName = response && response.data && response.data.name ? response.data.name : null;
        tmpObj.playlistId = response && response.data && response.data.id ? response.data.id : null;
        return resolve(tmpObj);
      })
      .catch((error) => {
        tmpObj.status = 'FAILURE';
        tmpObj.message = `${error}`;
        return resolve(tmpObj);
      })
  });
}

/**
 * @description /playlists/{playlist_id}/tracks => retrieves the songs for a playlist
 * @param {string} accessToken - The access token recently pulled via API
 * @param {string} playlistId - the id for the playlist to retrieve songs for
 * @returns {Object} an object
 */
const getTracksForPlaylist = async (accessToken, playlistId) => {
  if (!accessToken || !playlistId) {
    return null;
  }

  // Initialize response object
  const tmpObj = {};
  tmpObj.status = null;
  tmpObj.message = null;
  tmpObj.tracks = null;

  return new Promise(async (resolve, reject) => {
    let continueReqs = true;
    let offset = 0;
    let limit = 100; // min 0, max 100
    let numRequests = 0;
    let maxRequests = 20;

    while (continueReqs && numRequests < maxRequests) {
      try {
        // Perform the request
        const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?market=ES&offset=${offset}&limit=${limit}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        // Access the track information
        if (response && response.data && Array.isArray(response.data.items)) {
          // Ensure the tracks return property is not null
          if (!tmpObj.tracks) {
            tmpObj.tracks = [];
          }

          // Store each track's URI
          for (let i = 0; i < response.data.items.length; i++) {
            const item = response.data.items[i];
            if (item && item.track && item.track.uri) {
              tmpObj.tracks.push(item.track.uri)
            }
          }

          // Stop if there are no more tracks to retrieve
          if (response.data.items.length < limit) {
            continueReqs = false;
          }
        }

        // Update counters for looping
        numRequests += 1;
        offset += limit;
      } catch (error) {
        // On an error, immediately resolve an error response
        tmpObj.status = 'FAILURE';
        tmpObj.message = `${error}`;
        return resolve(tmpObj);
      }
    }
    
    // Send the final response
    tmpObj.status = 'SUCCESS';
    tmpObj.message = '';
    return resolve(tmpObj);
  });
}

/**
 * @description /playlists/{playlist_id}/tracks => creates a new playlist
 * @param {string} accessToken - The access token recently pulled via API
 * @param {string} playlistId - the id of the playlist to add songs to
 * @param {string} tracksToAdd - the name of the new playlist
 * @returns {Object} an object
 */
const addTracksToPlaylist = async (accessToken, playlistId, tracksToAdd) => {
  if (!accessToken || !playlistId || !tracksToAdd) {
    return null;
  }

  // Initialize response object
  const tmpObj = {};
  tmpObj.status = null;
  tmpObj.message = null;

  return new Promise(async (resolve, reject) => {
    // Create the list of track URIs
    const trackURIs = tracksToAdd.join();

    // Perform the request
    return axios.post(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?uris=${trackURIs}`, null, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
      .then((response) => {
        tmpObj.status = 'SUCCESS';
        tmpObj.message = '';
        return resolve(tmpObj);
      })
      .catch((error) => {
        tmpObj.status = 'FAILURE';
        tmpObj.message = `${error}`;
        return resolve(tmpObj);
      })
  });
}

module.exports = {
  getAccessToken,
  getUserId,
  getUsersPlaylists,
  createNewPlaylist,
  getTracksForPlaylist,
  addTracksToPlaylist
}