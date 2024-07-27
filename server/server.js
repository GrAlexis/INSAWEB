const express = require("express");
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const cors = require('cors');
const { GridFSBucket } = require('mongodb');

const Post = require('./models/post');
const Challenge = require('./models/challenge');
const Event = require('./models/event');
const User = require('./models/user');
const Team = require('./models/team');


const productRoutes = require("./routes/products.routes");

const app = express();

//listen on port 5001
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

//upload image route
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const fileName = crypto.randomBytes(20).toString('hex') + path.extname(req.file.originalname);
    const writeStream = gridfsBucket.openUploadStream(fileName);

    writeStream.end(req.file.buffer);

    writeStream.on('finish', async () => {
        const newPost = new Post({
            challengeId: req.body.challengeId,
            date: new Date(),
            user: req.body.user,
            likes: 0,
            picture: fileName,
            description: req.body.description,
            teamId: req.body.teamId
        });

        try {
            const savedPost = await newPost.save();
            res.status(201).send(savedPost);
        } catch (error) {
            res.status(500).send(error.message);
        }
    });
});

//get posts/publications route

app.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Route to get posts by userId and challengeId
app.get('/posts/byUserAndChallenge', async (req, res) => {
    const { userId, challengeId } = req.query;
  
    try {
      const posts = await Post.find({ user: userId, challengeId: challengeId });
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

//get specfic image

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

// Event routes
app.get('/events', async (req, res) => {
    try {
        const events = await Event.find();
        res.status(200).json(events);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//fetch an event by its name
app.get('/events/:id', async (req, res) => {
    try {
        const event = await Event.findOne({ id: req.params.id });
        if (!event) {
            return res.status(404).send('Event not found');
        }
        res.status(200).json(event);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/events/:id/teams', async (req, res) => {
    try {
        const teams = await Team.find({ eventId: req.params.id });
        res.status(200).json(teams);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// Challenge routes

app.get('/challenges', async (req, res) => {
    try {
        const challenges = await Challenge.find();
        res.status(200).json(challenges);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//route to fetch a challenge by id
app.get('/challenges/:id', async (req, res) => {
    try {
        const challenge = await Challenge.findOne({ id: req.params.id });
        if (!challenge) {
            return res.status(404).send('Challenge not found');
        }
        res.status(200).json(challenge);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//route to fetch all users
app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Route to fetch a user by _id
app.get('/users/:id', async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).send('User not found');
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

//route to delete a post
app.delete('/posts/:id', async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).send('Post not found');
        }
        res.status(200).send('Post deleted');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Route to fetch a team by ID
app.get('/teams/:id', async (req, res) => {
    try {
      const team = await Team.findOne({ id: req.params.id });
      if (!team) {
        return res.status(404).send('Team not found');
      }
      res.status(200).json(team);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

//route to assign a team to an user
app.post('/assignTeam', async (req, res) => {
    const { userId, teamId, eventId } = req.body;

    try {
        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Find team by teamId
        const team = await Team.findOne({ id: teamId });
        if (!team) {
            return res.status(404).send('Team not found');
        }

        // Assign user to team
        user.teamId = teamId;
        if (!user.eventPoints.has(eventId)) {
            user.eventPoints.set(eventId, 0); // Initialize points for the event
        }
        await user.save();

        // Add user to team members if not already added
        if (!team.members.includes(userId)) {
            team.members.push(userId);
        }
        await team.save();

        res.status(200).send('User assigned to team successfully');
    } catch (error) {
        res.status(500).send(error.message);
    }
});



app.get("/", (req,res) =>{
    res.send("Hello from Backend Server !");
});

