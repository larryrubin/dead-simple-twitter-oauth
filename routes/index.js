let express = require("express");
let router = express.Router();

const oauth = require("oauth");
const request = require("request");
const session = require("express-session");

router.use(session({ secret: process.env.COOKIE_SECRET }));

// grab key and secret from .env file in project root directory
const TWITTER_API_KEY = process.env.TWITTER_API_KEY;
const TWITTER_API_KEY_SECRET = process.env.TWITTER_API_KEY_SECRET;

// double check the key & secret were loaded in
if (TWITTER_API_KEY.length === 0 || TWITTER_API_KEY_SECRET.length === 0) {
  console.log("Could not load API key and/or secret from .env");
} else {
  console.log(
    "\nUsing:\nTWITTER_API_KEY:",
    TWITTER_API_KEY,
    "\nTWITTER_API_KEY_SECRET:",
    TWITTER_API_KEY_SECRET
  );
}

// Initialize the OAuth client
const client = new oauth.OAuth(
  "https://api.twitter.com/oauth/request_token",
  "https://api.twitter.com/oauth/access_token",
  TWITTER_API_KEY,
  TWITTER_API_KEY_SECRET,
  "1.0A",
  "http://localhost:3000/callback",
  "HMAC-SHA1"
);

function logDebugInfo(req) {
  console.log(
    "\n\n------ route:",
    req.path,
    "-----\n" + "Session vars\naccessToken:",
    req.session.accessToken,
    "\naccessSecret:",
    req.session.accessSecret,
    "\n"
  );
}

router.get("/", function (req, res) {
  logDebugInfo(req);

  res.render("index", { title: "Dead Simple Twitter OAuth 1.0a" });
});

router.get("/login", (req, res) => {
  logDebugInfo(req);

  // Generate a request token and redirect the user to the Twitter authorization page
  client.getOAuthRequestToken((error, requestToken, requestSecret) => {
    if (error) {
      res.status(500).send(error);
    } else {
      // Save the request secret in the session for later use
      req.session.requestSecret = requestSecret;
      // Redirect the user to the Twitter authorization page
      res.redirect(
        `https://api.twitter.com/oauth/authenticate?oauth_token=${requestToken}`
      );
    }
  });
});

router.get("/callback", (req, res) => {
  logDebugInfo(req);

  // Get the request token and verifier from the query parameters
  const requestToken = req.query.oauth_token;
  const verifier = req.query.oauth_verifier;

  // Get the request secret from the session
  const requestSecret = req.session.requestSecret;

  // Exchange the request token and verifier for an access token
  client.getOAuthAccessToken(
    requestToken,
    requestSecret,
    verifier,
    (error, accessToken, accessSecret) => {
      if (error) {
        res.status(500).send(error);
      } else {
        // Save the access token and secret in the session for making API calls
        req.session.accessToken = accessToken;
        req.session.accessSecret = accessSecret;

        console.log(
          "\naccessToken:",
          accessToken,
          "accessSecret:",
          accessSecret
        );
        // Redirect the user to the home page
        res.redirect("/");
      }
    }
  );
});

router.get("/logout", (req, res) => {
  // Clear the access token and secret from the session
  req.session.accessToken = null;
  req.session.accessSecret = null;

  logDebugInfo(req);

  // Redirect the user to the login page
  res.redirect("/");
});

router.get("/messages", (req, res) => {
  logDebugInfo(req);

  // Set up the request options
  const options = {
    url: "https://api.twitter.com/1.1/direct_messages/events/list.json",
    oauth: {
      consumer_key: TWITTER_API_KEY,
      consumer_secret: TWITTER_API_KEY_SECRET,
      token: req.session.accessToken,
      token_secret: req.session.accessSecret,
    },
  };

  // Send the request
  request.get(options, (error, response, body) => {
    if (error) {
      return res.send("Error retrieving messages: " + error);
    }
    res.send(body);
  });
});

router.get("/revoke", (req, res) => {
  logDebugInfo(req);

  const options = {
    url: "https://api.twitter.com/1.1/oauth/invalidate_token",
    oauth: {
      consumer_key: TWITTER_API_KEY,
      consumer_secret: TWITTER_API_KEY_SECRET,
      token: req.session.accessToken,
      token_secret: req.session.accessSecret,
    },
  };

  request.post(options, (error, response, body) => {
    if (error) {
      return res.send("Error revoking permissions: " + error);
    }
    console.log("Permissions revoked");
    req.session.accessToken = null;
    req.session.accessSecret = null;
    res.redirect("/");
  });
});

module.exports = router;
