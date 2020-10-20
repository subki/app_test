const config = require('../config').config;
const util = require('../util');

class SQLLib{
	constructor(pool){
		this.pool = pool;
		this.table = "";
		this.Tx	 = null;
	}

	GetTransaction(){
		return this.Tx;
	}

	SetTransaction(tx){
		this.Tx = tx;
	}

	ClearTransaction(){
		this.Tx = null;
	}

	async BeginTransaction(){
		/*this.pool.getConnection((err, con)=>{
			if(err){
				return err;
			}
			this.Tx = con;
			return false;
		});

		return;*/
		let res, err;
		try{
			const con = await this.pool.getConnection();
			if(con){
				this.Tx = con;
				[res, err] = await this.Tx.beginTransaction();
				if(err){
					this.Tx.release();
					this.Tx = null;
				}
				return [res, err];
			}		
			return [res, false];
		}catch(e){
			return [res, e];
		}
	}

	async Rollback(){
		try{
			await this.Tx.rollback();
			await this.Tx.release();
			this.Tx = null;
		}catch(e){
			console.log(e);
			this.Tx = null;
		}
	}

	async Commit(){
		try{
			const [result, err] = await this.Tx.commit();
			if(err){
				await this.Rollback();
				return [result, err];
			}
			await this.Tx.release();
			this.Tx = null;
			return [result, false];
		}catch(e){
			console.log(e);
			this.Tx = null;
			return [null, e];
		}
	}

	// return value = rows, error
	async query(sql, param){
		try{
			const con = ((typeof this.Tx === 'undefined') || this.Tx === null)? this.pool: this.Tx;
			const [rows] = await con.query(sql, param);
			return [{status:0, data: rows, msg: "OK"}, false];
		}catch(err){
			util.Log("SQLQuery", err);
			return [{status:1, data: [], errors: [{key: 'SQL', msg: err.sqlMessage}]}, err];
		}
	}

	// return value = rows, error
	async queryRow(sql, param){
		try{
			const con = ((typeof this.Tx === 'undefined') || this.Tx === null)? this.pool: this.Tx;
			const [rows] = await con.query(sql, param);
			return [rows, false];
		}catch(err){
			util.Log("SQLQueryRow", err);
			return [[], [{key: 'SQL', msg: err.sqlMessage}]];
		}
	}

	async callProcedure(sql, param){
		try{
			const con = ((typeof this.Tx === 'undefined') || this.Tx === null)? this.pool: this.Tx;
			const [rows] = await con.query(sql, param);
			return [{status:0, data: rows.length>0?rows[0]:rows, msg: "OK"}, false];
		}catch(err){
			//util.Log("SQLQuery", err);
			return [{status:1, data: [], errors: [{key: 'SQL', msg: err.sqlMessage}]}, err];
		}
	}

	// return value = result, error
	async exec(sql, param){
		try{
			const con = ((typeof this.Tx === 'undefined') || this.Tx === null)? this.pool: this.Tx;
			const res = await con.query(sql, param);
			return [{status:0, data: res, msg: "OK"}, false];
		}catch(err){
			//util.Log("SQLExec", err);
			return [{status:1, data: [], errors: [{key: 'SQL', msg: err.sqlMessage}]}, err];
		}
	}

	async getPaging(sql, p, argsParam){
		try{
			let retval = {};
			let filter = p.filter?JSON.parse(p.filter):[];
			let fields = [], args=[], where = '';
			if(argsParam){
				args = argsParam;
			}
			
			if (filter && filter.length>0){
				for(let k in filter){
					let el = filter[k];
					switch(el.op){
						case "less":
						fields.push(el.field + ' < ? ');
						args.push(el.value);
							break;
						case "greater":
							fields.push(el.field + ' > ? ');
							args.push(el.value);
							break;
						case "equal":
							fields.push(el.field + ' = ? ');
							args.push(el.value);
						break;
						default:
						fields.push(el.field + ' like ? ');
						args.push('%'+el.value+'%');
						break;
					}
				}
				where += ' HAVING ' + fields.join(' AND ');
			}
			sql+= where;
			let sqlCount = `SELECT COUNT(*) as totalRows FROM (` + sql + `) tb;`
			if(p.sort && p.sort != ''){
				let sort = JSON.parse(p.sort);
				let sorting = [];
				for(let i in sort){
					sorting.push(`${sort[i].column} ${sort[i].order}`);
				}
				if(sorting.length>0){
					sql += ` ORDER BY ${sorting.join(',')}`;
				}
			}
			
			let totalRows = 0;
			const [rows] = await this.pool.query(sqlCount, args);			
			totalRows = rows[0].totalRows;

			let page = parseInt(p.page);
			p.rows = isNaN(parseInt(p.rows))?10:parseInt(p.rows);
			if (isNaN(page) || page<0) {
				p.page = 0;
			}else{
				page--;
				p.page = page;
			}

			if(p.rows>0 || !p.all){
				sql+= ` LIMIT ?,? `;
				args.push(p.page * parseInt(p.rows));
				args.push(p.rows);
			}			

			const [rowData] = await this.pool.query(sql, args);
			retval.rows = rowData;
			retval.total = totalRows;
			
			return [{status:0, data: retval, msg: "OK"}, false];
		}catch(err){
			util.Log("SQLGetPaging", err);
			return [{status:1, data: [], errors: [{key: 'SQL', msg: err.sqlMessage}]}, err];
		}
	}

    async checkUnique(param){
        let errors = [];
        for(let i in param){
            let sql = `SELECT 1 as r FROM ${this.table} WHERE \`${param[i].key}\`= ? `;
            let args = [param[i].value];
            if(param[i].exclude){
                const exclude = param[i].exclude;
                for(let x in exclude){
                    sql += `AND \`${exclude[x].key}\`<> ? `;
                    args.push(exclude[x].value);
                }
            }
            let [result, err] = await this.query(sql, args);
            if (err){
                return [{errors: [{key: param[i].key, msg: result.msg}]}, err];
            }
            if(result.data.length>0){
                errors.push({key: param[i].key, msg: param[i].msg});
            }
        }
        return [{errors: errors}, errors.length>0];
    }

    async checkListed(param){
        let errors = [];
        for(let i in param){
            let sql = `SELECT 1 as r FROM ${this.table} WHERE \`${param[i].key}\`= ? `;
            let args = [param[i].value];
            if(param[i].exclude){
                const exclude = param[i].exclude;
                for(let x in exclude){
                    sql += `AND \`${exclude[x].key}\`<> ? `;
                    args.push(exclude[x].value);
                }
            }
            let [result, err] = await this.query(sql, args);
            if (err){
                return [{errors: [{key: param[i].key, msg: result.msg}]}, err];
            }
            if(result.data.length===0){
                errors.push({key: param[i].key, msg: param[i].msg});
            }
        }
        return [{errors: errors}, errors.length>0];
    }

	async update(data){
        let param = {};
		let sql = "UPDATE " + this.table + " SET ";
		let fields = [];
		for(let key in data.fields){
			fields.push("`" + key + "`=:" + key);
			param[key]=data.fields[key];
		}
		sql += fields.join(",");
		sql += " WHERE ";
        let where = [];
		for(let key in data.where){
			where.push("`" + key +"`=:w_" + key);
			param['w_'+key]=data.where[key];
		}
		sql += where.join(" AND ");
		try{
			const con = ((typeof this.Tx === 'undefined') || this.Tx === null)? this.pool: this.Tx;
			const res = await con.query(sql, param);
			return [{status:0, data: res, msg: "OK"}, false];
		}catch(err){
			util.Log("SQLUpdate", err);
			return [{status:1, data: [], errors: [{key: 'SQL', msg: err.sqlMessage}]}, err];
		}
	}
	
	async delete(param){
		let sql = `DELETE FROM ${this.table} WHERE ${param.key}=?`;
		try{
			const con = ((typeof this.Tx === 'undefined') || this.Tx === null)? this.pool: this.Tx;
			const res = await con.query(sql, [param.value]);
			return [{status:0, data: res, msg: "OK"}, false];
		}catch(err){
			util.Log("SQLDelete", err);
			return [{status:1, data: [], errors: [{key: 'SQL', msg: err.sqlMessage}]}, err];
		}
	}
	// return value = result, error
	async execTransaction(sql, param){
		let con;
		try{
			con = await this.pool.getConnection();
			await con.beginTransaction();
			const res = await con.query(sql, param);
			await con.commit();
			con.release();
			return [{status:0, data: res, msg: "OK"}, false];			
		}catch(err){
			if(con) {
				con.rollback();
				con.release();
			}
			util.Log("SQLExec", err);
			return [{status:1, data: [], errors: [{key: 'SQL', msg: err.sqlMessage}]}, err];
		}
	}
}

module.exports = SQLLib;