const mongoose = require("mongoose")

const ProductSchema = mongoose.Schema(
    {
    
        name : {
            type: String,
            required : [true, "Please enter product name"]
        },
  
    
        desc : {
            type : String,
            required : true
        },
        
        
    },
    //{timestamps : true,
            
    //}
);

const Product = mongoose.model("Product",ProductSchema);
module.exports=Product;