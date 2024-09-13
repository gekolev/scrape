const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const scraper = require('./api/scraper');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the public folder to render the front-end
app.use(express.static(path.join(__dirname, 'public')));

// Scraping route
app.post('/scrape', scraper);

// Start the server
app.listen(port, () => {
  console.log(`Web scraper app listening at http://localhost:${port}`);
});
