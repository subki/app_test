const Joi = require('@hapi/joi');
const validator = require('../../../middleware/validator');

const validateImage = validator(
    Joi.object().keys({        
        description: Joi.string().min(5).required().error(e => {
            let msg = 'Nama harus diisi';
            if(e){
                switch(e[0].type){
                    case 'string.min':
                        msg = `Deskripsi minimal ${e[0].context.limit} karakter`;
                    break;
                }   
            }
            return {message: msg};
        })
    })
);

module.exports = {
    validateImage
}