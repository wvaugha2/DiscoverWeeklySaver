var express = require('express'); // Express web server framework
var cors = require('cors');
var cookieParser = require('cookie-parser');

const nodeEnv = require('./util/nodeEnv');
const postgresqlApi = require('./util/postgresql-api');
const appState = require('./util/app-state');
const routes = require('./routes');

var app = express();

const startup = async () => {
   app.use(express.static(__dirname + '/public'))
      .use(cors())
      .use(cookieParser());
   app.use('', routes);

   // Set the app to use EJS template engine
   app.set('views', './views');
   app.set('view engine', 'ejs');

   // Disable webpage caching
   app.use((req, res, next) => {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      res.set('Surrogate-Control', 'no-store');
      next();
   });

   // Retrieve users to initialize the number of users
   console.log('Fetching the current number of users on start up...')
   await postgresqlApi.getUsers();
   console.log('Current number of users:', appState.getNumUsers());

   // Begin listening
   console.log('\nListening on 8888');
   app.listen(nodeEnv.PORT);
}
startup();
