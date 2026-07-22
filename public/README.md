# Brand artwork — drop image files here

Add these image files to this `public/` folder and they appear on the site
automatically (no code change, no redeploy needed beyond the normal one that
uploading a file triggers). Until a file exists, that slot stays hidden — it
never shows a broken image.

| Filename (exact) | Where it shows |
| --- | --- |
| `oau-seal.png` | The OAU seal — replaces the built-in SVG seal on every page, the letter, and the PDF header. Use a square image (transparent or navy background). |
| `book-cover.png` | The "Freshman Class of Old Age" companion-book card on the landing page. |
| `second-draft-society.png` | The Second Draft Society sign, in the landing footer brand strip. |
| `youngest-of-old-people.png` | The "Youngest of the Old People" sticker, in the landing footer brand strip. |

## How to add them
1. Go to the repo on GitHub: **github.com/lastcomic/Oauquiz**
2. Open the `public` folder → **Add file → Upload files**
3. Drag the image files in, using the **exact filenames** above
4. **Commit** to `main` — Vercel redeploys and the images go live in ~1–2 min

Filenames are case-sensitive. PNG is preferred; JP/WebP work too if you keep
the same base name and update the reference (ask and I'll switch it).
