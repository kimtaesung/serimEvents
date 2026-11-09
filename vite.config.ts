import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'copy-assets',
      apply: 'build',
      enforce: 'post',
      generateBundle() {
        // 빌드 후 assets 폴더를 public_html로 복사
        try {
          const srcAssets = join(process.cwd(), 'src/assets');
          const destAssets = join(process.cwd(), 'public_html/assets');
          
          // 목표 디렉토리가 없으면 생성
          try {
            mkdirSync(destAssets, { recursive: true });
          } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : String(err);
            console.warn('⚠️  Could not create assets directory:', errMsg);
          }
          
          // 이미지 파일들 복사
          const files = readdirSync(srcAssets);
          files.forEach(file => {
            const srcPath = join(srcAssets, file);
            const destPath = join(destAssets, file);
            
            // 파일인 경우
            if (/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(file)) {
              copyFileSync(srcPath, destPath);
            }
            // events 폴더인 경우 전체 복사
            else if (file === 'events') {
              mkdirSync(destPath, { recursive: true });
              const eventFiles = readdirSync(srcPath);
              eventFiles.forEach(eventFile => {
                copyFileSync(
                  join(srcPath, eventFile),
                  join(destPath, eventFile)
                );
              });
            }
          });
          console.log('✓ Assets copied successfully');
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          console.warn('⚠️  Could not copy assets:', errMsg);
        }
      }
    }
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8088',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:8088',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'public_html',
    emptyOutDir: true,
  }
});
