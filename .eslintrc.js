/*eslint-env node*/
module.exports = {
  "rules": {
    "indent": [
      2,
      2
    ],
    "quotes": [
      2,
      "double"
    ],
    "linebreak-style": [
      2,
      "unix"
    ],
    "semi": [
      2,
      "always"
    ]
  },
  "ecmaFeatures": { 
    "modules": true 
  },
  "env": {
    "es6": true,
    "browser": true
  },
  "extends": "eslint:recommended"
};