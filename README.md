# DiscoverWeeklySaver
A small project that allows you to have your Spotify Discover Weekly playlist automatically saved to a playlist named 'Discover XXXX', where XXXX is the current year

# How To Setup
## Approximate Setup Time: 15 minutes
1. Fork the repository
2. Create a Heroku App from the repo - using the `main` branch as the primary branch to run.
    - if you don't have a Heroku account, create one at [Heroku's website](https://id.heroku.com/login)
    - to create a heroku app from the locally cloned repo, install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
    - make sure you are logged in by typing `heroku login` in the terminal
    - in your terminal from within the repo folder, type `heroku create`. This will create a new heroku application
3. Create a Spotify Application from the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications). You'll need to create a new app so that you have an application ClientID and ClientSecret - needed for performing the requests to save the playlist
    - From the Heroku Dashboard on your project's Settings tab, scroll down to copy the application's domain. Copy the shown domain URL.
    - In the settings for your Spotify application, add a callback URL by pasting the Heroku App URL ending with 'callback', e.g., `https://your-heroku-app-url.herokuapp.com/callback`
4. In the Heroku Dashboard, go to your project's Settings tab. You'll need to add the following Config Vars:
    - CLIENT_ID: the Client ID value copied from the Spotify Project
    - CLIENT_SECRET: the Client Secret value copied from the Spotify Project
    - REDIRECT_URL: paste the callback URL you added to your Spotify Project
5. Using your Heroku app's domain, visit the `/login` path, e.g., `https://your-heroku-app-url.herokuapp.com/login`
    - this will prompt you to login to Spotify and give your newly created Spotify application permission to read and update your playlists
    - after entering your information, it should return a page showing an Access Token and Refresh Token value -> Keep these values for the next step! (if you leave this page, just revisit the `/login` route to generate new tokens)
6. In the Heroku Dashboard, go to your project's Settings tab to add three new Config Vars:
    - ACCESS_TOKEN: your access token
    - REFRESH_TOKEN: your refresh token
    - USER_ID: your spotify username
2. In the Heroku Dashboard, go to your project's 'Resources' tab
    - search for and add Heroku Scheduler
3. Once Heroku Scheduler has been added to your project, click on it, and select 'Add Job'
    - for the time interval, select every day at 1:00 PM UTC
    - for the run command, enter: `node webhook.js`
4. Save the Heroku Scheduler job, and congrats! You're all set up to always keep your Discover playlists to never miss a mad bop again!

If you want to save the current week's Discover Weekly and you're setting this up Sunday before it refreshes, when you initially create the scheduled job, set it to run every 10 minutes so that it will run and save the playlist. After it runs, adjust the job to run every day at 1:00 PM UTC again.