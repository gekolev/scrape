const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const scraper = require('./api/scraper');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Define the API route for scraping
app.post('/api/scrape', scraper);

// Start the server
app.listen(port, () => {
  console.log(`Web scraper app listening at http://localhost:${port}`);
});
