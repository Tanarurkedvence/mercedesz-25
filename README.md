# Mercédesz 25 🐰

Születésnapi weboldal Urbán Mercédesz Alexandra 25. születésnapjára (2001. 09. 20., csütörtök).

Statikus oldal: nincs build, nincs függőség. Csak nyisd meg az `index.html`-t, vagy tedd fel GitHub Pages-re.

## Tartalom

- `index.html`: az oldal szerkezete és szövege
- `style.css`: dizájn (sötét téma, bento rács, marquee, pinelt jelenetek)
- `script.js`: visszaszámláló, konfetti, torta, GSAP scroll-animációk
- `vendor/`: GSAP + ScrollTrigger (helyben, CDN nélkül)
- `images/`: a fotók

## Helyi megnyitás

```bash
python -m http.server 5188
```

Ezután: <http://localhost:5188>

## GitHub Pages

1. Repo létrehozása a GitHubon, a fájlok feltöltése (`git push`).
2. **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`**.
3. Pár perc múlva elérhető: `https://<felhasználónév>.github.io/<repo-neve>/`

## Testreszabás

- A visszaszámláló célja: `script.js` elején a `TARGET` (jelenleg 2026. 09. 20. 00:00).
- Szövegek: `index.html`.
- Színek: `style.css` elején a `:root` változók.
