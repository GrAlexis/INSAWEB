const Product = require("../models/product");



const getProducts = async(req,res)=>{
    
        try{
            const products = await Product.find({})
            res.status(200).json(products);
            
        }catch(error){
            res.status(500).json({message : error.message});
        }
};

const getProduct = async (req,res)=>{
    try{
        const name = req.params.name;
        const product = await Product.findOne({name});
        res.status(200).json(product);
    }catch (error){
        res.status(500).json({message : error.message});
    }
}

const createProduct = async (req, res) => {
    try {
        const { name } = req.body;

        const productExist = await Product.findOne({ name });
        if (!productExist) {
            const product = await Product.create(req.body);
            return res.status(201).json(product); 
        } else {
            return res.status(400).json({ message: 'Product already exists' }); 
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const updateProduct = async (req,res)=>{
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
}

const deleteProduct = async (req,res)=>{
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
}


module.exports={
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
}