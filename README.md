# DiscoverWeeklySaver
A small project that allows you to have your Spotify Discover Weekly playlist automatically saved to a playlist named 'Discover XXXX', where XXXX is the current year

# How To Setup
1. Fork the repository
2. Create a Heroku App from the repo - using the `main` branch as the primary branch to run.
    - if you don't have a Heroku account, create one at [Heroku's website](https://id.heroku.com/login)
    - to create a heroku app from the locally cloned repo, install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
    - make sure you are logged in by typing `heroku login` in the terminal
    - in your terminal from within the repo folder, type `heroku create`. This will create a new heroku application
2. In the Heroku Dashboard, go to your project's 'Resources' tab
    - search for and add Heroku Scheduler
3. Once Heroku Scheduler has been added to your project, click on it, and select 'Add Job'
    - for the time interval, select every day at 1:00 PM UTC
    - for the run command, enter: `node webhook.js`
4. Save the Heroku Scheduler job, and congrats! You're all set up to always keep your Discover playlists to never miss a mad bop again!

If you want to save the current week's Discover Weekly and you're setting this up Sunday before it refreshes, when you initially create the scheduled job, set it to run every 10 minutes so that it will run and save the playlist. After it runs, adjust the job to run every day at 1:00 PM UTC again.