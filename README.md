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
