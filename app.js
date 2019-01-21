const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const server = require('http').Server(app);
const morgan = require('morgan');
const models = require('./models');
const port = 3000;
app.use(function (req, res, next) {
   res.header('Access-Control-Allow-Origin', '*');
   res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
   res.header("Access-Control-Allow-Origin");
   res.header("Access-Control-Allow-Headers", "Origin, Authorization,Access-Control-Allow-Request-Method,X-Requested-With, Content-Type, Accept");
   res.header("Access-Control-Allow-Credentials", "true");
   next();
});

app.use(bodyParser.json({
   limit: '20mb',
   parameterLimit: 1000
}));
app.use(bodyParser.urlencoded({
   limit: '20mb',
   extended: true,
   parameterLimit: 1000000
}));

app.use(morgan('":method :url :status" [:date[clf]] :user-agent :response-time ms :referrer'));

require('./config/routes/routes')(router, app);
server.listen(port, function() {
    console.log("Server started at port " + port);
});

module.exports = {
    server: server
}

