# AFN Sample Draw — field app

A single-page app that draws a reproducible simple random sample from a numbered
frame and splits it into one unique block per enumerator. It runs entirely on the
device; nothing is sent anywhere.

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole app — markup, styles, draw logic |
| `sw.js` | Service worker; makes it work with no signal |
| `manifest.webmanifest` | Name, colours, icons for the home-screen install |
| `icons/` | App icons (192, 512, maskable 512, Apple touch 180) |

## Getting it onto phones

The service worker **needs an `https://` address**. It will not run from a file
opened off the phone's storage (`file://`). Put the four items above on any static
host — GitHub Pages, Netlify, S3, an office web server — at one URL, then send
enumerators that link.

They open it once with a signal. After that it works with no signal at all.

- **iPhone (Safari):** Share button → **Add to Home Screen**. The app's own footer
  says this. Must be Safari; Chrome on iOS cannot install it.
- **Android (Chrome):** an **Install** prompt appears in the app itself.

## Releasing a change

1. Edit `index.html` (or anything else).
2. **Bump `VERSION` in `sw.js`.** This is the only thing that pushes the change
   out; without it phones keep serving the copy they already have.
3. Upload.

Phones pick it up the next time the app is opened or brought back to the
foreground while online: a banner offers **Update now**, and the app reloads on
the new version. The old cache is deleted automatically.

## Testing locally

```bash
python3 -m http.server 8731
```

Then open `http://localhost:8731` — service workers are allowed on `localhost`
without TLS. To simulate the field, load it once, stop the server, and reload.
