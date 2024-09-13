const axios = require('axios');
const cheerio = require('cheerio');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// Function to get the current date in YYYY-MM-DD format
function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Scraping route
const scrapeData = async (req, res) => {
  const url = req.body.url;

  if (!url) {
    return res.status(400).send('URL is required.');
  }

  try {
    // Make a request to the user-provided website
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Extract data from the website
    const scrapedData = [];
    $('h1').each((index, element) => {
      scrapedData.push({ Tag: 'h1', Content: $(element).text() });
    });
    $('p').each((index, element) => {
      scrapedData.push({ Tag: 'p', Content: $(element).text() });
    });

    // Create an Excel file
    const worksheet = xlsx.utils.json_to_sheet(scrapedData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Scraped Data');

    // Generate file name with the current date
    const filename = `scraped_data_${getCurrentDate()}.xlsx`;
    const filepath = path.join(__dirname, '../public', filename);

    // Save the file to the public folder
    xlsx.writeFile(workbook, filepath);

    // Send the file as a response for download
    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('Error in sending file:', err);
      } else {
        // Optionally delete the file after download to keep things clean
        fs.unlinkSync(filepath);
      }
    });
  } catch (error) {
    console.error('Error during scraping or file creation:', error);
    res.status(500).send('Error during scraping or file creation.');
  }
};

module.exports = scrapeData;
