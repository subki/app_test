const Joi = require('@hapi/joi');
const _ = require('lodash');

module.exports = (_schema ) => {
    const _validationOptions = {
        abortEarly: false, // abort after the last validation error
        allowUnknown: true, // allow unknown keys that will be ignored
        stripUnknown: true // remove unknown keys from the validated data
    };
    return (req, res, next) => {
        return Joi.validate(req.body, _schema, _validationOptions, (err, data) => {
            if (err) {
                const JoiError = {
                    status: 1,
                    errors: _.map(err.details, ({message, context}) => ({
                        key: context.key,
                        msg: message.replace(/['"]/g, '')
                    }))
                };
                res.status(422).json(JoiError);
            } else {
                // Replace req.body dengan data setelah divalidasi
                let willStrip = [];
                for(let key in data){
                    if(data[key]==='' || data[key]===null){
                        willStrip.push(key);
                    }
                }
                for(let i in willStrip){
                    delete data[willStrip[i]];
                }
                req.body = data;
                next();
            }
        });
    }
}