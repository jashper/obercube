module.exports = {
  root: true,
  extends: 'airbnb/base',
  env: {
    'browser': true,
    'node': true,
    'mocha': true
  },
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  plugins: [
    'react'
  ],
  rules: {
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'arrow-body-style': [2, 'always'],
    'comma-dangle': ['error', 'never'],
    'class-methods-use-this': 0,
    'import/extensions': 0,
    'import/no-extraneous-dependencies': 0,
    'react/jsx-uses-react': [1],
    'react/jsx-uses-vars': [1],
    'react/react-in-jsx-scope': [1],
    'no-new': 0,
    'no-plusplus': 0,
    'object-shorthand': 0
  }
}
