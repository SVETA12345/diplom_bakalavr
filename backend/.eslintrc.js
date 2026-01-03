module.exports = {
  env: {
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
  ],
  rules: {
    'no-underscore-dangle': ['error', { allow: ['_id'] }],
  },

};
