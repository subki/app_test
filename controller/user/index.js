const express = require('express');
const router = express.Router();
const asyncAwait = require('express-async-await');
const app = require('../..');
const sha256 = require('sha256');
const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth')('api');

const mod = new (require('../../model/user'))(app.pool);
const {validateLogin} = require('./validation');

router.post("/login", validateLogin, async (req, res)=>{
    let data = req.body;
    data.password = sha256(data.password);

    let [result, err] = await mod.getLogin(data.username);
    if(err) return res.status(422).json({status:1, ...result});

    let retval = {status:1, errors: [{key:"general", msg: "Username atau password anda salah"}]};
    if (result.data.length>0){
        const userdata = result.data[0];
        const password = userdata.password;
        if (password === data.password){
            var tokenData = {id: userdata.id, username: userdata.username, anggota_id:userdata.anggota_id};
            var token = jwt.sign(tokenData, app.get('tokenkey'), {
                expiresIn: "1 days" // expires in 24 hours
            });
            retval = {status:0, msg:"OK", token: token};
            if(data.notif_token){
                mod.update({fields: {"notif_token": data.notif_token}, where: {id: userdata.id}});
            }
        }
    }
    
    res.json(retval);
});

module.exports = asyncAwait(router);