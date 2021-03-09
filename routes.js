const express = require('express');
const router = express.Router();
const request = require('request'); // "Request" library
const querystring = require('querystring');

const nodeEnv = require('./util/nodeEnv');
const appState = require('./util/app-state');
const spotifyApi = require('./util/spotify-api');
const postgresqlApi = require('./util/postgresql-api');
const addDiscoverWeeklyToDiscoverYear = require('./util/discover-weekly-saver-funcs').addDiscoverWeeklyToDiscoverYear;
const readHtmlFile = require('./util/fileReader').readHtmlFile;
var stateKey = 'spotify_auth_state';

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

/**
 * @description Home page
 */
router.get('/', function(req, res) {
  const numUsers = appState.getNumUsers();
  if (numUsers && numUsers >= nodeEnv.SIGNUP_LIMIT) {
    return res.send(readHtmlFile('home-no-signup.html'));
  } else {
    return res.send(readHtmlFile('home.html'));
  }
});

/**
 * @description Page to authorize account for application
 */
router.get('/login', function(req, res) {
  // If number of users is at the max, redirect to a page showing show
  const numUsers = appState.getNumUsers();
  if (numUsers && numUsers >= nodeEnv.SIGNUP_LIMIT) {
    return res.redirect('/');
  }

  var state = generateRandomString(16);
  res.cookie(stateKey, state);
  // your application requests authorization
  var scope = 'user-read-private user-read-email playlist-read-private playlist-modify-private playlist-modify-public';
  return res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: nodeEnv.CLIENT_ID,
      scope: scope,
      redirect_uri: nodeEnv.REDIRECT_URI,
      state: state
    })
  );
});

/**
 * @description Signup Success page
 */
router.get('/signup-success', function(req, res) {
  return res.send(readHtmlFile('signup-success.html'));
});

/**
 * @description Signup Failure page
 */
router.get('/signup-failure', function(req, res) {
  return res.send(readHtmlFile('signup-failure.html'));
});
  
/**
 * @description Callback for logging in to Spotify
 */
router.get('/callback', async function(req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;
  if (state === null || state !== storedState) {
    return res.redirect('/signup-failure');
  } else {
    res.clearCookie(stateKey);

    // Use the authorization code to get an access and refresh token
    const getAccessTokenResponse = await spotifyApi.getAccessToken(code);
    if (!getAccessTokenResponse || getAccessTokenResponse.status !== 'SUCCESS') {
      return res.redirect('/signup-failure');
    }

    // Get the user id
    const getUserIdResponse = await spotifyApi.getUserId(getAccessTokenResponse.accessToken);
    if (!getUserIdResponse || getUserIdResponse.status !== 'SUCCESS') {
      return res.redirect('/signup-failure');
    }

    // Get all existing users for app; If the user is already signed up, don't sign them up again. Instead, update the refresh token
    const users = await postgresqlApi.getUsers();
    if (Array.isArray(users) && users.findIndex(user => user.user_id === getUserIdResponse.id) !== -1) {
      postgresqlApi.updateUser(getUserIdResponse.id, getAccessTokenResponse.refreshToken);
      return res.redirect('/signup-success');
    }

    // Add the new user and kick off an asynchronous call to manually run the web hook
    const addSuccess = await postgresqlApi.addUser(getUserIdResponse.id, getAccessTokenResponse.refreshToken);
    if (!addSuccess) {
      return res.redirect('/signup-failure');
    }
    await addDiscoverWeeklyToDiscoverYear(getUserIdResponse.id, getAccessTokenResponse.refreshToken);

    // If all is well, redirect the user to the signup success page
    return res.redirect('/signup-success');
  };
});

// router.get('/refresh_token', function(req, res) {
//   // requesting access token from refresh token
//   var refresh_token = req.query.refresh_token;
//   var authOptions = {
//     url: 'https://accounts.spotify.com/api/token',
//     headers: { 'Authorization': 'Basic ' + (new Buffer.from(nodeEnv.CLIENT_ID + ':' + nodeEnv.CLIENT_SECRET).toString('base64')) },
//     form: {
//     grant_type: 'refresh_token',
//     refresh_token: refresh_token
//     },
//     json: true
//   };
//   request.post(authOptions, function(error, response, body) {
//     if (!error && response.statusCode === 200) {
//       var access_token = body.access_token;
//       res.send({
//           'access_token': access_token
//       });
//     }
//   });
// });

module.exports = router;