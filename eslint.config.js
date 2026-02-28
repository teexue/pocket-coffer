import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default tseslint.config(
  // Ignore patterns
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/out/**'],
  },

  // Base JavaScript rules
  js.configs.recommended,

  // TypeScript rules
  ...tseslint.configs.recommended,

  // Next.js specific
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-undef': 'error',
      'react-hooks/set-state-in-effect': 'off',
    },
  },

  // Next.js specific
  {
    files: ['next-env.d.ts'],
    rules: {
      'no-undef': 'off',
    },
  }
);
