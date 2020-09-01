/**
 * Created by championswimmer on 24/11/16.
 */
const express = require('express');
const bodyParser = require('body-parser');
const forceSSL = require('express-force-ssl');
const config = require('./config.json');
const cors = require('cors');

const app = express();

app.set('forceSSLOptions', {
    enable301Redirects: config.ENABLE_301_HTTPS_REDIRECT,
    trustXFPHeader: config.TRUST_HTTPS_PROXY,
    sslRequiredMessage: config.NON_HTTPS_REQUEST_ERRMSG
});

const shortner = require('./utils/shortner');
const expressGa = require('express-ga-middleware');

const route = {
    api_v1: require('./routes/api_v1'),
    shortcode: require('./routes/shortcode'),
    auth: require('./routes/auth')
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.raw({
    inflate: true,
    limit: '100kb',
    type: '*/*'
}));


const redirectToHome = function (req, res) {
    res.redirect('http://codingblocks.com')
};


if (config.FORCE_HTTPS) {
    app.use('/admin', forceSSL)
}
app.use('/admin', express.static(__dirname + "/static/admin"));
app.use('/.well-known', express.static(__dirname + "/.well-known"));

app.use(expressGa('UA-83327907-4'));
app.use('/api/v1', cors(), route.api_v1);
app.use('/', route.shortcode);
app.use('/auth', route.auth);

// Redirects the user to IDE home page if no ID is provided
app.get('/ide', (req, res) => {
    res.redirect('http://ide.codingblocks.com');
})

// Redirects user to a particular place in IDE if he provides the ID
app.get('/ide/:id', (req, res) => {
    res.redirect(`http://ide.codingblocks.com/#/s/${req.params.id}`);
});

app.use(redirectToHome);


app.listen( process.env.PORT || 4000, () => {
    //console.log("Listening on http://localhost:" + (process.env.PORT || "4000") + "/");
    console.log("Express server listening on port %d in %s mode", (process.env.PORT || "4000"), app.settings.env);
});