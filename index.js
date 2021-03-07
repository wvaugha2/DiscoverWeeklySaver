var express = require('express'); // Express web server framework
var cors = require('cors');
var cookieParser = require('cookie-parser');
const routes = require('./routes');

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());
app.use('', routes);


console.log('Listening on 8888');
app.listen(8888);