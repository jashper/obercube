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
  rules: {
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'arrow-body-style': [2, 'always'],
    'comma-dangle': ['error', 'never'],
    'class-methods-use-this': 0,
    'no-new': 0
  }
}
