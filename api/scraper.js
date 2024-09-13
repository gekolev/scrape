// scraper.js (CommonJS style)
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

// Scraping handler function
async function handler(req, res) {
  if (req.method === 'POST') {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      const scrapedData = [];
      $('h1').each((index, element) => {
        scrapedData.push({ Tag: 'h1', Content: $(element).text() });
      });
      $('p').each((index, element) => {
        scrapedData.push({ Tag: 'p', Content: $(element).text() });
      });

      const worksheet = xlsx.utils.json_to_sheet(scrapedData);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Scraped Data');

      const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Disposition', `attachment; filename="scraped_data_${getCurrentDate()}.xlsx"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(excelBuffer);

    } catch (error) {
      res.status(500).json({ error: 'Error during scraping or file creation' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}

module.exports = handler;
