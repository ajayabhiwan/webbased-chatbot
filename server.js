const express = require("express");
const app = express();
require("./db/conn");


const UserRoute = require("./routes/userRoute");

const AdminRoute = require("./routes/AdminRoute");


app.use("/",UserRoute);
app.use("/api",AdminRoute);



app.listen(5000,()=>{
    console.log("server started at :http://127.0.0.1:5000");
})