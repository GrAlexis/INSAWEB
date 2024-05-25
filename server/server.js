const express = require("express");
const mongoose = require('mongoose');
const Product = require("./models/product")
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


//middleware
app.use(express.json())
app.use(express.urlencoded({extended : false}));


//routes






app.get("/", (req,res) =>{
    res.send("Hello from Backend Server !");
});




//get all products
app.get("/api/products", async(req,res)=>{
    try{
        const products = await Product.find({})
        res.status(200).json(products);
    }catch(error){
        res.status(500).json({message : error.message});
    }
});
//get product by name
app.get("/api/products/:name",async (req,res)=>{
    try{
        const name = req.params.name;
        const product = await Product.findOne({name});
        res.status(200).json(product);
    }catch (error){
        res.status(500).json({message : error.message});
    }
});
//create a product
app.post("/api/products", async (req,res)=>{
    try{
        const product = await Product.create(req.body);
        res.status(200).json(product);
    }catch(error){
        res.status(500).json({message : error.message});
    }
});

//update a product

app.put("/api/product/:name",async (req,res)=>{
    try{
        const name =req.params.name;
        const product = await Product.findOneAndUpdate({name},req.body);
        
        if(!product){
            return res.status(404).json({message : "Product not found"});
        }
        res.status(200).json("Product "+name+ " updated");

    }catch(error){
        res.status(500).json({message : error.message});
    }
});

//delete a product

app.delete("/api/product/:name", async (req,res)=>{
    try{
        const name = req.params.name;
        const product = await Product.findOneAndDelete({name});
        if(!product){
            return res.status(404).json({message : "Product not found"});
        }
        res.status(200).json({message : "Product deleted successfully"});
    }catch(error){
        res.status(500).json({message : error.message});
    }

});

