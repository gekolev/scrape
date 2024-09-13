const express = require('express');
const bodyParser = require('body-parser');
const scraper = require('./api/scraper');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/api/scrape', scraper);

app.listen(port, () => {
  console.log(`Web scraper app listening at http://localhost:${port}`);
});