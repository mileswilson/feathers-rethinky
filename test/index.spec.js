/*eslint-env node, mocha*/
import base from "./feathers-base";
import errors from "feathers-errors";
import service from "../src";
import Person from "./Person";
let _ids = {};
let people = service("person", {
  model: Person
});

function clean(done) {
  this.timeout(5000);
  Person.delete().run().then(() => {
    done();
  });

}
describe("feathers-rethinky", () => {
  before(clean);
  after(clean);
  beforeEach(done => {
    people.create({
      name: "Doug",
      age: 32
    }).then(data => {
      _ids.Doug = data.id;
      done();
    }, done);
  });

  afterEach(done => {
    const doneNow = () => done();
    people.remove(_ids.Doug).then(doneNow, doneNow);
  });
  base(people, _ids, errors);
});