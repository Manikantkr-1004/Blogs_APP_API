const express = require("express");
const cors = require("cors");
const PORT = process.env.PORT || 7700;
const {connection} = require("./db");
const { allRouter } = require("./Routes/AllRoutes");

const app = express();

app.use(express.json());
app.use(cors())
app.use("/api",allRouter);

app.get("/",(req,res)=>{
    res.send("You are on the main page.")
})

app.listen(PORT,async()=>{
    try {
        await connection;
        console.log("Connected to the DB");
        console.log("Server is running at 7700");
    } catch (error) {
        console.log(error);
    }
})

