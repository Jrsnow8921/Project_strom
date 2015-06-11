var express = require('express');
var stormpath = require('express-stormpath');

var app = express();

app.set('views', './views');
app.set('view engine', 'jade');

var stormpathMiddleware = stormpath.init(app, {
  apiKeyFile: '/home/jsnow/apiKey-6Y6DUKVQI824ARVHK3B7ECFS3.properties',
  application: 'https://api.stormpath.com/v1/applications/4VtONrur30UO6k4fHA3Qgl',
  secretKey: 'xyyyyewwnjaskjfsdfac232349819893249132ndsxckanndsisknskakn213243221snowjjustin293r43',
  expandCustomData: true,
  enableForgotPassword: true
});

app.use(stormpathMiddleware);

app.get('/', function(req, res) {
  res.render('home', {
    title: 'Welcome'
  });
});

app.use('/profile',stormpath.loginRequired,require('./profile')());

app.listen(3000);
