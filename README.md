[![Codacy Badge](https://app.codacy.com/project/badge/Grade/68a5d9e029714e038eed23ed0f750fb6)](https://www.codacy.com/gh/larryrubin/dead-simple-twitter-oauth/dashboard?utm_source=github.com&utm_medium=referral&utm_content=larryrubin/dead-simple-twitter-oauth&utm_campaign=Badge_Grade)

dead-simple-twitter-oauth

Dead Simple Twitter Oauth 1.0a

Very minimal Node.js + express authorization app. Uses Twitter's OAuth 1.0a API endpoints.

Instructions:

Create a new Twitter App here: https://developer.twitter.com/en/portal/projects-and-apps

Make note of your API key & secret

From your terminal:

git clone https://github.com/larryrubin/dead-simple-twitter-oauth.git

cd dead-simple-twitter-oauth

npm i

Edit env-sample with your API key/secret and then rename it to .env

To start the server:

npm run dev

Navigate to http://localhost:3000
