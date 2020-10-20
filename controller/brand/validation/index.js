const Joi = require('@hapi/joi');
const validator = require('../../../middleware/validator');

const validateBrand = validator(
    Joi.object().keys({        
        brand_name: Joi.string().max(20).required().error(e => {
            let msg = 'Nama harus diisi';
            if(e){
                switch(e[0].type){
                    case 'string.max':
                        msg = `Nama tidak boleh lebih dari ${e[0].context.limit} karakter`;
                    break;
                }   
            }
            return {message: msg};
        })
    })
);

module.exports = {
    validateBrand
}