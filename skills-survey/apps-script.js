// ─────────────────────────────────────────────────────────────────────────────
// celebrate-ai-sessions · Skills Survey · Google Apps Script
//
// Setup:
//  1. Open your Google Sheet → Extensions → Apps Script
//  2. Delete the default code and paste this entire file
//  3. Fill in SLACK_WEBHOOK_URL below
//  4. Deploy → New Deployment → Web App
//     - Execute as: Me
//     - Who has access: Anyone
//  5. Copy the deployment URL into index.html (APPS_SCRIPT_URL)
// ─────────────────────────────────────────────────────────────────────────────

const SLACK_WEBHOOK_URL = 'YOUR_SLACK_WEBHOOK_URL'; // e.g. https://hooks.slack.com/services/...
const SHEET_NAME = 'Skills Session';

function doPost(e) {
  try {
    const raw = e.postData ? e.postData.contents : '';
    const data = JSON.parse(raw);

    writeToSheet(data);
    sendToSlack(data);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function writeToSheet(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  // Create sheet with headers if it doesn't exist yet
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'Timestamp',
      'Name',
      'Email',
      'Available Slots',
      'Using Skills',
      'Skill Types',
      'Contribution',
      'Time Needed',
      'Open Questions'
    ]);
    // Bold header row
    sheet.getRange(1, 1, 1, 9).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    new Date(),
    data.name        || '',
    data.email       || '',
    data.slots       || '',
    data.ynChoice    || '',
    data.skills      || '',
    data.contribution|| '',
    data.timeNeeded  || '',
    data.questions   || ''
  ]);
}

function sendToSlack(data) {
  if (!SLACK_WEBHOOK_URL || SLACK_WEBHOOK_URL === 'YOUR_SLACK_WEBHOOK_URL') return;

  const ynLabel = {
    yes: 'Yes, actively',
    kinda: 'Exploring',
    no: 'Not yet'
  }[data.ynChoice] || '-';

  let text = `📋 *Skills Session - Pre-Survey*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `👤 *Name:* ${data.name || '-'}`;
  if (data.email) text += ` (${data.email})`;
  text += `\n\n`;
  text += `📅 *Available slots:* ${data.slots || 'none selected'}\n\n`;
  text += `⚙️ *Using Skills:* ${ynLabel}\n`;
  if (data.skills) text += `   Skills: ${data.skills}\n`;
  text += `\n💬 *Contribution:*\n${data.contribution || '(not planning to contribute)'}\n\n`;
  text += `⏱️ *Time needed:* ${data.timeNeeded || 'not specified'}\n\n`;
  text += `❓ *Open questions:*\n${data.questions || '(none)'}`;

  UrlFetchApp.fetch(SLACK_WEBHOOK_URL, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ text, mrkdwn: true })
  });
}
