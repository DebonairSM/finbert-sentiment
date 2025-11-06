import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env from parent directory (root of workspace)
  const env = loadEnv(mode, process.cwd() + '/..', '');
  
  const backendPort = env.VITE_BACKEND_PORT || '3031';
  const frontendPort = parseInt(env.VITE_FRONTEND_PORT || '3030', 10);

  return {
    plugins: [react()],
    server: {
      port: frontendPort,
      proxy: {
        '/api': {
          target: `http://localhost:${backendPort}`,
          changeOrigin: true,
        },
      },
    },
  };
});

