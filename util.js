const config = require('./config').config;
const fs = require('fs');
const path = require('path');

exports.DBDateTime = {
    getCurrentPeriod: ()=>{
        var tzoffset = (new Date()).getTimezoneOffset() * 60000;
        let now =  (new Date(Date.now() - tzoffset)).toISOString().split('-');
        return `${now[0]}${now[1]}`;
    },
    getCurrentDate: ()=>{
        var tzoffset = (new Date()).getTimezoneOffset() * 60000;
        let now =  (new Date(Date.now() - tzoffset)).toISOString().split('-');
        return `${now[0]}-${now[1]}-${now[2].substr(0,2)}`;
    },
    getCurrentDateTime: ()=>{
        let tzoffset = (new Date()).getTimezoneOffset() * 60000;
        let now =  (new Date(Date.now() - tzoffset)).toISOString().split('T');
        let time = now[1].split(':');
        return `${now[0]} ${time[0]}:${time[1]}:${time[2].substr(0,2)}`;
    }
}
exports.getCurrentDateDBFormat = ()=> {
    let now =  (new Date()).toISOString().split('-');
    return `${now[0]}-${now[1]}-${now[2].substr(0,2)}`;
}
exports.writeBase64 = (base64Str, opt, callback)=>{
    if(base64Str.length===0){
        callback({status:1, data: [], errors: [{key: 'General', msg: "No file provided"}]});
        return
    }

    try {
        const urlImagePath = opt.path || './asset/images/document/';
        const d = new Date();

        const nama_file = (opt.fileName || "img") + "_" + d.getFullYear() + pad((d.getMonth() + 1)) + pad(d.getDate()) + d.getHours() + d.getSeconds() + d.getMilliseconds() + (opt.ext || ".jpg");

        const fullPathFileName = urlImagePath + nama_file;
        // const fileBuffer = new Buffer(base64Str, 'base64');
        let base64Image = base64Str.split(';base64,').pop();
        fs.writeFile(fullPathFileName, base64Image, {encoding: 'base64'}, function (err) {
            if (err) {
                callback({status:1, data: [], errors: [{key: 'SQL', msg: err.message}]})
                return
            }
            callback({status:0, data: {url: fullPathFileName.replace('./asset', ''),file_name: nama_file}, msg: "File uploaded"});
        });
    }catch(err){
        callback({status:1, data: [], errors: [{key: 'SQL', msg: err.message}]});
    }
}

exports.Log = (key, log) => {
    if(config.debug){
        console.log(key,log);
    }
    /*var dt = new Date();
    fs.appendFile("../log.txt", key + "|" + dt.toISOString() + "|" + log + "\r\n", (err) => {
        if(err) {
            return console.log(err);
        }
    });*/

}
function pad(d, padding){
    var str = "" + d;
    var pad = padding || "00";
    return pad.substring(0, pad.length - str.length) + str;
}
exports.pad = (d, padding) => {
    let str = "" + d;
    let pad = padding || "00";
    return pad.substring(0, pad.length - str.length) + str;
}

exports.SumByKeys = (keys, data)=> {
    let result = 0;
    for(let i in data){
        for(let k in keys){
            result+= data[i][keys[k]];
        }
    }

    return result;
}