exports.config = {
    web_port:7000,
    mysql_db:'test',
    mysql_host:'127.0.0.1',
    mysql_user:'root',
    mysql_password:'',
    debug:true,
    mysql_connection_limit:10,
    errMsg:"Ups shomething went wrong...", //error yang ditampilkan ketika debug = false
    log:"logapp.log",
    tokenKey: "test@201906"
}
