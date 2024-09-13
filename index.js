const express = require('express');
const path = require('path');
const scraper = require('./routes/scraper');

const app = express();

// Use the environment variable PORT if it exists, otherwise default to 3000
const port = process.env.PORT || 3000;

// Serve the public folder to render the front-end
app.use(express.static(path.join(__dirname, 'public')));

// Scraping route
app.get('/scrape', scraper);

// Start the server
app.listen(port, () => {
  console.log(`Web scraper app listening at http://localhost:${port}`);
});
