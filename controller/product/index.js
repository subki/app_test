const express = require('express');
const router = express.Router();
const asyncAwait = require('express-async-await');
const app = require('../..');
const auth = require('../../middleware/auth')('api');
const mod = new (require('../../model/product'))(app.pool);
const { validateProduct } = require('./validation');
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

router.post("/", auth, validateProduct, async (req, res)=>{
    let data = req.body;
    data.crtby = req.userInfo.id;
    const [result, err] = await mod.insert(data);
    if (err) return res.status(422).json({status: 1, ...result});
    return res.json(result);
});
router.put("/:id", auth, validateProduct, async (req, res) => {
    const data = req.body;
    let param = {
        fields: {...data, updby: req.userInfo.id},
        where: {'id': req.params.id}
    }
    const [result, err] = await mod.update(param);
    res.status(err?422:200).json(result);
});

router.delete("/:id", auth, async (req, res)=> {
    const [result, err] = await mod.delete({key:'id', value:req.params.id})
    if(err) return res.status(422).json({status:1, ...result});
    res.json(result);
});

module.exports = asyncAwait(router);