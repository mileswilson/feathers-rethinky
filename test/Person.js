import thinky,{type} from './thinky';

const Person = thinky.createModel('people', {
    name: type.string(),
    age: type.number().integer(),
    created: type.boolean()
});

module.exports = Person;