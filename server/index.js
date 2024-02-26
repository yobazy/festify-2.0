const express = require('express');
const app = express();

console.log(app)

app.listen(8080, () => {
  console.log('server listening on port 8080')
})