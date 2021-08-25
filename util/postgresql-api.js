const nodeEnv = require('./nodeEnv');
const appState = require('./app-state');
const { Pool } = require('pg');
const pool = new Pool({
  user: nodeEnv.PGUSER,
  password: nodeEnv.PGPASSWORD,
  database: nodeEnv.PGDATABASE,
  port: nodeEnv.PGPORT,
  host: nodeEnv.PGHOST,
  ssl: {
    rejectUnauthorized: false
  }
});

/**
 * @description If we have a connection error, log to the console
 * @returns {void}
 */
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
})

/**
 * @description Retrieves all users currently signed up for the application
 * @returns {Object[]} An array of user info objects 
 */
const getUsers = async () => {
  return new Promise(async (resolve) => {
    pool.connect(async (error, client, done) => {
      // If an error occurred, throw
      if (error) {
        console.error('Unexpected error while connecting to pool:', error);
        return resolve(null);
      }

      try {
        // Perform the query to retrieve the results and release the client
        const query = 'SELECT * FROM public."Users"';
        const queryResults = await client.query(query);
        client.release();

        // Update the local state for number of users currently signed up
        appState.updateNumUsers(queryResults.rows.length);

        // Return the results
        return resolve(queryResults.rows);
      } catch (error) {
        client.release();
        console.error('Unexpected error while querying:', error);
        return resolve(null);
      }
    });
  });
}

/**
 * @description Adds a new user to the application
 * @param {string} userId - the id of the user to add
 * @param {refreshToken} refreshToken - the refresh_token of the user to add
 * @param {string} iv - the initialization vector used to encrypt the refresh token
 * @returns {Boolean} true on success, false on failure
 */
const addUser = async (userId, refreshToken, iv) => {
  return new Promise(async (resolve) => {
    pool.connect(async (error, client, done) => {
      // If an error occurred, throw
      if (error) {
        console.error('Unexpected error while connecting to pool:', error);
        return resolve(false);
      }

      try {
        // Perform the query to retrieve the results and release the client
        const query = 'INSERT INTO public."Users" (user_id, refresh_token, iv) VALUES ($1, $2, $3)';
        await client.query(query, [userId, refreshToken, iv]);
        client.release();

        // Update the local state for number of users currently signed up
        appState.updateNumUsers(appState.getNumUsers() + 1);

        // Return the results
        return resolve(true);
      } catch (error) {
        client.release();
        console.error('Unexpected error while querying:', error);
        return resolve(false);
      }
    });
  });
}

/**
 * @description Updates a user for the application
 * @param {string} userId - the id of the user to update
 * @param {string} refreshToken - the new refresh_token of the user
 * @param {string} iv - the initialization vector used to encrypt the refresh token
 * @returns {Boolean} true on success, false on failure
 */
const updateUser = async (userId, refreshToken, iv) => {
  return new Promise(async (resolve) => {
    pool.connect(async (error, client, done) => {
      // If an error occurred, throw
      if (error) {
        console.error('Unexpected error while connecting to pool:', error);
        return resolve(false);
      }

      try {
        // Perform the query to retrieve the results and release the client
        const query = 'UPDATE public."Users" SET refresh_token = $2, iv = $3 WHERE user_id = $1';
        await client.query(query, [userId, refreshToken, iv]);
        client.release();

        // Return the results
        return resolve(true);
      } catch (error) {
        client.release();
        console.error('Unexpected error while querying:', error);
        return resolve(false);
      }
    });
  });
}

/**
 * @description Deletes a user from the application
 * @param {string} userId - the id of the user to delete
 * @returns {Boolean} true on success, false on failure
 */
const deleteUser = async (userId) => {
  return new Promise(async (resolve) => {
    pool.connect(async (error, client, done) => {
      // If an error occurred, throw
      if (error) {
        console.error('Unexpected error while connecting to pool:', error);
        return resolve(false);
      }

      try {
        // Perform the query to retrieve the results and release the client
        const query = 'DELETE FROM public."Users" WHERE user_id = $1';
        await client.query(query, [userId]);
        client.release();

        // Update the local state for number of users currently signed up
        appState.updateNumUsers(appState.getNumUsers() - 1);

        // Return the results
        return resolve(true);
      } catch (error) {
        client.release();
        console.error('Unexpected error while querying:', error);
        return resolve(false);
      }
    });
  });
}

module.exports = {
  getUsers,
  addUser,
  updateUser,
  deleteUser
}
