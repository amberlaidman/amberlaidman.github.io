# Riding With No Driver — web build

Static HTML. No build step, no server code. Drop this whole folder into a GitHub
Pages repo and it works.

## Hosting it

1. Copy the entire `course/` folder into your repository.
2. Commit and push.
3. In the repo, go to **Settings → Pages** and set the source to your default
   branch, root folder.
4. The course lives at `https://<your-username>.github.io/<repo>/course/`.

To host it at the root of the site instead, move the *contents* of this folder
to the repository root rather than the folder itself.

## What's in here

| File | What it is |
| --- | --- |
| `index.html` | Start Here — the front door. Links to every module. |
| `module-1-the-empty-seat.html` | Module 1 |
| `module-2-why-this-exists.html` | Module 2 |
| `module-3-always-attentive.html` | Module 3 |
| `module-4-is-it-actually-safe.html` | Module 4 |
| `module-5-what-to-expect.html` | Module 5, includes the 360° cabin viewer |
| `module-6-which-one-sounds-like-you.html` | Module 6 |
| `course-document.html` | The whole course as a printable document |
| `cabin-360.html` | The 360° cabin viewer on its own |
| `support.js` | Runtime. Every page needs it. |
| `course-shared.js` | Narration, progress, shared behaviour |
| `doc-page.js` | Print layout for the document |
| `assets/` | The cabin image |

Everything must keep its current relative position. Move a file and the page
that depends on it renders blank.

## Things to know

**Fonts load from Google Fonts.** The course needs an internet connection to
look right. Without one it still works, but falls back to system fonts.

**Progress is per-browser.** Saved in the learner's own browser storage. It does
not follow them to another device, and nothing is sent anywhere. There is no
tracking and no data collection of any kind.

**Narration uses the browser's own voice.** The Listen button reads the on-screen
text aloud using whatever voices the learner's device has. The course asks for
Arthur first and falls back through a list of equivalents on Windows and Android.
Pace and pitch are adjustable in each module and persist.

**Optional recorded audio.** If you ever want real narration instead of the
synthesised voice, create `assets/audio/` and add files named `m4-03.mp3`
(module number, beat number). Any beat with a file plays it instead of speaking.
Missing files fall back silently, so partial coverage is fine.

## Maintenance

Content last reviewed September 2026. Next review due March 2027.

Every dated or numeric claim is listed in the *Claims With a Shelf Life* section
at the end of `course-document.html`, with the module beat that would need
editing. Start there.

The external links in the *Things Worth Remembering* appendix point at Waymo's
rider help pages. Click them during each review — they move.
