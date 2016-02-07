import errors from 'feathers-errors';

export default function(error){
    let feathersError = error;
    if(error.name) {
        switch(error.name) {
        case 'DocumentNotFoundError':
            feathersError = new errors.NotFound(error);
            break;
        }
    }
    return Promise.reject(feathersError);
}