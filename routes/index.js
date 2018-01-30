const express = require('express');
const passport = require('passport');
const uuidv4 = require('uuid/v4');
const router = express.Router();

const env = {
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_CALLBACK_URL: process.env.AUTH0_CALLBACK_URL || 'http://app1.com:3000/callback',
  AUDIENCE: process.env.AUDIENCE || 'https://#{env.AUTH0_DOMAIN}/userinfo',
  SCOPE: process.env.SCOPE
};

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express', env: env });
});

router.get('/elogin', function (req, res) {
  res.render('login', { env: env });
});

router.get('/clogin', function (req, res) {
  req.session.state = uuidv4();
  const url = `https://${env.AUTH0_DOMAIN}/authorize?response_type=code&client_id=${env.AUTH0_CLIENT_ID}` +
        `&redirect_uri=${env.AUTH0_CALLBACK_URL}&audience=${env.AUDIENCE}&state=${req.session.state}&scope=${env.SCOPE}`;
  res.redirect(url);
});

router.get('/auth', function (req, res) {
  if (req.user) {
    res.redirect('/user');
  } else {
    // check if SSO session exists..
    req.session.state = uuidv4();
    const url = `https://${env.AUTH0_DOMAIN}/authorize?response_type=code&client_id=${env.AUTH0_CLIENT_ID}` +
        `&redirect_uri=${env.AUTH0_CALLBACK_URL}&audience=${env.AUDIENCE}&state=${req.session.state}&scope=${env.SCOPE}&prompt=none`;
    res.redirect(url);
  }
});

router.get('/logout', function (req, res) {
  req.logout();
  const callbackUrl = env.AUTH0_CALLBACK_URL;
  const returnToUrl = callbackUrl.substr(0, callbackUrl.lastIndexOf('/'));
  res.redirect(`https://${env.AUTH0_DOMAIN}/v2/logout?returnTo=${returnToUrl}`);
});

router.get('/callback',
  passport.authenticate('auth0', { failureRedirect: '/failure' }),
  function (req, res) {
    // res.redirect(req.session.returnTo || '/user');
    res.redirect('/user');
  });

router.get('/failure', function (req, res) {
  var error = req.flash('error');
  var errorDescription = req.flash('error_description');
  req.logout();
  res.render('failure', {
    error: error[0],
    error_description: errorDescription[0]
  });
});

module.exports = router;
