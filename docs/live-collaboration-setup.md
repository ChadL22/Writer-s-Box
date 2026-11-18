# Live collaboration: one-time setup

Writer's Box can share a file to **Google Docs / Sheets** or **Word / Excel for the web**, so people without a GitHub account can edit it together in real time. You then bring their changes back into Writer's Box, review them in the side-by-side view, and save them as a version.

To do this, the site needs two free IDs, one from Google and one from Microsoft. They tell Google and Microsoft that your Writer's Box site may ask a writer for permission to create documents in that writer's own Drive or OneDrive. **Client IDs are public identifiers, not passwords**, so it's safe to put them in `src/config.js`.

You only need the provider you plan to use; Google alone covers every file type.

Your site's address is used below. Replace it if yours differs:

- **Origin:** `https://sipholanga.com`
- **Page address:** `https://sipholanga.com/Writer-s-Box/`

---

## Google Docs & Sheets (about 10 minutes)

1. Go to **https://console.cloud.google.com/** and sign in. Create a project (top bar › project picker › **New project**), for example "Writer's Box".
2. **Enable the Drive API:** *APIs & Services › Library*, search for **Google Drive API**, click **Enable**.
3. **Set up the OAuth consent screen** (*APIs & Services › OAuth consent screen*, which may be called *Google Auth Platform › Branding / Audience*):
   - User type: **External**
   - App name "Writer's Box", plus your support email and developer contact email
   - **Scopes / Data access:** add `.../auth/drive.file`. This lets Writer's Box see only the files it creates, never the rest of a writer's Drive.
   - **Test users:** while the app is in *Testing*, add the Google accounts of the writers who will share documents. Up to 100.
4. **Create the client ID:** *APIs & Services › Credentials › Create credentials › OAuth client ID*
   - Application type: **Web application**
   - **Authorized JavaScript origins:** `https://sipholanga.com`. Also add `http://127.0.0.1:5500` if you test with VS Code's Live Server.
   - No redirect URI is needed.
5. Copy the client ID (it ends in `.apps.googleusercontent.com`).

**Collaborators don't need any of this.** With "Anyone with the link", they can edit without signing in. Only the writer who shares signs in with Google.

**Going beyond 100 writers:** publish the consent screen (*Audience › Publish app*). Because `drive.file` is a non-sensitive scope, Google's review is limited to confirming the app's name, logo and domain.

## Word & Excel for the web (about 5 minutes)

1. Go to **https://entra.microsoft.com/** (or the Azure portal) and choose **App registrations › New registration**.
2. Name it "Writer's Box".
3. **Supported account types:** *Accounts in any organizational directory and personal Microsoft accounts*.
4. **Redirect URI:** platform **Single-page application (SPA)**, value `https://sipholanga.com/Writer-s-Box/`. Add `http://127.0.0.1:5500/` too if you test locally.
5. Click **Register**, then copy the **Application (client) ID** from the Overview page.
6. *API permissions:* the default **Microsoft Graph › User.Read** is there; Writer's Box asks for **Files.ReadWrite** when a writer signs in. No admin consent is needed for personal accounts.

**Notes:**
- Word for the web is offered for `.docx` and `.xlsx` files. Use Google for Markdown, LaTeX and text.
- "Anyone with the link can edit" works on personal Microsoft accounts. Work and school accounts often have it switched off by their admin; Writer's Box then suggests inviting people by email.

---

## Put the IDs in the site

**For everyone using your site:** edit `src/config.js`:

```js
const WB_CONFIG = {
  googleClientId: "1234567890-abc123.apps.googleusercontent.com",
  microsoftClientId: "00000000-0000-0000-0000-000000000000"
};
```

Then run `./build.sh`, commit and push.

**Just for yourself, without rebuilding:** open any project › **Settings › Connections** (or the **Live** tab) › **Set up**, and paste the ID. It's saved in that browser.

## How it works for writers

1. Open a file and choose **Collaborate live**.
2. Pick **Google Docs** or **Word for the web**, and either **Anyone with the link** or **Only people I invite**.
3. Writer's Box signs you in to Google or Microsoft, puts a copy in your Drive or OneDrive (in a "Writer's Box" folder for OneDrive), shares it, and gives you the link.
4. Collaborators edit, suggest and comment there.
5. The **Live** tab shows when there are new edits and who made them. Google Docs comments appear there too, and can become Notes in GitHub-linked projects.
6. **Bring changes back** downloads the document and opens the side-by-side view of their changes. **Save version** records them, with a message saying where the edits came from.
7. **Update live copy** sends your newer text back to the live document. **Stop sharing** removes everyone's access; the document stays in your Drive.

## Limits

- **Not inside Claude's preview:** live collaboration works on your hosted site. Claude's preview blocks the Google and Microsoft sign-in windows.
- **Formatting round-trip:** Word files keep their formatting when edited in Word for the web. Through Google Docs, text survives perfectly, but some advanced Word formatting may change. Writer's Box compares text, so you'll still see exactly what changed.
- **Simultaneous edits:** if you edit a file in Writer's Box while others edit the live copy, bringing their changes back shows your unsaved edits as replaced. Save a version first, or use **Update live copy** before they start.
