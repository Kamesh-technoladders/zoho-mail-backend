const express = require('express');
const axios = require('axios');
const app = express();
require('dotenv').config();


app.use(express.json());

const ZEPTO_TOKEN = process.env.ZEPTO_TOKEN;
const ZEPTO_URL = 'api.zeptomail.in/';

app.post('/send-email', async (req, res) => {
  const { reportData } = req.body;

  const tableHeaders = ['Client Name', 'Total Candidates', 'Processed', 'Interviewed', 'Offered', 'Joined'];
  const tableRows = reportData.map((client, index) => [
    client.name,
    client.totalCandidates || 0,
    client.statusBreakdown.find(s => s.statusName === 'Processed')?.count || 0,
    client.statusBreakdown.find(s => ['Interview', 'Interviewed'].includes(s.statusName))?.count || 0,
    client.statusBreakdown.find(s => s.statusName === 'Offered')?.count || 0,
    client.statusBreakdown.find(s => s.statusName === 'Joined')?.count || 0,
  ]);

  const tableHtml = `
    <table style="width: 100%; border-collapse: collapse; font-family: Inter, sans-serif; margin-top: 20px;">
      <thead><tr style="background-color: #646464; color: white;">
        ${tableHeaders.map(header => `<th style="padding: 8px; text-align: left; border: 1px solid #ddd;">${header}</th>`).join('')}
      </tr></thead>
      <tbody>
        ${tableRows.map((row, index) => `
          <tr style="background-color: ${index % 2 === 0 ? '#f0f0f0' : 'white'};">
            ${row.map(cell => `<td style="padding: 8px; border: 1px solid #ddd;">${cell}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  const emailData = {
    from: { address: "no-reply@hrumbles.ai", name: "noreply" },
    to: [{ email_address: { address: "Kamesh.t@technoladders.com", name: "kamesh" } }],
    subject: "Daily Client Report - " + new Date().toLocaleDateString(),
    htmlbody: `<div style="font-family: Inter, sans-serif; padding: 20px;"><h2 style="color: #1f2937;">Daily Client Report</h2><p style="color: #475569;">Below is the daily report for ${new Date().toLocaleDateString()}:</p>${tableHtml}</div>`,
  };

  try {
    const response = await axios.post(ZEPTO_URL, emailData, {
      headers: {
        Authorization: `Zoho-enc ${ZEPTO_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.data && response.data.message === 'Email sent successfully') {
      res.send("Email sent successfully!");
    } else {
      res.status(400).send("Email not sent. Check response.");
    }
  } catch (error) {
    console.error("Error sending email:", error.response?.data || error.message);
    res.status(500).send(`Failed to send email: ${error.message}`);
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
