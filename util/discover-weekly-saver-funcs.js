const spotifyApi = require('./spotify-api');
const postgresqlApi = require('./postgresql-api');
const nodeEnv = require('./nodeEnv');

/**
 * @description This function adds the current Discover Weekly playlist to the current's year's Discover Year playlist
 * @param {string} userId - the user id of the current user
 * @param {string} refreshToken - the refresh_token of the current user
 */
const addDiscoverWeeklyToDiscoverYear = async (userId, refreshToken) => {
  let accessToken = null;
  let discoverWeeklyId = null;
  let discoverYearId = null;

  try {
    // 1. Fetch an access token
    const getAccessTokenResponse = await spotifyApi.getAccessToken(null, refreshToken);
    if (!getAccessTokenResponse || getAccessTokenResponse.status !== 'SUCCESS') {
      // If the user has revoked access, remove them from the application
      if (getAccessTokenResponse && getAccessTokenResponse.message === 'invalid_grant') {
        await postgresqlApi.deleteUser(userId);
      }
      return;
    }
    accessToken = getAccessTokenResponse.accessToken;

    // If a new refresh token was returned for the user, update the refresh token
    if (getAccessTokenResponse.refreshToken) {
      await postgresqlApi.updateUser(userId, getAccessTokenResponse.refreshToken);
    }

    // 2. Fetch the current user's playlists
    const getUsersPlaylistsResponse = await spotifyApi.getUsersPlaylists(accessToken, userId);
    if (!getUsersPlaylistsResponse || getUsersPlaylistsResponse.status !== 'SUCCESS') {
      return;
    }

    // 3. Get the ID for the current Discover Weekly playlist and current Discover Year playlist
    discoverWeeklyId = getUsersPlaylistsResponse.playlists['Discover Weekly'];
    discoverYearId = getUsersPlaylistsResponse.playlists[`Discover ${nodeEnv.CURRENT_YEAR}`];
    if (!discoverWeeklyId) {
      return;
    }

    // 4. If the Discover Year playlist doesn't exist for the current year, create it
    if (!discoverYearId) {
      const createNewPlaylistResponse = await spotifyApi.createNewPlaylist(accessToken, userId, `Discover ${nodeEnv.CURRENT_YEAR}`);
      if (!createNewPlaylistResponse || createNewPlaylistResponse.status !== 'SUCCESS') {
        return;
      }
      discoverYearId = createNewPlaylistResponse.playlistId;
    }

    // 5. Retrieve all songs currently on the Discover Weekly Playlist
    const getTracksForPlaylistResponseWeekly = await spotifyApi.getTracksForPlaylist(accessToken, discoverWeeklyId);
    if (!getTracksForPlaylistResponseWeekly || getTracksForPlaylistResponseWeekly.status !== 'SUCCESS') {
      return;
    }

    // 6. Retrieve all songs currently on the Discover Year Playlist
    const getTracksForPlaylistResponseYear = await spotifyApi.getTracksForPlaylist(accessToken, discoverYearId);
    if (!getTracksForPlaylistResponseYear || getTracksForPlaylistResponseYear.status !== 'SUCCESS') {
      return;
    }

    // 7. Filter out existing songs already on the Discover Year Playlist and add new songs to Discover Year Playlist
    let tracksToAdd = getTracksForPlaylistResponseWeekly.tracks.filter((track) => !getTracksForPlaylistResponseYear.tracks.includes(track));
    if (tracksToAdd.length > 0) {
      const addTracksToPlaylistResponse = await spotifyApi.addTracksToPlaylist(accessToken, discoverYearId, tracksToAdd);
    }
  } catch (error) {
    console.error(`Error while processing webhook for user ${userId}:`, error);
  }
}

module.exports = {
  addDiscoverWeeklyToDiscoverYear
}
