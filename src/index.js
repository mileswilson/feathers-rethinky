import Proto from 'uberproto';
import _ from 'lodash';
import errors from 'feathers-errors';
import errorHandler from './errorHandler';
import filter from 'feathers-query-filters';
class Service {
    constructor(name, model) {
        if (!model) {
            throw new Error("You must provide a thinky model");
        }
        this.Model = model;

    }
    extend(obj) {
        return Proto.extend(obj, this);
    }

    get(id) {
        if (!id) {
            return Promise.reject(new errors.NotFound(`The query did not find a document and returned null`))
        }
        return this.Model
            .get(id)
            .getJoin()
            .run()
            .catch(error => {
                return Promise.reject(new errors.NotFound(`No record found for id '${id}'`))
            })
            .then(result => {
                return result;
            })
    }
    _find(params) {
        if(!params){
           return this.Model.run();
        } 
        
        
        //Break our some params.
        const filters = filter(params);
        
        return this.Model.filter(params).run();
    }
    find(params) {
        console.log("LOOKING FOR",params)
       return this._find(params ? params.query : null)
        .then(function(found){
            console.log("FOUND:",found);
            return found;
        });
        
        if(params.query.$sort){
            return this._find
        }
    }
    
    create(data) {
        if (Array.isArray(data)) {
            return Promise.all(data.map(current => this._create(current)));
        }
        return this._create(data);
    }
    _create(data) {
        return new this.Model(data).save();
    }

    _remove(id) {
        let result = {};
        return this.get(id).then(found => {
            result = found;
            return found.delete().then(() => {
                
                return result;
            })
        })
    }

    remove(id, params) {
        if (!params) {
            return this._remove(id).then(f => {
                return f;
            })
        }
        
        return this._find(params.query).then(found => {
            console.log("Asked to bulk delete", found)
            return Promise.all(found.map(current => {
                console.log("removing for bulk:", current)
                return this._remove(current.id)
            }));
        });

    }
}

export default function init(name, options) {
    return new Service(name, options);
}

init.Service = Service;