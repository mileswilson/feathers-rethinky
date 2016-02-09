/*eslint-env node*/

import thinky , { type } from "./thinky";

const Person = thinky.createModel("people", {
  name: type.string(),
  age: type.number().integer(),
  created: type.boolean()
});
export default Person;

module.exports = Person;