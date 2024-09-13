const axios = require('axios');
const cheerio = require('cheerio');
const xlsx = require('xlsx');

// Function to get the current date in YYYY-MM-DD format
function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

module.exports = async function handler(req, res) {
  if (req.method === 'POST') {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    try {
      // Fetch the webpage with UTF-8 encoding
      const { data } = await axios.get(url, {
        responseType: 'arraybuffer',  // Use arraybuffer to avoid encoding issues
        responseEncoding: 'binary'    // Ensure no corruption for Cyrillic characters
      });

      const decodedData = Buffer.from(data, 'binary').toString('utf-8');  // Convert binary response to UTF-8

      // Parse the HTML using Cheerio
      const $ = cheerio.load(decodedData);

      // Check if the document language is Bulgarian (lang="bg")
      const htmlLang = $('html').attr('lang');
      if (htmlLang !== 'bg') {
        return res.status(400).json({ error: 'The page is not in Bulgarian.' });
      }

      // Extract all <h1> and <p> tags
      const scrapedData = [];
      
      $('h1').each((index, element) => {
        scrapedData.push({ Tag: 'h1', Content: $(element).text() });
      });
      
      $('p').each((index, element) => {
        scrapedData.push({ Tag: 'p', Content: $(element).text() });
      });

      // Create an Excel file with the extracted data
      const worksheet = xlsx.utils.json_to_sheet(scrapedData);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Scraped Data');

      // Write the Excel file to buffer
      const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      // Set headers to download the file
      res.setHeader('Content-Disposition', `attachment; filename="scraped_data_${getCurrentDate()}.xlsx"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(excelBuffer);

    } catch (error) {
      console.error('Error during scraping or file creation:', error);
      res.status(500).json({ error: 'Error during scraping or file creation' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};
