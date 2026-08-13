/**
 * ShezBotics — form receiver
 * Writes every submission to a tab in this Sheet and emails an alert.
 *
 * SETUP (once, about 5 minutes)
 * 1. Go to sheets.new — name it "ShezBotics Enquiries".
 * 2. Extensions ▸ Apps Script. Delete the sample code, paste this file in.
 * 3. Change NOTIFY below if you want alerts sent somewhere else.
 * 4. Deploy ▸ New deployment ▸ type "Web app".
 *      Execute as        : Me
 *      Who has access    : Anyone            <-- must be "Anyone", not "Anyone with Google account"
 * 5. Authorise when prompted (choose your account ▸ Advanced ▸ Go to project ▸ Allow).
 * 6. Copy the /exec URL it gives you.
 * 7. Paste that URL into script.js  ▸  var SHEZ_ENDPOINT = '...';
 *
 * Tabs are created automatically: Demo, Schools, Corporate, Contact.
 * New form fields add themselves as new columns — you never edit this file again.
 */

var NOTIFY = 'team.shezbotics@gmail.com';
var BRAND = 'ShezBotics';

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);                       // stops two submissions racing on one row

  try {
    var data = JSON.parse(e.postData.contents);
    var tab = String(data._form || 'Other').replace(/[^\w \-]/g, '').slice(0, 40) || 'Other';

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(tab);
    if (!sh) {
      sh = ss.insertSheet(tab);
      sh.appendRow(['Received']);
      sh.setFrozenRows(1);
      sh.getRange('1:1').setFontWeight('bold');
    }

    var lastCol = Math.max(1, sh.getLastColumn());
    var header = sh.getRange(1, 1, 1, lastCol).getValues()[0];

    // append any field we haven't seen before as a new column
    Object.keys(data).forEach(function (key) {
      if (key.charAt(0) === '_') return;
      if (header.indexOf(key) === -1) {
        header.push(key);
        sh.getRange(1, header.length).setValue(key).setFontWeight('bold');
      }
    });

    var row = header.map(function (h) {
      if (h === 'Received') return new Date();
      return data[h] === undefined ? '' : data[h];
    });
    sh.appendRow(row);
    sh.autoResizeColumns(1, Math.min(header.length, 20));

    sendAlert(tab, data, ss.getUrl());

    return json({ ok: true, tab: tab });
  } catch (err) {
    // still tell you something arrived, even if the sheet write failed
    try {
      MailApp.sendEmail(NOTIFY, BRAND + ' — form error', String(err) + '\n\n' + (e && e.postData ? e.postData.contents : ''));
    } catch (ignored) {}
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json({ ok: true, message: BRAND + ' form receiver is running.' });
}

function sendAlert(tab, data, sheetUrl) {
  var titles = {
    Demo: 'New free demo booking',
    Schools: 'New school proposal request',
    Corporate: 'New corporate training enquiry',
    Contact: 'New course enquiry'
  };
  var subject = BRAND + ' — ' + (titles[tab] || 'New submission') +
    (data.name || data.student_name || data.school_name || data.company_name
      ? ' — ' + (data.name || data.student_name || data.school_name || data.company_name)
      : '');

  var rows = Object.keys(data)
    .filter(function (k) { return k.charAt(0) !== '_' && String(data[k]).trim() !== ''; })
    .map(function (k) {
      return '<tr>' +
        '<td style="padding:6px 14px 6px 0;color:#667;vertical-align:top;white-space:nowrap">' + label(k) + '</td>' +
        '<td style="padding:6px 0;color:#111">' + escapeHtml(String(data[k])) + '</td>' +
        '</tr>';
    }).join('');

  var reply = data.email && /\S+@\S+\.\S+/.test(data.email) ? data.email : null;

  var body =
    '<div style="font-family:system-ui,Arial,sans-serif;max-width:640px">' +
    '<h2 style="margin:0 0 4px">' + (titles[tab] || 'New submission') + '</h2>' +
    '<p style="margin:0 0 18px;color:#667;font-size:13px">' + tab + ' · ' +
    Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'd MMM yyyy, HH:mm') + '</p>' +
    '<table style="border-collapse:collapse;font-size:14px">' + rows + '</table>' +
    (reply ? '<p style="margin:22px 0 0"><a href="mailto:' + reply + '">Reply to ' + reply + '</a></p>' : '') +
    (data.phone ? '<p style="margin:8px 0 0"><a href="https://wa.me/' + String(data.phone).replace(/\D/g, '') + '">WhatsApp ' + escapeHtml(data.phone) + '</a></p>' : '') +
    '<p style="margin:22px 0 0;font-size:13px"><a href="' + sheetUrl + '">Open the sheet</a></p>' +
    '</div>';

  var opts = { to: NOTIFY, subject: subject, htmlBody: body, name: BRAND + ' website' };
  if (reply) opts.replyTo = reply;
  MailApp.sendEmail(opts);
}

function label(key) {
  return key.replace(/_/g, ' ').replace(/^\w/, function (c) { return c.toUpperCase(); });
}

function escapeHtml(str) {
  return str.replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Run this once from the editor to check mail permissions before deploying. */
function testAlert() {
  sendAlert('Demo', { student_name: 'Test Student', email: NOTIFY, phone: '+91 95457 97867' }, 'https://sheets.google.com');
}
