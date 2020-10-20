const SQLLib = require('../lib/db');

class Outlet extends SQLLib{
    constructor(pool){
        super(pool);
        this.table = "product";
        this.listSQL =  `SELECT * FROM ${this.table} a `;
    }

    async find(param){
        let sql;
        if(param){
            return await this.getPaging(this.listSQL, param, []);
        }else{
            sql = this.listSQL + ` ORDER BY product_name `;
        } 
        return await this.query(sql, []);
    }

    async get(id){
        let sql = this.listSQL + `WHERE id=?`;
        return await this.query(sql, [id]);
    }

    async insert(param){
        let sql = `INSERT INTO ${this.table} (brand_id, product_name, price, crtby) 
                        VALUES (:brand_id, :product_name, :price, :crtby)`;
        return await this.query(sql, param);
    }
}

module.exports = Outlet;