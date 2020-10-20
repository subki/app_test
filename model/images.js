const SQLLib = require('../lib/db');
const util = require('../util');

class Images extends SQLLib{
    constructor(pool){
        super(pool);
        this.table = "image";
        this.listSQL = `SELECT a.* FROM ${this.table} a `;
    }

    async find(param){
        let sql;
        if(param){
            return await this.getPaging(this.listSQL, param, []);
        }else{
            sql = this.listSQL + ` ORDER BY upddt desc `;
        } 
        return await this.query(sql, []);
    }

    async get(id){
        let sql = this.listSQL + `HAVING id=?`;
        return await this.query(sql, [id]);
    }

    async insert(param){
        let sql = `INSERT INTO ${this.table} (ref_id, ref_table, path_image, description, crtby) VALUES
                        (:ref_id, :ref_table, :path_image, :description, :crtby);`;
        return await this.query(sql, param);
    }

}

module.exports = Images;