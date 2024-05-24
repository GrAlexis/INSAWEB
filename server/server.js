const express = require("express");
const mongoose = require('mongoose');

const mesLivres = require("./models/mesLivres");

const app = express();

//listen on port 50000
app.listen(5000, () => {
    console.log("Backend is running on port 5000...");
});


//connection to mongoDB 
mongoose.connect("mongodb://172.16.52.69:27017/test")
    .then(()=>{
        console.log("Connected to Database...");
    })
    .catch(()=>{
        console.log("Connection failed :/");
    });

app.use(express.json());
app.post("/putLivres",(req,res)=>{
    const newBook = new mesLivres(req.body);
    newBook.save().then((newBook)=>{
        res.status(201).send(newBook);
    }).catch((error)=>{
        res.status(400).send(error);
    })
});



app.get("/", (req,res) =>{
    res.send("Hello from Backend Server !");
});

