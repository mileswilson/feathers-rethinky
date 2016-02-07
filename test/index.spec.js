import {base} from 'feathers-service-tests';
import errors from 'feathers-errors';
import service from '../src';
import thinky from './thinky';
import Person from './Person';
let _ids = {};
let options = {
    host: "docker"
};
let people = service('person', Person);
let r = thinky.r;
function clean(done) {
    this.timeout(5000);
    Person.delete().run().then(r => {
        done();
    })

}
describe("feathers-rethinky", () => {
    before(clean)
    after(clean)
    beforeEach(done => {
        people.create({
            name: 'Doug',
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
})