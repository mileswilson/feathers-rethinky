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
        this.paginate = {};

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
    _find(params, getFilter) {
        params = params.query || {};
        let query = this.Model;
        //Break our some params.
        const filters = getFilter(params);
        console.log("FILTERS",filters)
        if (filters.$select) {
            query = query.pluck(filters.$select);
        }
        if (filters.$limit) {
            query = query.limit(filters.$limit);
        }
        if (filters.$sort) {
            Object.keys(filters.$sort).forEach(function (element) {
                query = query.orderBy(element);
            }, this);
        }
        if (filters.$skip) {
            query = query.skip(filters.$skip);
        }
        console.log("params:", params)
        if (params.$or) {
            query = query.filter(orMapper(params.$or));
            delete params.$or;
        }
        if (params.$not) {
            query = query.filter(notMapper(params.$not));
            delete params.$not;
        }
        //See if any of the name params have a special result on them
        return query.filter(parseQuery(params)).run().then(function(values){
            console.log("RUN RESULTS:",arguments)
            const total = 3;
            const paginator = {
                total,
                limit: filters.$limit,
                skip: filters.$skip || 0,
                data: values
            };
            console.log(paginator)
            return Promise.resolve(paginator);
        });
    }
    find(params) {
        console.log("FIND CALLED WITH PAGINATION", this.paginate)
        const result = this._find(params || {}, query => filter(query, this.paginate));
        if(!this.paginate.default) {
            return result.then(page => page.data);
        }
        return result; 
 
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

            return Promise.all(found.map(current => {

                return this._remove(current.id)
            }));
        });

    }
}

export default function init(name, options) {
    return new Service(name, options);
}

function orMapper(orArray) {
    return function (item) {
        var firstKey = Object.keys(orArray[0])[0];
        var output = item(firstKey).eq(orArray[0][firstKey]);
        delete orArray[0];
        orArray.forEach(function (orItem) {
            var itemKey = Object.keys(orItem)[0];
            output = output.or(item(itemKey).eq(orItem[itemKey]));
        });
        return output;
    }
}

function notMapper(orArray) {
    return function (item) {
        var firstKey = Object.keys(orArray[0])[0];
        var output = item(firstKey).not(orArray[0][firstKey]);
        delete orArray[0];
        orArray.forEach(function (orItem) {
            var itemKey = Object.keys(orItem)[0];
            output = output.not(item(itemKey).eq(orItem[itemKey]));
        });
        return output;
    }
}
  
/**
 * Pass in a query object to get a ReQL query
 * Must be run after special query params are removed.
 */
function parseQuery(obj) {
    return function (r) {


        var reQuery;
        var theKeys = Object.keys(obj);
        for (var index = 0; index < theKeys.length; index++) {
            var subQuery;
            // The queryObject's key: 'name'
            var qField = theKeys[index];
            // The queryObject's value: 'Alice'
            var qValue = obj[qField];
            console.log("qField:",qField)
            console.log("qValue:",qValue)
            // If the qValue is an object, it will have special params in it.
            if (typeof qValue === 'object') {
                switch (Object.keys(obj[qField])[0]) {
                    /**
                     *  name: { $in: ['Alice', 'Bob'] }
                     *  becomes
                     *  r.expr(['Alice', 'Bob']).contains(doc['name'])
                     */
                    case '$in':
                        console.log(qValue.$in,r(qField))
                        subQuery = r._r.expr(qValue.$in).contains(r(qField));
                        break;
                    case '$nin':
                        subQuery = r._r.expr(qValue.$nin).contains(r(qField)).not();
                        break;
                    case '$lt':
                        subQuery = r(qField).lt(obj[qField].$lt);
                        break;
                    case '$lte':
                        subQuery = r(qField).le(obj[qField].$lte);
                        break;
                    case '$gt':
                        console.log("Asking to greater than",qField,obj[qField].$gt)
                        subQuery = r(qField).gt(obj[qField].$gt);
                        break;
                    case '$gte':
                        subQuery = r(qField).ge(obj[qField].$gte);
                        break;
                    case '$ne':
                        subQuery = r(qField).ne(obj[qField].$ne);
                        break;
                    case '$eq':
                        subQuery = r(qField).eq(obj[qField].$eq);
                        break;
                }
            } else {
                subQuery = r(qField).eq(qValue);
            }

            // At the end of the current set of attributes, determine placement.
            if (index === 0) {
                console.log("No Sub Yet")
                reQuery = subQuery;
            } else {
                console.log("Got Sub Query")
                reQuery = reQuery.and(subQuery);
            }
        }
       
        return reQuery || {};
    }
}

init.Service = Service;