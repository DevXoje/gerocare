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
    // Filtrar plugins que causan conflictos en Storybook
    if (config.plugins) {
      config.plugins = config.plugins.filter(
        (plugin) => {
          const name = plugin && typeof plugin === 'object' && 'name' in plugin ? plugin.name : null;
          // Filtrar vite-plugin-vue-devtools y vite-plugin-inspect que no funcionan bien en Storybook
          return name !== 'vite-plugin-vue-devtools' && name !== 'vite-plugin-inspect';
        }
      );
    }
    return config;
  }
};
export default config;
