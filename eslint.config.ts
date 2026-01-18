// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import pluginVitest from '@vitest/eslint-plugin'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import { globalIgnores } from 'eslint/config'
import pluginPlaywright from 'eslint-plugin-playwright'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import storybook from "eslint-plugin-storybook";
import pluginVue from 'eslint-plugin-vue'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    ...pluginPlaywright.configs['flat/recommended'],
    files: ['e2e/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },

  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      // Ordenar imports automáticamente
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Side effect imports (import 'something')
            ['^\\u0000'],
            // Node.js builtins prefixed with `node:`
            ['^node:'],
            // Packages (things that start with a letter (or digit or underscore), or `@` followed by a letter)
            ['^@?\\w'],
            // Internal packages (aliases starting with @/)
            ['^@/'],
            // Parent imports (../). Put `..` last to discourage relative imports
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            // Other relative imports (./)
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            // Style imports
            ['^.+\\.s?css$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },

  {
    // Prohibir imports relativos en código fuente
    files: ['src/**/*.{vue,ts}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*', './*'],
              message: 'Use alias imports (@/) instead of relative paths. Example: @/business/residents/app/useResidentForm instead of ../../app/useResidentForm',
            },
          ],
        },
      ],
    },
  },

  {
    // Permitir imports relativos en tests y archivos de configuración
    files: [
      'src/**/__tests__/**/*.{ts,vue}',
      'src/**/*.spec.ts',
      'src/**/*.test.ts',
      'src/test/**/*.ts',
      '**/*.config.{ts,js}',
      'vitest.config.ts',
      'playwright.config.ts',
      'vite.config.ts',
    ],
    rules: {
      'no-restricted-imports': 'off',
    },
  },

  skipFormatting,
)
