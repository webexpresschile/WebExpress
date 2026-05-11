import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://webexpresschile.github.io',
  base: '/WebExpress',
  integrations: [tailwind(), react()],
  output: 'static',
  adapter: vercel(),
});
