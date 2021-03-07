const spotifyApi = require('./spotify-api');
const nodeEnv = require('./nodeEnv');

/**
 * @description This function adds the current Discover Weekly playlist to the current's year's Discover Year playlist
 */
const addDiscoverWeeklyToDiscoverYear = async () => {
  let accessToken = null;
  let discoverWeeklyId = null;
  let discoverYearId = null;

  // 1. Fetch an access token
  const getAccessTokenResponse = await spotifyApi.getAccessToken();
  if (!getAccessTokenResponse || getAccessTokenResponse.status !== 'SUCCESS') {
    return;
  }
  accessToken = getAccessTokenResponse.accessToken;

  // 2. Fetch the current user's playlists
  const getUsersPlaylistsResponse = await spotifyApi.getUsersPlaylists(accessToken);
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
    const createNewPlaylistResponse = await spotifyApi.createNewPlaylist(accessToken, `Discover ${nodeEnv.CURRENT_YEAR}`);
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
}

// Call the method to update the playlist when this file is run for the web hook
addDiscoverWeeklyToDiscoverYear();