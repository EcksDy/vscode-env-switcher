module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'airbnb-typescript/base',
    'airbnb-typescript-prettier',
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:import/typescript',
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    'class-methods-use-this': 0,
    'no-console': 0,
    'import/no-unresolved': 0,
    'no-restricted-syntax': [
      0,
      {
        selector: 'ForOfStatement',
      },
    ],
  },
};
