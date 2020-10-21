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
        }),
        address: Joi.string().min(5).required().error(e => {
            let msg = 'Alamat harus diisi';
            return {message: msg};
        }),
        longitude: Joi.number().required().error(e => {
            let msg = 'Longitude harus diisi';
            return {message: msg};
        }),
        latitude: Joi.number().required().error(e => {
            let msg = 'Latitude harus diisi';
            return {message: msg};
        }),
        brand_id: Joi.number().required().error(e => {
            let msg = 'Brand harus diisi';
            return {message: msg};
        }),
        file:Joi.string().min(8)
    })
);

module.exports = {
    validateOutlet
}