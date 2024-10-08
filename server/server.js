const express = require("express");
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const cors = require('cors');
const { GridFSBucket } = require('mongodb');
const dotenv = require('dotenv');

const Post = require('./models/post');
const Challenge = require('./models/challenge');
const Event = require('./models/event');
const User = require('./models/user');
const Team = require('./models/team');

const productRoutes = require("./routes/products.routes");
const connexionRoutes = require("./routes/connexion.routes")
const userRoutes = require("./routes/user.routes")
const teamRoutes = require('./routes/team.routes')
const session = require('express-session')

dotenv.config();

const app = express();

//listen on port 5000
app.listen(5000, "localhost",() => {
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
    .then(() => {
        console.log("Connected to Database...");
    })
    .catch((error) => {
        console.error("Connection failed :/", error);
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

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');  // Dossier temporaire
    },
    filename: function (req, file, cb) {
        cb(null, crypto.randomBytes(20).toString('hex') + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

//routes
app.use("/api/products",productRoutes);
app.use('/api/connexion/', connexionRoutes)
app.use("/api/user/", userRoutes)

const sharp = require('sharp');

// Upload image route
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

    let fileBuffer = req.file.buffer;
    let fileName = crypto.randomBytes(20).toString('hex');
    
    // Convert HEIC to JPEG using sharp
    if (req.file.mimetype === 'image/heic') {
        try {
            fileBuffer = await sharp(req.file.buffer).jpeg().toBuffer();
            fileName += '.jpg';
        } catch (error) {
            return res.status(500).send('Error processing image.');
        }
    } else {
        fileName += path.extname(req.file.originalname);
    }

    const writeStream = gridfsBucket.openUploadStream(fileName);
    writeStream.end(fileBuffer);

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

    writeStream.on('error', (error) => {
        res.status(500).send('Error uploading file.');
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

app.get('/getUsersTotalPoints', async (req, res) => {
    try {
      // Fetch all users
      const users = await User.find();
  
      // Calculate total points for each user
      const usersWithPoints = users.map(user => {
        const totalPoints = Array.from(user.eventPoints.values()).reduce((acc, points) => acc + points, 0);
        return {
          ...user.toObject(),
          totalPoints,
        };
      });
  
      // Sort users by total points descending
      usersWithPoints.sort((a, b) => b.totalPoints - a.totalPoints);
  
      res.json(usersWithPoints);
    } catch (error) {
      console.error('Error fetching user rankings:', error);
      res.status(500).json({ error: 'Error fetching user rankings' });
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
        const { eventId } = req.query;
        let challenges;
        if (eventId) {
            challenges = await Challenge.find({ eventId });
        } else {
            challenges = await Challenge.find();
        }
        res.status(200).json(challenges);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/challenges', async (req, res) => {
    try {
        const { id, eventId, title, reward, isCollective, icon } = req.body;

        // Ensure the challenge ID is unique
        const existingChallenge = await Challenge.findOne({ id });
        if (existingChallenge) {
            return res.status(400).send('Challenge ID already taken.');
        }

        const newChallenge = new Challenge({
            id,
            eventId,
            title,
            reward,
            isCollective,
            icon
        });

        await newChallenge.save();

        // Update the event's challenges list
        const event = await Event.findOne({ id: eventId });
        if (event) {
            event.challenges = event.challenges ? event.challenges + `,${id}` : `${id}`;
            await event.save();
        }

        res.status(201).json(newChallenge);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//route for deleting a challenge
app.delete('/challenges/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const challenge = await Challenge.findOneAndDelete({ id });

        if (!challenge) {
            return res.status(404).send('Challenge not found');
        }

        // Optionally update the event's challenge list if needed
        const event = await Event.findOne({ id: challenge.eventId });
        if (event) {
            event.challenges = event.challenges.split(',').filter(challengeId => challengeId !== id.toString()).join(',');
            await event.save();
        }

        res.status(200).send('Challenge deleted');
    } catch (error) {
        res.status(500).send(error.message);
    }
});


app.get('/challenges/ids', async (req, res) => {
    try {
        const challenges = await Challenge.find({}, { id: 1, _id: 0 });
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

app.put('/challenges/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updatedChallenge = req.body;
  
      // Find the challenge by ID and update it with the new data
      const challenge = await Challenge.findOneAndUpdate({ id }, updatedChallenge, { new: true });
  
      if (!challenge) {
        return res.status(404).send('Challenge not found');
      }
  
      res.status(200).json(challenge);
    } catch (error) {
      res.status(500).send('Error updating challenge: ' + error.message);
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

// Route to create a new team
app.post('/teams', async (req, res) => {
    const { id, name, eventId, maxMembers } = req.body;
  
    try {
      const newTeam = new Team({
        id,
        name,
        eventId,
        members: [],
        maxMembers: maxMembers
      });
  
      const savedTeam = await newTeam.save();
  
      // Update the event with the new team ID
      await Event.updateOne(
        { id: eventId },
        { $push: { teams: id } }
      );
  
      res.status(201).json(savedTeam);
    } catch (error) {
      res.status(500).json({ message: 'Error creating team', error });
    }
});

// Route to update a team
app.put('/teams/:id', async (req, res) => {
    const { id } = req.params;
    const { name, maxMembers } = req.body;

    try {
        const updatedTeam = await Team.findOneAndUpdate(
            { id },
            { name, maxMembers },
            { new: true }
        );

        if (!updatedTeam) {
            return res.status(404).json({ message: 'Team not found' });
        }

        res.status(200).json(updatedTeam);
    } catch (error) {
        res.status(500).json({ message: 'Error updating team', error });
    }
});

// Route to delete a team
app.delete('/teams/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Find and delete the team
        const deletedTeam = await Team.findOneAndDelete({ id });

        if (!deletedTeam) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Update the event to remove the deleted team ID
        await Event.updateOne(
            { id: deletedTeam.eventId },
            { $pull: { teams: id } }
        );

        // Clear the teamId for all users who were in the deleted team
        await User.updateMany(
            { teamId: id },
            { $unset: { teamId: "" } } // Clears the teamId field
        );

        // Clear the teamId for all posts associated with the deleted team
        await Post.updateMany(
            { teamId: id },
            { $unset: { teamId: "" } } // Clears the teamId field
        );

        res.status(200).json({ message: 'Team deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting team', error });
    }
});



  
// Route to get all team IDs
app.get('/teams/ids', async (req, res) => {
    try {
      const teams = await Team.find({}, { id: 1, _id: 0 });
      res.status(200).json(teams);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching team IDs', error });
    }
  });

// Fetch team members for a specific team
app.get('/teams/:id/members', async (req, res) => {
    try {
      const team = await Team.findOne({ id: req.params.id }).populate('members');
  
      const members = team.members.map(member => ({
        _id: member._id,
        teamId: member.teamId,
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

        // Remove user from previous team's members if applicable
        if (previousTeamId) {
            const previousTeam = await Team.findOne({ id: previousTeamId });
            if (previousTeam && previousTeam.members.includes(userId)) {
                previousTeam.members = previousTeam.members.filter(memberId => memberId.toString() !== userId.toString());
                console.log("previousTeam.members "+previousTeam.members)
                await previousTeam.save();
            }
        }

        // If the new teamId is empty, simply remove the teamId from the user
        if (!teamId) {
            user.teamId = '';
            await user.save();
            return res.status(200).send('User removed from team successfully');
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
// Route to pin a challenge
app.post('/pinChallenge', async (req, res) => {
    const { userId, challengeId } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user.pinnedChallenges.includes(challengeId)) {
            user.pinnedChallenges.push(challengeId);
            await user.save();
        }
        res.status(200).json(user.pinnedChallenges);
    } catch (error) {
        console.error('Error pinning challenge:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to unpin a challenge
app.post('/unpinChallenge', async (req, res) => {
    const { userId, challengeId } = req.body;

    try {
        const user = await User.findById(userId);
        user.pinnedChallenges = user.pinnedChallenges.filter(id => id !== challengeId);
        await user.save();
        res.status(200).json(user.pinnedChallenges);
    } catch (error) {
        console.error('Error unpinning challenge:', error);
        res.status(500).send('Internal Server Error');
    }
});
// Route to get user points and ranks
app.get('/getUsersTotalPoints', async (req, res) => {
    try {
      // Fetch all users
      const users = await User.find();
  
      // Calculate total points for each user
      const usersWithPoints = users.map(user => ({
        ...user.toObject(),
        totalPoints: Object.values(user.eventPoints).reduce((acc, points) => acc + points, 0),
      }));
  
      // Sort users by total points descending
      usersWithPoints.sort((a, b) => b.totalPoints - a.totalPoints);
  
      res.json(usersWithPoints);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching user rankings' });
    }
  });
  

app.get("/", (req,res) =>{
    res.send("Hello from Backend Server !");
});

