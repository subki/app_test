const Joi = require('@hapi/joi');
const validator = require('../../../middleware/validator');

const validateProduct = validator(
    Joi.object().keys({        
        product_name: Joi.string().min(5).required().error(e => {
            let msg = 'Nama product harus diisi';
            if(e){
                switch(e[0].type){
                    case 'string.min':
                        msg = `Nama product minimal ${e[0].context.limit} karakter`;
                    break;
                }   
            }
            return {message: msg};
        }),
        price: Joi.number().required().error(e => {
            let msg = 'Harga harus diisi';
            return {message: msg};
        }),
        brand_id: Joi.number().required().error(e => {
            let msg = 'Brand harus diisi';
            return {message: msg};
        }),
    })
);

module.exports = {
    validateProduct
}