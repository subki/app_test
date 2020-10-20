const Joi = require('@hapi/joi');
const validator = require('../../../middleware/validator');

const validateLogin = validator(
    Joi.object().keys({
        username: Joi.string().required().error(e => {
            let msg = 'Username harus diisi';            
            return {message: msg};
        }),
        password: Joi.string().required().strict().error(e => {
            let msg = 'Password harus diisi';
            return {message: msg};
        }),
        notif_token: Joi.string().max(255).error(e => {
            let msg = 'Notif Token tidak valid';
            if(e){
                switch(e[0].type){
                    case 'string.max':
                        msg = `Notif Token tidak boleh lebih dari ${e[0].context.limit} karakter`;
                    break;
                }
            }
            return {message: msg};
        })
    })
);

module.exports = {
    validateLogin
}