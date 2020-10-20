const SQLLib = require('../lib/db');

class Users extends SQLLib{
    constructor(pool){
        super(pool);
        this.table = "users";
    }

    async getLogin(username){
        let sql = `SELECT a.id, a.username, a.password, a.notif_token FROM users a `;
        return await this.query(sql, [username]);
    }

    async get(id){
        let sql = `SELECT * FROM ${this.table} WHERE id=?;`;
        return await this.query(sql, [id]);
    }

}

module.exports = Users;