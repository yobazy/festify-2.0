const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('Hello from the server!')
})

app.listen(8080, () => {
  console.log('server listening on port 8080')
})