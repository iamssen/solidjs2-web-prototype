import js from '@eslint/js';
import solid from '@ssen/eslint-plugin-solid';
import prettier from 'eslint-config-prettier';
import { importX } from 'eslint-plugin-import-x';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['**/dist'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    //files: [`**/*.{ts,tsx,mts,cts}`],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'import-x': importX,
      unicorn,
      '@ssen/solid': solid,
    },
    rules: {
      ...unicorn.configs.recommended.rules,
      ...solid.configs.recommended.rules,

      'unicorn/prevent-abbreviations': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/no-negated-condition': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-useless-undefined': 'off',
      'unicorn/no-lonely-if': 'off',
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/prefer-type-error': 'off',
      'unicorn/no-nested-ternary': 'off',

      'prefer-const': 'off',
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'none',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: true,
        },
      ],
      'no-shadow': 'off',
      'no-extra-boolean-cast': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-shadow': ['warn'],
      'import-x/consistent-type-specifier-style': ['error', 'prefer-top-level'],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],

      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'clsx',
              message: "Please use 'clsx/lite' instead of 'clsx'.",
            },
          ],
        },
      ],
    },
  },
  {
    // disable type-aware linting on JS files
    files: ['**/*.{js,jsx,mjs,cjs}'],
    rules: tseslint.configs.disableTypeChecked.rules,
  },
  {
    files: [`**/@libs/**/*.{ts,tsx,mts,cts}`],
    rules: {
      'no-restricted-imports': ['error', { patterns: ['@ui/*'] }],
    },
  },
];
