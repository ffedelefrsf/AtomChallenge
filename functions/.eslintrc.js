module.exports = {
  env: {
    es2021: true,
    node: true
  },
  extends: 'standard-with-typescript',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    semi: ['always'],
    '@typescript-eslint/comma-dangle': 'off',
    '@typescript-eslint/semi': ['error', 'always']
  }
};
