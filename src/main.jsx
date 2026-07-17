import ReactDOM from 'react-dom/client';
import SushiTower3D from './SushiTower3D.jsx';

// ללא StrictMode: הוא מרכיב את הרכיב פעמיים בפיתוח, מה שיצר קנבס כפול (עותק "מת" ליד החי)
ReactDOM.createRoot(document.getElementById('root')).render(
  <SushiTower3D />
);
