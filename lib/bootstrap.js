"use strict";

const bodyParser = require('body-parser'),
  fs = require('fs'),
  express = require('express'),
  path = require('path'),
  exphbs = require('express-handlebars');

module.exports = function bootstrapExpress(app) {
  app.use(bodyParser.urlencoded({
    extended: false
  }));
  app.use(bodyParser.json());
  app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs'
  }));
  app.enable('view cache');
  app.set('views', path.join(__dirname, '..', 'views'));
  app.set('view engine', '.hbs');
  fs.readdirSync(path.join(__dirname, '..', 'routes')).filter(function (v) {
    return /\.js$/.test(v);
  }).forEach(function (v) {
    require(path.join(__dirname, '..', 'routes', v))(app);
  });
  app.use('/', express.static(path.join(__dirname, '..', 'public')));
};
