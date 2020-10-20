const express = require('express')
    , config = require('./config').config
    , app = module.exports = express()
    , http = require('http')
    , bodyParser = require('body-parser')
    , mysql = require('mysql2')
    , util = require("./util");

// var server = http.createServer(app);
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');

var schema = buildSchema(`
  type Query {
    hello: String
  }
`);
var root = {
    hello: () => {
        return 'Hello world!';
    },
};
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    grapihql: true,
}));

app.use( bodyParser.json({limit: '50mb'}) );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  limit: '50mb',
  extended: true
}));

app.set("config", config);
app.set('tokenkey', config.tokenKey);

const pool  = mysql.createPool({
    connectionLimit     : config.mysql_connection_limit,
    host                : config.mysql_host,
    user                : config.mysql_user,
    password            : config.mysql_password,
    database            : config.mysql_db,
    dateStrings         : true,
    multipleStatements  : true,
    namedPlaceholders   : true,
    decimalNumbers: true
});

app.pool = pool.promise();

app.listen(config.web_port);
console.log('Running a GraphQL API server at http://localhost:4000/graphql');

// server.listen(config.web_port, function(){
//     console.log('listening on *:'+config.web_port);
// });

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, PATCH, DELETE, OPTIONS");
    next();
});

app.use("/users", require("./controller/user"));
app.use("/brand", require("./controller/brand"));
app.use("/outlet", require("./controller/outlet"));
app.use("/product", require("./controller/product"));
app.use("/images", require("./controller/images"));


app.get('*', function(req, res){
    res.status(404).json({status:1, errors:[{key: '404', msg: '404 Not Found'}]});
});

app.use(function(err, req, res, next) {
    util.Log("Router Error", err)
    res.status(500).json({message: 'Router error occurred'})
});
