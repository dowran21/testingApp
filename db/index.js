require("dotenv").config();
const Pool = require('pg').Pool;

const pool = new Pool ({
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME,
    host:process.env.DB_HOST,
    port:process.env.DB_PORT,
})

module.exports = { 
    pool, 
    async query(text, params){
        const res = await pool.query(text, params);
        return res;
    },
    async queryTransaction(query_list){ 
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            let response = [];
            for (const {text, params} in query_list) {
                const {rows} = client.query(text, params)
                response = response.concat(rows);
            }
            await client.query("COMMIT")
            return response;
        } catch (e) {
            await client.query("ROLLBACK")
            throw e;
        }finally{
            client.release();
        }
    }

}