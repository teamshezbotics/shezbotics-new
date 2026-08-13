# ShezBotics — setup

## 1. Files

Upload all of these into your site root, keeping your existing `assets/` folder alongside:

```
index.html      style.css       assets/
demo.html       script.js
schools.html
corporate.html
privacy.html
```

`apps-script/Code.gs` does **not** go on the server — it goes into Google Apps Script (step 2).

## 2. Connect the Google Sheet + alert email — 5 minutes

Until this is done, forms fall back to FormSubmit email only and nothing reaches a Sheet.

1. Open **sheets.new** — name it *ShezBotics Enquiries*.
2. **Extensions ▸ Apps Script**. Delete the sample code, paste in all of `apps-script/Code.gs`.
3. Run the `testAlert` function once. Authorise when prompted:
   *choose your account ▸ Advanced ▸ Go to project ▸ Allow*. Check the test mail arrives.
4. **Deploy ▸ New deployment ▸ Web app**
   - Execute as: **Me**
   - Who has access: **Anyone** ← must be "Anyone", not "Anyone with a Google account"
5. Copy the `/exec` URL it gives you.
6. Open `script.js`, line ~200, and paste it in:

```js
var SHEZ_ENDPOINT = 'https://script.google.com/macros/s/AKfy…/exec';
```

7. Submit one test form on the live site. You should get an email **and** a new row.

Tabs create themselves: **Demo**, **Schools**, **Corporate**, **Contact**.
Add a form field later and it appears as a new column automatically — you never edit `Code.gs` again.

### If you redeploy
Apps Script issues a **new URL** on *New deployment*. Use **Manage deployments ▸ edit ▸ Version: New version**
to keep the same URL, otherwise you must re-paste it into `script.js`.

## 3. Photos to add

Everything else works without these; the layout just shows empty boxes until they exist.

| File | Shot | Size |
|---|---|---|
| `assets/schools/hero.jpg` | Wide — students mid-build, you in frame, school room visible | 1600×900 |
| `assets/schools/proof-1.jpg` | Close-up, hands on an Arduino | 800×600 |
| `assets/schools/proof-2.jpg` | Full classroom working | 800×600 |
| `assets/schools/proof-3.jpg` | Students with finished builds | 800×600 |

`corporate.html` intentionally ships with **no photos**. Add them only when you have real
adult-training shots — school-kid photos on that page will cost you corporate credibility.

## 4. Recent changes

- Age range is now **8–20** everywhere (was 10–20). Demo form already accepted from 8.
- Founder title reads **Founder · AI & Robotics Analyst**.
- Loader has a glow bloom + drifting waves, runs ~1.5s.
- Timeline years switched to Poppins — Orbitron digits with wide tracking were unreadable.
- Base font size raised to 106.25% (17px). To go bigger, change one value in `style.css`:
  `html{ font-size:106.25% }` → `112.5%`.
- **Contact** added to the nav (7 items now).

## 5. Still open

- **Advanced price** — site says ₹9,499. Your bundle maths implied ₹9,999. Four numbers change if it's the latter.
- **Testimonials** are still anonymous ("Parent, Mumbai"). Named ones convert far better.
- **Project images** are the AI-generated renders. Swap for real build photos when you can.
- Confirm **team.shezbotics@gmail.com** is the address to display publicly.
