const express = require('express');
const router = express.Router();
const request = require('request'); // "Request" library
const querystring = require('querystring');
const nodeEnv = require('./nodeEnv');
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

router.get('/login', function(req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);
  // your application requests authorization
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: nodeEnv.CLIENT_ID,
      scope: scope,
      redirect_uri: nodeEnv.REDIRECT_URI,
      state: state
    })
  );
});
  
router.get('/callback', function(req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;
  if (state === null || state !== storedState) {
    res.redirect('/#' +
    querystring.stringify({
      error: 'state_mismatch'
    }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: nodeEnv.REDIRECT_URI,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer.from(nodeEnv.CLIENT_ID + ':' + nodeEnv.CLIENT_SECRET).toString('base64'))
      },
      json: true
    };
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        // Get the tokens
        var access_token = body.access_token, refresh_token = body.refresh_token;

        // Pass the token to the browser
        const htmlTxt = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <title>Discover Weekly Saver</title>        
              <style>
                  body { padding-top:20px; }
              </style>
          </head>
          <body>
            <p>Access Token: ${access_token}</p>
            <p>Refresh Token: ${refresh_token}</p>
          </body>
          </html>
        `;
        res.send(htmlTxt);
      } else {
        res.redirect('/#' +
          querystring.stringify({
              error: 'invalid_token'
          })
        );
      }
    });
  }
});

router.get('/refresh_token', function(req, res) {
  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer.from(nodeEnv.CLIENT_ID + ':' + nodeEnv.CLIENT_SECRET).toString('base64')) },
    form: {
    grant_type: 'refresh_token',
    refresh_token: refresh_token
    },
    json: true
  };
  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
          'access_token': access_token
      });
    }
  });
});

module.exports = router;