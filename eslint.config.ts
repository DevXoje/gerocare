import pluginVitest from '@vitest/eslint-plugin'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import { globalIgnores } from 'eslint/config'
import pluginPlaywright from 'eslint-plugin-playwright'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
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
    // Prohibir imports relativos en código fuente (excluir tests y configs)
    files: ['src/**/*.{vue,ts}'],
    ignores: [
      '**/__tests__/**',
      '**/*.spec.ts',
      '**/*.test.ts',
      'src/test/**',
      '**/*.config.ts',
    ],
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

  skipFormatting,
)
