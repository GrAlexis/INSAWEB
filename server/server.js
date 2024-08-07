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
const connexionRoutes = require("./routes/connexion.routes")
const session = require('express-session')

const app = express();

//listen on port 5000
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
app.use('/api/connexion/', connexionRoutes)

//upload image route
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    // Check if a member of the same team has already posted for the collective challenge
    const challenge = await Challenge.findOne({ id: req.body.challengeId });
    if (challenge.isCollective && req.body.teamId) {
        const existingPost = await Post.findOne({ teamId: req.body.teamId, challengeId: req.body.challengeId });
        if (existingPost) {
            return res.status(400).send('A member of your team has already posted for this collective challenge.');
        }
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
            teamId: req.body.teamId,
            isValidated: false
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

// Route to get posts by teamId and challengeId
app.get('/posts/byTeamAndChallenge', async (req, res) => {
    const { teamId, challengeId } = req.query;

    try {
        const posts = await Post.find({ teamId: teamId, challengeId: challengeId });
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

// Fetch ranking for a specific event
app.get('/ranking/:eventId', async (req, res) => {
    try {
      const { eventId } = req.params;
      const teams = await Team.find({ eventId }).populate('members');
      
      const teamRankings = teams.map(team => {
        const totalPoints = team.members.reduce((acc, member) => acc + (member.eventPoints.get(eventId) || 0), 0);
        return { id: team.id, name: team.name, points: totalPoints };
      }).sort((a, b) => b.points - a.points);
  
      res.json(teamRankings);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching ranking' });
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

// Fetch team members for a specific team
app.get('/teams/:id/members', async (req, res) => {
    try {
      const team = await Team.findOne({ id: req.params.id }).populate('members');
  
      const members = team.members.map(member => ({
        id: member._id,
        name: member.name,
        points: member.eventPoints.get(team.eventId) || 0,
      })).sort((a, b) => b.points - a.points);
  
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching team members' });
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
    const { userId, teamId, eventId, previousTeamId } = req.body;

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

        // Remove user from previous team's members if applicable
        if (previousTeamId) {
            const previousTeam = await Team.findOne({ id: previousTeamId });
            if (previousTeam && previousTeam.members.includes(userId)) {
                previousTeam.members = previousTeam.members.filter(memberId => memberId.toString() !== userId.toString());
                await previousTeam.save();
            }
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

// Middleware to check if the user is an admin
const checkAdmin = (req, res, next) => {
    const isAdmin = req.body.isAdmin;
    if (isAdmin) {
        next();
    } else {
        res.status(403).send('Access denied.');
    }
};

// Route to validate or unvalidate a pending post
app.post('/admin/validatePost/:id', checkAdmin, async (req, res) => {
    try {
        const { rewardPoints, eventId } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).send('Post not found');
        }

        // Toggle the validation state
        post.isValidated = !post.isValidated;
        await post.save();
        
        // Find the challenge to check if it is a collective challenge
        const challenge = await Challenge.findOne({ id: post.challengeId });
        
        // If it's a collective challenge
        if (challenge.isCollective && post.teamId) {
            const team = await Team.findOne({ id: post.teamId }).populate('members');
            const memberCount = team.members.length;
            const pointsPerMember = rewardPoints / memberCount;

            for (const member of team.members) {
                if (!member.eventPoints.has(eventId)) {
                    member.eventPoints.set(eventId, 0);
                }
                // Add or subtract points based on the validation state
                const currentPoints = member.eventPoints.get(eventId);
                member.eventPoints.set(eventId, post.isValidated ? currentPoints + pointsPerMember : currentPoints - pointsPerMember);
                await member.save();
            }
        } else {
            // For non-collective challenges
            const user = await User.findById(post.user);
            if (user) {
                if (!user.eventPoints.has(eventId)) {
                    user.eventPoints.set(eventId, 0);
                }
                // Add or subtract points based on the validation state
                const currentPoints = user.eventPoints.get(eventId);
                user.eventPoints.set(eventId, post.isValidated ? currentPoints + rewardPoints : currentPoints - rewardPoints);
                await user.save();
            }
        }

        res.status(200).send('Post validation status updated successfully');
    } catch (error) {
        res.status(500).send(error.message);
    }
});


app.get("/", (req,res) =>{
    res.send("Hello from Backend Server !");
});

