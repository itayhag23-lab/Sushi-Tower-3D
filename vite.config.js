import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// חשוב: שנה את 'sushi-tower-3d' לשם ה-repo שלך בגיטהאב אם הוא שונה,
// כדי שהנתיבים יעבדו נכון כשמעלים ל-GitHub Pages.
export default defineConfig({
  plugins: [react()],   base: '/Sushi-Tower-3D/',
});
