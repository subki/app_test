const jwt 	= require('jsonwebtoken');
const app 	= require('..');
// const model = require('../model/user');
// let mod 	= new model(app.pool);

module.exports =  (reqType, appcode, action)=>{
	return (req,res,next)=>{
		let token = req.body.token || req.query.token || req.headers['token'];

		let retval={};
		if (token) {
			jwt.verify(token, app.get('tokenkey'), (err, decoded) =>{      
			  if (err) {
			     retval = { status: 2, errors: [{key: "auth", msg:"Invalid Token"}], data:[]};
			     sendResponse(req, res, reqType, retval, 401);
			  } else {
			    req.userInfo = decoded;
			    res.locals.user = decoded;
			    /*if(appcode){
			    	mod.getPriviledge([req.userInfo.id, appcode], function(result){
			    		retval = { status: 1, msg: "Sorry, you don't have priviledge", data:[]};
			    		if(result.status==0){
			    			if(result.data.length>0){
			    				next();
			    			}else{
			    				sendResponse(req, res, 'priv', retval);
			    			}
			    		}else{
			    			sendResponse(req, res, 'priv', retval);
			    		}
			    	});
			    }else{*/
			    	return next();
			    //}
			  }
			});
		}else{
			retval={status:2, errors: [{key: "auth", msg:"Please Login"}], data:[]};
			sendResponse(req, res, reqType, retval, 401);
		}
	}
}

function sendResponse(req, res, reqType, retval, status){
	if(reqType=='api'){
		res.status(status).json(retval);
	}else if(reqType=='priv'){
		res.end("Sorry, you don't have priviledge to access this page");
	}else{
		res.redirect('/login');
	}
}