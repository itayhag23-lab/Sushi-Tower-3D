# מגדל סושי - תלת מימד 🍣

משחק דפדפן תלת-מימדי בהשראת משחקי "Stack" — מפילים פיסות סושי אחת על השנייה ומנסים לבנות את המגדל הכי גבוה שאפשר, בלי לפספס.

## הרצה מקומית

```bash
npm install
npm run dev
```

יפתח שרת פיתוח על `http://localhost:5173`.

## בנייה לפרודקשן

```bash
npm run build
```

הקבצים המוכנים יופיעו בתיקיית `dist/`.

## העלאה ל-GitHub Pages

1. ודא שב-`vite.config.js` השדה `base` תואם לשם ה-repo שלך (למשל אם ה-repo נקרא `sushi-tower-3d`, זה צריך להיות `/sushi-tower-3d/`).
2. התקן את `gh-pages` (כבר כלול ב-devDependencies):
   ```bash
   npm install
   ```
3. פרסם:
   ```bash
   npm run deploy
   ```
4. בהגדרות ה-repo בגיטהאב → Settings → Pages, ודא שהמקור מוגדר לענף `gh-pages`.

המשחק יהיה זמין בכתובת `https://<username>.github.io/sushi-tower-3d/`.

## מבנה הפרויקט

```
sushi-tower-3d/
├── index.html          # דף הכניסה
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx         # מאתחל את React ומרכיב את המשחק
│   └── SushiTower3D.jsx # כל לוגיקת המשחק + הרינדור התלת-מימדי (Three.js)
└── README.md
```

## Fruity — smoothie bowl landing page

A second page lives at `/fruity/` (source in `fruity/`, assets in `public/fruity/`).
It recreates the reference hero: oversized wordmark behind a floating bowl, drifting
fruit with pointer parallax, and four flavors you can cycle with the side arrows,
the dots, arrow keys, or by clicking a card in the menu section.

Each flavor has its own bowl — peach slices and almonds, kiwi and lime wheels, mango
chunks, blueberries and raspberries — rendered in Blender (Cycles, top-down ortho,
transparent film) and exported as WebP with alpha. Switching a flavor swaps the bowl
and retints the background and the floating fruit. Fonts are self-hosted, so the page
makes no external requests at runtime.

`npm run dev` → http://localhost:5173/fruity/ · `npm run build` emits both pages.
