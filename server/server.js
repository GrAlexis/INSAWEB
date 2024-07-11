const express = require("express");
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const cors = require('cors');
const { GridFSBucket } = require('mongodb');

const Product = require("./models/product")
const Post = require('./models/post');
const productRoutes = require("./routes/products.routes");

const app = express();

//listen on port 50000
app.listen(5001, () => {
    console.log("Backend is running on port 5001...");
});


//connection to mongoDB 
mongoose.connect("mongodb://172.16.52.69:27017/test")
    .then(()=>{
        console.log("Connected to Database...");
    })
    .catch(()=>{
        console.log("Connection failed :/");
    });

const conn = mongoose.connection;
let gridfsBucket;

conn.once('open', () => {
    gridfsBucket = new GridFSBucket(conn.db, {
        bucketName: 'uploads',
    });
});

//middleware
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended : false}));

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

//routes
app.use("/api/products",productRoutes);

app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const fileName = crypto.randomBytes(20).toString('hex') + path.extname(req.file.originalname);
    const writeStream = gridfsBucket.openUploadStream(fileName);

    writeStream.end(req.file.buffer);

    writeStream.on('finish', async () => {
        const newPost = new Post({
            challengeName: req.body.challengeName,
            date: new Date(),
            user: req.body.user,
            likes: 0,
            picture: fileName
        });

        try {
            const savedPost = await newPost.save();
            res.status(201).send(savedPost);
        } catch (error) {
            res.status(500).send(error.message);
        }
    });
});

app.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/file/:filename', async (req, res) => {
    try {
        const file = await conn.db.collection('uploads.files').findOne({ filename: req.params.filename });

        if (!file) {
            return res.status(404).send('File not found');
        }

        const readStream = gridfsBucket.openDownloadStreamByName(req.params.filename);
        readStream.pipe(res);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get("/", (req,res) =>{
    res.send("Hello from Backend Server !");
});

app.post('/upload',(req,res) => {

})