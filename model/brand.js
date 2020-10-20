const SQLLib = require('../lib/db');

class Brand extends SQLLib{
    constructor(pool){
        super(pool);
        this.table = "brand";
        this.listSQL =  `SELECT * FROM ${this.table} a `;
    }

    async find(param){
        let sql;
        if(param){
            return await this.getPaging(this.listSQL, param, []);
        }else{
            sql = this.listSQL + ` ORDER BY brand_name `;
        } 
        return await this.query(sql, []);
    }

    async get(id){
        let sql = this.listSQL + `WHERE id=?`;
        return await this.query(sql, [id]);
    }

    async insert(param){
        let sql = `INSERT INTO ${this.table} (brand_name, brand_path, crtby) 
                        VALUES (:brand_name, :brand_path, :crtby)`;
        return await this.query(sql, param);
    }
}

module.exports = Brand;