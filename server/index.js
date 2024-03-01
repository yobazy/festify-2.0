const express = require('express');
const axios = require('axios');

require('dotenv').config(); // This loads the environment variables from the .env file

const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 8080;

// CORS options
const corsOptions = {
  // origin: 'http://localhost:3000', // Replace with your React app's domain
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

app.get('/', (req, res) => {
  res.send('Hello world!')
})

app.get('/spotifytoken', async (req, res) => {
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

  // Correctly encode client credentials
  const authOptions = {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials'
    })
  };

  try {
    // Make the POST request to Spotify's API
    console.log('trying to get response')
    const response = await fetch('https://accounts.spotify.com/api/token', authOptions);
    console.log('got response')
    // Parse the JSON response body to get the access token
    const data = await response.json();
    console.log(data); // Log the response data to debug


    res.status(200).json({ access_token: data.access_token });
  } catch (error) {
    console.error('Error fetching Spotify token:', error);
    // Provide more detailed error information for debugging
    res.status(500).json({ error: 'failed to get ', message: error.message });
  }
});

app.listen(8080, () => {
  console.log(`server listening on port ${PORT}`)
})