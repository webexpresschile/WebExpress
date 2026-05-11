import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';

const isDeploy = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig({
  site: isDeploy ? 'https://webexpresschile.github.io' : 'https://landing-omega-flax.vercel.app',
  base: isDeploy ? '/WebExpress' : '/',
  integrations: [tailwind(), react()],
  output: 'static',
  adapter: vercel(),
});
