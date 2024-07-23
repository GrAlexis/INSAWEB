const express = require("express");
const mongoose = require('mongoose');
const Product = require("./models/product")
const productRoutes = require("./routes/products.routes");
const connexionRoutes = require("./routes/connexion.routes")
const session = require('express-session')

const app = express();

//listen on port 50000
app.listen(5000, () => {
    console.log("Backend is running on port 5000...");
});

// Setting up session management
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
  }))


//connection to mongoDB 
//mongoose.connect("mongodb://172.16.52.69:27017/test")
//    .then(()=>{
//        console.log("Connected to Database...");
//    })
//    .catch(()=>{
//        console.log("Connection failed :/");
//    });


//middleware
app.use(express.json())
app.use(express.urlencoded({extended : false}));


//routes
app.use("/api/products",productRoutes);
app.use('/api/connexion/', connexionRoutes)


app.get("/", (req,res) =>{
    res.send("Hello from Backend Server !");
});
