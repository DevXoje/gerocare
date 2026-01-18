import type { StorybookConfig } from '@storybook/vue3-vite';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs"
  ],
  "framework": "@storybook/vue3-vite",
  async viteFinal(config) {
    // Filtrar vite-plugin-vue-devtools que causa conflicto con vite-plugin-inspect
    if (config.plugins) {
      config.plugins = config.plugins.filter(
        (plugin) => plugin && plugin.name !== 'vite-plugin-vue-devtools'
      );
    }
    return config;
  }
};
export default config;
