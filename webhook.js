const postgresqlApi = require('./util/postgresql-api');
const addDiscoverWeeklyToDiscoverYear = require('./util/discover-weekly-saver-funcs').addDiscoverWeeklyToDiscoverYear;

/**
 * @description This function performs the Discover Weekly save action for all signed up users
 */
const performWebHook = async () => {
  try {
    // Retrieve all users
    const users = await postgresqlApi.getUsers();

    // For each user, perform the hook
    let webhookPromises = [];
    for (let i = 0; i < users.length; i++) {
      webhookPromises.push(addDiscoverWeeklyToDiscoverYear(users[i].user_id, users[i].refresh_token));
    }

    // Wait for all promises to resolve
    await Promise.all(webhookPromises);
  } catch (error) {
    console.log('Error while running webhook:', error);
  }
}

// Call the method to update the playlist when this file is run for the web hook
performWebHook();
