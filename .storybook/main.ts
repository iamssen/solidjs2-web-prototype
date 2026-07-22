import autoprefixer from 'autoprefixer';
import type { StorybookConfig } from 'storybook-solidjs-vite';
import { mergeConfig } from 'vite';
import solid from 'vite-plugin-solid';

// In my experience, I don't recommend CSF Next.
// CSF3 has a more concise code structure.
export default {
  stories: ['../apps/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  framework: { name: 'storybook-solidjs-vite' },
  async viteFinal(viteConfig) {
    return mergeConfig(viteConfig, {
      css: {
        postcss: {
          plugins: [autoprefixer({})],
        },
      },
      plugins: [solid()],
    });
  },
} satisfies StorybookConfig;
