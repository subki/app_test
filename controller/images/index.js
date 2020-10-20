const express = require('express');
const router = express.Router();
const asyncAwait = require('express-async-await');
const app = require('../..');
const auth = require('../../middleware/auth')('api');
const mod = new (require('../../model/images'))(app.pool);
const { validateImage } = require('./validation');
const util = require('../../util');

router.get("/", auth, async (req, res)=> {
    let [result, err] = await mod.find(req.query);
    if(err) return res.status(422).json({status:1, ...result});

    res.json(result);
});

router.get("/:id", auth, async (req, res)=> {
    let [result, err] = await mod.get(req.params.id);
    if(err) return res.status(422).json({status:1, ...result});

    res.json(result);
});


router.post("/", auth, validateImage, async (req, res)=>{
    let data = req.body;
    if(data.file){
        util.writeBase64(data.file, {createThumb:false, path:'./private/images/', ext:'.jpg'}, async function (resu) {
            if (resu.status > 0) {
                return res.status(422).json({status: 1, ...resu});
            } else {
                data.path_image = resu.data.file_name;
                data.crtby = req.userInfo.id;
                const [result, err] = await mod.insert(data);
                if (err) return res.status(422).json({status: 1, ...result});
                return res.json(result);
            }
        })
    }else{
        return res.status(422).json({status:1, errors:[{key:"general", msg:"Logo harus terlampir!"}]});
    }
});
router.delete("/:id", auth, async (req, res)=> {
    const [result, err] = await mod.delete({key:'id', value:req.params.id})
    if(err) return res.status(422).json({status:1, ...result});
    res.json(result);
});

module.exports = asyncAwait(router);