module.exports = {
  root: true,
  extends: '@react-native-community',
  plugins: ['react-hooks'],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'off',
    'react-native/no-inline-styles': 'off',
    eqeqeq: 'off',
    'no-undef': 'off',
  },
};
