const Joi = require('@hapi/joi');
const validator = require('../../../middleware/validator');

const validateOutlet = validator(
    Joi.object().keys({        
        outlet_name: Joi.string().min(5).required().error(e => {
            let msg = 'Nama outlet harus diisi';
            if(e){
                switch(e[0].type){
                    case 'string.min':
                        msg = `Nama outlet minimal ${e[0].context.limit} karakter`;
                    break;
                }   
            }
            return {message: msg};
        })
    })
);

module.exports = {
    validateOutlet
}