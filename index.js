require("dotenv").config();

const express = require("express");
const app = new express();
const database = require("./db/index.js")
app.use(express.json());
const port = process.env.PORT


app.post("/update-balance", async (req, res)=>{
    const {user_id, balance} = req.body;
    const query_text = `UPDATE users SET balance = balance - $1 WHERE id = $2`;
    try {
        await database.query(query_text, [balance, user_id])
        return res.status(200).send(true)
    } catch (e) {
        console.log(e)
        if(e.message.includes(`new row for relation "users" violates check constraint`)){
            return res.status(400).send("balance in minimum")
        }else{
            return res.status(500).send("Internal Server Error")
        }
    }
})

app.listen(port, async ()=>{
    try {
        const {rows} = await database.query(`SELECT * FROM users`, [])
        if(!rows?.length){
            const {rows} = database.query(`INSERT INTO users(balance) VALUES (10000)`)            
        }
    } catch (e) {
        console.log(e)
        try {
            await database.query(`CREATE TABLE users(
                id SERIAL PRIMARY KEY NOT NULL
                , balance INTEGER CHECK (balance >= 0)
                )`, []) ;
        } catch (error) {
            console.log(error)
        }
    
    }
    console.log("listening port " + port)
})