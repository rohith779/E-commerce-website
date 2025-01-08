const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { type } = require("os");
const { error } = require("console");

app.use(express.json());
app.use(cors());
// by this, the frontend reactjs project will be connected to exoress app on 4000 port.

//DataBase Connection with MongoDB
mongoose.connect("your api key here")
//If the password or the username contain any of {https://docs.mongodb.com/manual/reference/connection-string/#examples} these "$ : / ? # [ ] @", then 
//they should be put through percent encoding. 

//API Creation 
app.get("/",(req,res) => {
    res.send("Express App is running")
})

// we'll create multiple endpoints on the same api. for login,all products etc.
//Image Storage Engine

const storage = multer.diskStorage({ //this is middleware
    destination: './upload/images',
    filename: (req,file,cb) => {
        return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
}) //2. This middleware will rename the image with the above {${file.fieldname}_${Date.now()}${path.extname(file.originalname)}}

const upload=multer({storage:storage})
// Creating Upload
app.use('/images',express.static('upload/images')) //will get imagesfolder at /images endpoint
app.post("/upload",upload.single('Product'), (req,res)=>{ //any image we use, will upload at this ep 
    res.json({
        success:1,
        image_url:`http://localhost:${port}/images/${req.file.filename}`
    })
}) 
//1.our image will be uploaded using the post method in this endpoint
//3.That image will be stored in this images folder
//4. After that, we will get the name of the image uploaded to images folder using 'req'
//5. after that, using this name well generate a response which will be used by user to access the image 
//6. check the name of images in images folder.
//using multer we have created upload, thru dis ep,with post we uploaded the file[the file from system to upload/images through local host]

//Adding ep to add objects to mongodb...Schema for creating products...
//Product is the schema of the database
const Product = mongoose.model("Product",{
    id:{
        type: Number,
        required: true,
    },
    name:{
        type: String,
        required: true, 
    },
    image:{
        type: String,
        required: true,
    },
    category:{
        type: String,
        required: true,  
    },
    new_price: {
        type: Number,
        required: true,
    },
    old_price:{
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    available: {
        type: Boolean,
        default: true,
    },
})

app.post('/addproduct',async (req,res) => {
    let products = await Product.find({});
    let id;
    if(products.length>0){
        let last_product_array=products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id+1;
    }
    else{
        id=1;
    }
    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price
    }); //the req request in question will be sent through thunderclient
    console.log(product);
    await product.save();
    console.log("Saved");
    //Create a response for the frontend
    res.json({
        success:true,
        name: req.body.name,
    })
})

//Creating API for Deleting Products
app.post('/removeproduct',async(req,res) => {
    await Product.findOneAndDelete({id:req.body.id});
    console.log("Removed");
    res.json({
        success: true,
        name: req.body.name
    })
})

//API for all products
app.get('/allproducts',async(req,res) => {
    let products = await Product.find({});
    console.log("All Products Fetched");
    res.send(products);
})

//Shema creating for User model

const Users = mongoose.model('Users',{
    name:{
        type:String,
    },
    email:{
        type:String,
        unique: true,
    },
    password:{
        type:String,
    },
    cartData:{
        type: Object,
    },
    date:{
        type: Date,
        default: Date.now,
    }
})

//Creating Endpoint for registering the User.

app.post('/signup', async (req,res)=>{
    let check = await Users.findOne({email:req.body.email});
    if(check){
        return res.status(400).json({success:false,error:"Existing User with the same Email found"});
    }
    let cart ={};
    for (let index = 0; index < 300; index++) {
        cart[index]=0; 
    }
    const user = new Users({
        name:req.body.username,
        email:req.body.email,
        password:req.body.password,
        cartData:cart,
    }) 

    await user.save();

    const data = {
        user:{
            id: user.id
        }
    }

    const token = jwt.sign(data,'secret_ecom'); // token will be unreadable
    res.json({success:true,token})
    
})

//Creating endpoint for User Login
app.post('/login',async(req,res) => {
    let user = await Users.findOne({email:req.body.email});
    if(user){
        const passCompare = req.body.password === user.password;
        if(passCompare) {
            const data = {
                user:{
                    id:user.id
                }
            }
            const token = jwt.sign(data,'secret_ecom');
            res.json({success:true,token});
        }
        else{
            res.json({success:false,errors:"Wrong Password"});
        }
    }
    else{
        res.json({success:false,errors:"Wrong Email Id"});
    }
})

//Creating endpoint for newcollection data
app.get('/newcollection',async (req,res) => {
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log('New Collections Fetched');
    res.send(newcollection);
})

//Creating endpoint for popular in woman section
///////////////////////////////////////////
app.get('/popularwoman', async(req,res) => {
    let products = await Product.find({category:"women"});

    let popular_woman = products.slice(0,4);
    console.log("popular in woman fetched");
    res.send(popular_woman);

})

//Creating Middleware to fetch user.
    const fetchUser = async(req,res,next) => {
        const token = req.header('auth-token');
        if(!token){
            res.status(401).send({errors:"Please Authenticate using valid token"});
        }
        else{
            try{
            const data = jwt.verify(token,'secret_ecom');
            req.user = data.user;
            next();
            }catch(error) {
                res.status(401).send({errors:"Please authenticate using a valid token"});

            }
        }
    }

//Creating Endpoint for adding products to the cart.
app.post('/addtocart',fetchUser, async(req,res) => {
    let userData = await Users.findOne({_id:req.user.id});  //retrieves a single doc from the collection.
    console.log("Removed",req.body.itemId);
    userData.cartData[req.body.itemId] += 1;
    await Users.findByIdAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Added");
})

// Creating endpoint for removing products to the cart.
app.post('/removefromcart',fetchUser,async(req,res) => {
    let userData = await Users.findOne({_id:req.user.id});  //retrieves a single doc from the collection.
    console.log("Removed",req.body.itemId);
    
    if(userData.cartData[req.body.itemId]>0)
    userData.cartData[req.body.itemId] -= 1;
    await Users.findByIdAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Removed");
})

//Creating endpoint to get cartdata.
app.post('/getcart',fetchUser,async(req,res) => {
    console.log("Get Chart");
    let userData = await Users.findOne({_id:req.user.id});
    res.json(userData.cartData);
})


app.listen(port, (error)=>{
    if(!error){
        console.log("Server running on port:"+port)
    }
    else{
        console.log("Error:"+error)
    }
})
