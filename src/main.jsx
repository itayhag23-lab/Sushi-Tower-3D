import ReactDOM from 'react-dom/client';
import SushiTower3D from './SushiTower3D.jsx';

// No StrictMode: it double-mounts the component in dev, which created a duplicate canvas (a "dead" copy next to the live one)
ReactDOM.createRoot(document.getElementById('root')).render(
  <SushiTower3D />
);
