# ShezBotics — setup

## 1. Files

Upload all of these into your site root, keeping the folders as they are:

```
index.html      site.css        assets/     (the pages use assets/web/)
demo.html       site.js         vendor/     (three.js and Lenis, served from your own site)
schools.html    script.js
corporate.html
privacy.html
```

`Code.gs` does **not** go on the server — it goes into Google Apps Script (step 2).
`.agents/`, `.claude/` and `skills-lock.json` are the design tool used to build the site; they don't need uploading.

The site needs no build step. Every page works as plain files on any static host.

## 2. Connect the Google Sheet + alert email — 5 minutes

**Until this is done, enquiries reach you only through FormSubmit, and FormSubmit delivers nothing
until it is activated.** The very first submission makes FormSubmit email `team.shezbotics@gmail.com`
an "Activate Form" link (check spam). Click it once. If neither route works, visitors are offered a
"Send on WhatsApp" button with their details filled in, so the enquiry isn't lost.

1. Open **sheets.new** — name it *ShezBotics Enquiries*.
2. **Extensions ▸ Apps Script**. Delete the sample code, paste in all of `Code.gs`.
3. Run the `testAlert` function once. Authorise when prompted:
   *choose your account ▸ Advanced ▸ Go to project ▸ Allow*. Check the test mail arrives.
4. **Deploy ▸ New deployment ▸ Web app**
   - Execute as: **Me**
   - Who has access: **Anyone** ← must be "Anyone", not "Anyone with a Google account"
5. Copy the `/exec` URL it gives you.
6. Open `script.js`, line ~251, and paste it in:

```js
var SHEZ_ENDPOINT = 'https://script.google.com/macros/s/AKfy…/exec';
```

7. Submit one test form on the live site. You should get an email **and** a new row.

Tabs create themselves: **Demo**, **Schools**, **Corporate**, **Contact**.
Add a form field later and it appears as a new column automatically — you never edit `Code.gs` again.

### If you redeploy
Apps Script issues a **new URL** on *New deployment*. Use **Manage deployments ▸ edit ▸ Version: New version**
to keep the same URL, otherwise you must re-paste it into `script.js`.

## 3. Photos

The pages use web-sized copies in `assets/web/` (WebP, cut from the originals in `assets/`).
To swap a photo, replace the file in `assets/web/` with one of the same name.

`corporate.html` uses only photos of Shehzad, never school photos. Add real adult-training shots
when you have them.

The 3D robot's fallback pictures (`assets/web/robot.webp`, `robot-parts.webp`) are shown only on
browsers that can't draw 3D.

## 4. Recent changes (October 2026)

- **New design on every page.** One typeface (TikTok Sans), brand navy, cyan and mint, square corners.
- **3D robot** (the Basic obstacle-avoiding car) in the homepage, demo and schools heroes. On the homepage
  it comes apart into its parts as you scroll. Visitors with reduced motion get the still version.
- **Demo form fixed:** Continue now works on every step (it stopped at step 2 before).
- **Forms:** check that the Sheet or FormSubmit actually accepted the enquiry; on failure the visitor
  gets a WhatsApp button with their details instead of a false "received".
- **Homepage course calculator:** tap levels to see sessions, weeks, fees and kits added up.
- **Corporate:** example tasks by team (operations, HR, finance), labelled as examples.
- **Privacy page** now names FormSubmit and Google Fonts in "Where it goes".

## 5. Still open

- **Weekend session times** on the homepage (15, 40, 15 min…) are placeholders. Send the real ones.
- **What's in the Basic kit**: the 3D robot and parts list show Arduino Uno, ultrasonic sensor, servo,
  two geared motors with a driver, battery pack and chassis. Confirm or correct.
- **Advanced price** — site says ₹9,499. Your bundle maths implied ₹9,999. Four numbers change if it's the latter.
- **Testimonials** are still anonymous ("A parent, Mumbai"). Named ones convert far better.
- **Project images** are the AI-generated renders. Swap for real build photos when you can.
- A short **video of a real class** (a robot driving, a student's build working) would be the best
  thing to add next.
- Confirm **team.shezbotics@gmail.com** is the address to display publicly.
