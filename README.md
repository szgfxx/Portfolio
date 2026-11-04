# Sagun Bhandari — portfolio

A static site for GitHub Pages, with no build step and no dependencies. Every scene is drawn on a `<canvas>` with plain JS.

| Page | What it is |
| --- | --- |
| `index.html` | The hello page: dawn over Phewa lake, with Sagun waving at a fork in the trail. |
| `this-way.html` | The professional portfolio. Scrolling climbs a stone-stair forest trail up to Sarangkot, which looks out over Phewa and Machhapuchhre. |
| `that-way.html` | The whimsical lakeside page: hobbies, fun facts and the momo button. |

## Editing content

All the text is in **`js/content.js`**. Any string that starts with `TODO` is shown with a striped highlight so placeholders are easy to spot.

- **Résumé:** replace `assets/Sagun-Bhandari-Resume.pdf` with a new PDF of the same name (the hello-page button and the résumé pills link to it).
- **Sagun's outfit and hair colors:** change the `--hair`, `--bangs`, `--peek`, `--kurta`… variables at the top of `css/base.css`.
- **The character drawing:** `js/sagun.js`.

## Running locally

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

## Deploying to GitHub Pages

1. Push this folder to a GitHub repo.
2. Go to **Settings → Pages → Build and deployment**, choose *Deploy from a branch*, then pick `main` and `/ (root)`.
3. If the repo is named `<username>.github.io`, the site is served at the root. Otherwise it is served at `/<repo>/`. All links are relative, so both work.

`.nojekyll` is included so GitHub serves the files as they are.
