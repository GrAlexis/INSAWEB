const express = require("express");
const mongoose = require('mongoose');
const multer = require('multer');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cors = require('cors');
const { GridFSBucket } = require('mongodb');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt')


const Post = require('./models/post');
const Challenge = require('./models/challenge');
const Event = require('./models/event');
const User = require('./models/user');
const Team = require('./models/team');
const Universe = require('./models/universe')

const userRoutes = require("./routes/user.routes")
const teamRoutes = require('./routes/team.routes')
const session = require('express-session')

dotenv.config();

const app = express();

const rateLimit = require('express-rate-limit');
// Créer une liste temporaire de bannissement
const bannedIPs = new Set();

// Fonction pour bannir une IP pendant un certain temps
const banIP = (ip, duration) => {
  bannedIPs.add(ip);
  console.log(`IP ${ip} a été bannie pendant ${duration / 1000} secondes.`);
  
  // Retirer l'IP après le délai
  setTimeout(() => {
    bannedIPs.delete(ip);
    console.log(`IP ${ip} a été débannie.`);
  }, duration);
};

// Middleware pour vérifier si l'IP est bannie
const checkBanMiddleware = (req, res, next) => {
  if (bannedIPs.has(req.ip)) {
    return res.status(403).json({ message: "Votre IP est temporairement bannie pour SPAM" });
  }
  next();
};

// Configurer le limiter de requêtes
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 10, // Limite de 100 requêtes par IP dans ce laps de temps
  handler: (req, res, next) => {
    // Bannir l'IP pour 1 heure si la limite est dépassée
    banIP(req.ip, 30 * 1000); 
    res.status(429).json({ message: "Trop de requêtes - Votre IP est bannie temporairement." });
  }
});

// Appliquer le middleware à toutes les routes
app.use(checkBanMiddleware);  // Vérifie si l'IP est bannie avant de continuer


app.use('/api/user/login', limiter);
app.use('/api/user/registerGlobal', limiter);
app.use('/api/user/registerAdminUser', limiter);

//Décommenter la partie SSL pour la PROD et commenter le app.listen Localhost - changer aussi le .env
//const sslServer = https.createServer({
//    key: fs.readFileSync('/etc/letsencrypt/live/sheeesh.eu/privkey.pem'),
//    cert: fs.readFileSync('/etc/letsencrypt/live/sheeesh.eu/fullchain.pem'),
//}, app);

const API_PORT = process.env.API_PORT;

// Écoute sur le port 5000 en HTTPS
//sslServer.listen(API_PORT, "92.243.24.55", () => {
//    console.log(`Backend is running on port ${API_PORT} over HTTPS...`);
//});
const DEVPROD = process.env.DEVPROD;

app.listen(API_PORT, DEVPROD,() => {
    console.log(`Backend is running on port ${API_PORT}...`);
});


// Setting up session management
app.use(session({
    secret: "cléTC2024*SheeshDev",
    resave: false,
    saveUninitialized: true
  }))


//connection to mongoDB 
const mongoUri = process.env.MONGO_URI;
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
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
// Multer setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');  // Dossier temporaire
    },
    filename: function (req, file, cb) {
        cb(null, crypto.randomBytes(20).toString('hex') + path.extname(file.originalname));  // Unique file name
      }
});
const upload = multer({ storage });


//routes

app.use("/api/user/", userRoutes)

const ffmpeg = require('fluent-ffmpeg');

const heicConvert = require('heic-convert');

const { promisify } = require('util');
const event = require("./models/event");
const universe = require("./models/universe");
const unlinkAsync = promisify(fs.unlink);

// Set the ffmpeg and ffprobe paths (for video processing)
ffmpeg.setFfmpegPath(require('@ffmpeg-installer/ffmpeg').path);
ffmpeg.setFfprobePath(require('@ffprobe-installer/ffprobe').path);

// Upload image/video route
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const filePath = path.join(__dirname, 'uploads', req.file.filename);
    let fileName = crypto.randomBytes(20).toString('hex');
    let thumbnailName = '';
    let fileBuffer;
    let isVideo = false;

    if (req.file.mimetype === 'image/heic') {
        try {
            const heicBuffer = fs.readFileSync(filePath);
            fileBuffer = await heicConvert({
                buffer: heicBuffer,
                format: 'JPEG',
                quality: 0.5
            });
            fileName += '.jpg';
        } catch (error) {
            return res.status(500).send(`HEIC conversion error: ${error.message}`);
        }
    } else if (/\.(mp4|mov|avi|wmv|flv|mkv)$/i.test(req.file.originalname)) {
        isVideo = true;
        try {
            console.log("size video reçue "+req.file.size)
            fileName += '.mp4';
            const videoPath = path.join(__dirname, 'uploads', fileName);
            const compressedVideoPath = path.join(__dirname, 'uploads', `compressed_${fileName}`);
            const thumbnailPath = path.join(__dirname, 'thumbnails', `${fileName}.png`);
            thumbnailName = `${fileName}.png`;

            fs.writeFileSync(videoPath, fs.readFileSync(filePath));

            // Check if the file exists
            if (!fs.existsSync(videoPath)) {
                throw new Error('Video file does not exist');
            }

            // Compress the video using FFmpeg
            await new Promise((resolve, reject) => {
                ffmpeg(videoPath)
                    .output(compressedVideoPath)
                    .videoCodec('libx264')
                    .videoBitrate('1000k')
                    .outputOptions('-crf', '28')
                    .on('end', () => {
                        console.log('Video compression completed.');
                        resolve();
                    })
                    .on('error', (err) => {
                        console.error('FFmpeg compression error:', err);
                        reject(err);
                    })
                    .run();
            });

            // Check if compressed video file was created
            if (!fs.existsSync(compressedVideoPath)) {
                throw new Error('Compressed video file does not exist');
            }

            const stats = await fs.promises.stat(compressedVideoPath);
            const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
            console.log(`Compressed video size: ${fileSizeInMB} MB`);

            // Generate a thumbnail from the video (using FFmpeg)
            await new Promise((resolve, reject) => {
                ffmpeg(videoPath)
                    .screenshots({
                        timestamps: ['00:00:01.000'],
                        filename: thumbnailName,
                        folder: path.join(__dirname, 'thumbnails')
                    })
                    .on('end', () => {
                        console.log('Thumbnail generation completed.');
                        resolve();
                    })
                    .on('error', (err) => {
                        console.error('FFmpeg thumbnail error:', err);
                        reject(err);
                    });
            });

            // Read the thumbnail and upload it to GridFS
            const thumbnailBuffer = fs.readFileSync(thumbnailPath);
            const writeStreamThumbnail = gridfsBucket.openUploadStream(thumbnailName);
            writeStreamThumbnail.end(thumbnailBuffer);

            // Read the compressed video file
            fileBuffer = fs.readFileSync(compressedVideoPath);

            // Delete the temporary video and compressed video files
            await fs.promises.unlink(thumbnailPath);
            await fs.promises.unlink(videoPath);
            await fs.promises.unlink(compressedVideoPath);
        } catch (error) {
            return res.status(500).send(`Video processing error: ${error.message}`);
        }
    } else {
        fileBuffer = fs.readFileSync(filePath);
        fileName += path.extname(req.file.originalname);
    }

    // Upload the processed file (image or video) to GridFS
    const writeStream = gridfsBucket.openUploadStream(fileName);
    writeStream.end(fileBuffer);

    writeStream.on('finish', async () => {
        const newPost = new Post({
            challengeId: req.body.challengeId,
            eventId: req.body.eventId,
            date: new Date(),
            user: req.body.user,
            likes: 0,
            picture: fileName,
            thumbnail: isVideo ? thumbnailName : '',
            description: req.body.description,
            teamId: req.body.teamId,
            isValidated: false,
            universeId: req.body.universeId
        });

        try {
            const savedPost = await newPost.save();

            // Delete the temporary files in the 'uploads' folder
            await unlinkAsync(filePath);
            console.log('Temporary files in uploads folder deleted.');

            res.status(201).send(savedPost);
        } catch (error) {
            res.status(500).send(`Post saving error: ${error.message}`);
        }
    });

    writeStream.on('error', (error) => {
        res.status(500).send('Error uploading file.');
    });
});

// Get posts/publications route
app.get('/posts', async (req, res) => {
    try {
        const { universeId, userId } = req.query;  // Get universeId and userId from query parameters
        
        // Build the query object
        const query = { universeId };

        // If userId is provided, add it to the query
        if (userId) {
            query.user = userId;
        }

        // Fetch posts based on the constructed query
        const posts = await Post.find(query).sort({ date: -1 });

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
// Route to add a comment to a post
app.post('/posts/:id/comment', async (req, res) => {
    const { userId, text } = req.body;
    const postId = req.params.id;

    try {
        // Fetch the post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).send('Post not found');
        }

        // Fetch the user who is commenting
        const user = await User.findById(userId).select('_id name lastName');
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Create the userLabel
        const firstName = user.name || '';
        const lastInitial = user.lastName ? user.lastName.charAt(0).toUpperCase() : '';
        const userLabel = `${firstName} ${lastInitial}`;

        // Add the comment to the post
        const newComment = {
            user: user._id, // Store only user._id
            userLabel: userLabel, // Add userLabel for display purposes
            text: text,
        };
        post.comments.push(newComment);
        await post.save();

        // Send the updated comments in response
        const updatedPost = await Post.findById(postId).select('comments');
        res.status(200).json(updatedPost.comments);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Route to delete a comment from a post
app.delete('/posts/:postId/comments/:commentId', async (req, res) => {
    const { postId, commentId } = req.params;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).send('Post not found');
        }

        // Filter out the comment that needs to be deleted
        post.comments = post.comments.filter((comment) => comment._id.toString() !== commentId);

        await post.save();

        // Send back the updated comments
        const updatedPost = await Post.findById(postId).select('comments');
        res.status(200).json(updatedPost.comments);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Route to get comments for a post
app.get('/posts/:id/comments', async (req, res) => {
    try {
        // Fetch the post and return only the comments
        const post = await Post.findById(req.params.id).select('comments');
        if (!post) {
            return res.status(404).send('Post not found');
        }

        // Format comments to include only the user._id and userLabel
        const formattedComments = post.comments.map(comment => ({
            _id: comment._id,
            user: comment.user, // Only return the user._id
            userLabel: comment.userLabel,
            text: comment.text,
            date: comment.date
        }));

        res.status(200).json(formattedComments);
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

        // Add cache headers to the response
        res.set('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
        res.set('Expires', new Date(Date.now() + 86400 * 1000).toUTCString());

        readStream.pipe(res);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Event routes
app.get('/events', async (req, res) => {
    try {
        const { universeId } = req.query; // Get universe _id from the query parameters

        // Fetch the universe by ID to get the list of event IDs
        const universe = await Universe.findById(universeId);
        if (!universe) {
            return res.status(404).json({ message: 'Universe not found' });
        }

        // Fetch the full event objects using the event IDs stored in universe.events
        // Use $or to query events by either _id or id
        const events = await Event.find({
            $or: [
                { _id: { $in: universe.events } },  // Match by _id
                { id: { $in: universe.events } }    // Match by id (in case of irregularities)
            ]
        });
        res.status(200).json(events);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/getUsersTotalPoints', async (req, res) => {
    try {
        const { universeId } = req.query;  // Universe must be specified

        // Fetch users who are part of the specified universe
        const users = await User.find({ [`universes.${universeId}`]: { $exists: true } });

        // Calculate total points for each user across all events in the specified universe
        const usersWithPoints = users.map(user => {
            const universe = user.universes.get(universeId);  // Get the universe
            if (!universe || !universe.events) {
                return { _id: user._id, name: user.name, lastName: user.lastName, totalPoints: 0 };
            }

            // Sum the points of all events in the universe using Map methods
            let totalPoints = 0;
            universe.events.forEach(event => {
                if (event && event.points) {
                    totalPoints += event.points;
                }
            });

            return {
                _id: user._id,
                name: user.name,
                lastName: user.lastName,
                totalPoints
            };
        });

        // Sort users by total points in descending order
        usersWithPoints.sort((a, b) => b.totalPoints - a.totalPoints);
        res.json(usersWithPoints);
    } catch (error) {
        console.error('Error fetching user rankings:', error);
        res.status(500).json({ error: 'Error fetching user rankings' });
    }
});

  

app.get('/getUsersTotalPoints/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;
        const { universeId } = req.query;

        // Fetch users who are part of the specified universe
        const users = await User.find({ [`universes.${universeId}`]: { $exists: true } });

        // Calculate points for each user for the specific event within the universe
        const usersWithPoints = users.map(user => {
            const universe = user.universes.get(universeId);  // Get the universe
            if (!universe || !universe.events) {
                return { _id: user._id, name: user.name, lastName: user.lastName, totalPoints: 0 };
            }

            const event = universe.events.get(eventId);  // Get the specific event
            const eventPoints = event ? event.points : 0; // Get points for the selected event

            return {
                _id: user._id,
                name: user.name,
                lastName: user.lastName,
                totalPoints: eventPoints
            };
        });

        // Sort users by event points in descending order
        usersWithPoints.sort((a, b) => b.totalPoints - a.totalPoints);
        res.json(usersWithPoints);
    } catch (error) {
        console.error('Error fetching user rankings:', error);
        res.status(500).json({ error: 'Error fetching user rankings' });
    }
});

app.get('/teamRanking/:eventId', async (req, res) => {
    try {
      const { eventId } = req.params;
      const { universeId } = req.query;
  
      // Fetch teams for the event within the specified universe
      const teams = await Team.find({ eventId }).populate('members');
      
      const teamRankings = teams.map(team => {
        // Calculate total points for each team by summing the points of all its members
        const totalPoints = team.members.reduce((acc, member) => {
          const universe = member.universes.get(universeId);
          const event = universe.events.get(eventId);
          const memberPoints = event?.points || 0;  // Get the points for this member in the specific event and universe
          
          return acc + memberPoints;
        }, 0);
        
        return { id: team._id, name: team.name, points: totalPoints };
      }).sort((a, b) => b.points - a.points); // Sort teams by total points in descending order

      res.json(teamRankings);
    } catch (error) {
      console.error('Error fetching ranking:', error);
      res.status(500).json({ message: 'Error fetching ranking' });
    }
});


//route to fetch the data of one user's team
app.get('/userTeam/:eventId', async (req, res) => {
    try {
      const { eventId } = req.params;
      const { userId, universeId } = req.query;

  
      // Fetch the user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Get the universe and event data for the user
      const universe = user.universes?.get(universeId);
      if (!universe || !universe.events) {
        return res.status(404).json({ message: 'Universe or events not found for user' });
      }
  
      // Get the teamId from the event
      const event = universe.events.get(eventId);

      if (!event || !event.teamId) {
        return res.status(404).json({ message: 'Team not found for the selected event' });
      }
  
      const teamId = event.teamId; // Get the teamId
  
      // Fetch the team by teamId
      const team = await Team.findOne({id : teamId});
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
  
      res.json(team); // Return the team object
    } catch (error) {
      console.error('Error fetching team:', error);
      res.status(500).json({ message: 'Error fetching team' });
    }
  });
  
  

//fetch an event by its name
app.get('/events/:id', async (req, res) => {
    try {
        const event = await Event.findOne({ _id: req.params.id });
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
        const { id, eventId, title, reward, isCollective, icon, isAccepted } = req.body;

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
            icon,
            isAccepted
        });

        await newChallenge.save();

        // Update the event's challenges list
        const event = await Event.findOne({ _id: eventId });
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

//route to fetch all users
app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
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
        { _id: eventId },
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
    const { id} = req.params;
    const {universeId} = req.body

    try {
        // Find and delete the team
        const deletedTeam = await Team.findOneAndDelete({ id });

        if (!deletedTeam) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Update the event to remove the deleted team ID
        await Event.updateOne(
            { _id: deletedTeam.eventId },
            { $pull: { teams: id } }
        );

        // Update all users who were in the deleted team
        const users = await User.find({ 
            [`universes.${universeId}.events.${deletedTeam.eventId}.teamId`]: id 
        });

        // Loop through and unset the teamId for each user in the relevant event
        for (const user of users) {
            let universe = user.universes.get(universeId);
            if (universe && universe.events && universe.events.has(deletedTeam.eventId)) {
                const event = universe.events.get(deletedTeam.eventId);
                if (event) {
                    event.teamId = ""; // Clear the teamId
                    universe.events.set(deletedTeam.eventId, event); // Update the event in the user's universe
                }
            }
            await user.save(); // Save the changes to the user
        }

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
        const teamId = req.params.id;

        // Check if teamId is a valid ObjectId
        let query = {};
        if (mongoose.isValidObjectId(teamId)) {
            query._id = teamId;  // If it's a valid ObjectId, search by _id
        } else {
            query.id = teamId;   // Otherwise, search by regular id field
        }

        // Fetch the team and populate the members (users)
        const team = await Team.findOne(query).populate('members');
  
      if (!team) {
        console.log("erreur 404")
        return res.status(404).json({ message: 'Team not found' });
      }
  
      // Get the universeId from the team or from the event (assuming it's known)
      const universeId = req.query.universeId;  // Make sure the universeId is passed in the query
      const eventId = String(team.eventId);     // Ensure eventId is a string
  
      // Map members with relevant details, including points for the event from user.universes
      const members = team.members.map(member => {
        const universe = member.universes?.get(universeId);

        // Ensure the universe and event exist before accessing points
        const eventPoints = universe.events.get(eventId).points || 0;
  
        return {
          _id: member._id,
          teamId: member.teamId,
          name: member.name,
          lastName: member.lastName,
          points: eventPoints,
        };
      }).sort((a, b) => b.points - a.points);  // Sort members by points in descending order
  
      res.json(members);
    } catch (error) {
      console.error('Error fetching team members:', error);
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

  //route to assign an user to a team
  app.post('/assignTeam', async (req, res) => {
    const { userId, teamId, eventId, universeId, previousTeamId } = req.body;
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
                await previousTeam.save();
            }
        }
        // Get the universe map using `get()`
        let universe = user.universes.get(universeId);

        // If the new teamId is empty, remove the team from the user
        if (!teamId) {
            if (universe && universe.events && universe.events.has(eventId)) {
                const event = universe.events.get(eventId);
                if (event) {
                    event.teamId = undefined; // Or use null if preferred
                    universe.events.set(eventId, event);
                }
            }
            await user.save();
            return res.status(200).send('User removed from team successfully');
        }

        // Find team by teamId
        const team = await Team.findOne({ id: teamId });
        if (!team) {
            return res.status(404).send('Team not found');
        }

        // Assign user to team
        // If the universe does not exist, initialize it
        if (!universe) {
            universe = { events: new Map() };
            user.universes.set(universeId, universe);
        }

        // Get the events map for the universe
        let event = universe.events.get(eventId);

        // If the event does not exist, initialize it
        if (!event) {
            event = {};
            universe.events.set(eventId, event);
        }

        // Assign the teamId to the event
        event.teamId = teamId;

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
        const { rewardPoints, eventId, universeId } = req.body;  // Include universeId in the request body
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
                const universe = member.universes.get(universeId);
                if (universe) {
                    const event = universe.events.get(eventId);
                    if (!event) {
                        universe.events.set(eventId, { teamId: post.teamId, points: 0, pinnedChallenges: [] });
                    }

                    // Add or subtract points based on the validation state
                    const currentPoints = universe.events.get(eventId).points || 0;
                    universe.events.get(eventId).points = post.isValidated ? currentPoints + pointsPerMember : currentPoints - pointsPerMember;
                    await member.save();
                }
            }
        } else {
            // For non-collective challenges
            const user = await User.findById(post.user);
            if (user) {
                const universe = user.universes.get(universeId);
                if (universe) {
                    const event = universe.events.get(eventId);
                    if (!event) {
                        universe.events.set(eventId, { points: 0, pinnedChallenges: [] });
                    }

                    // Add or subtract points based on the validation state
                    const currentPoints = universe.events.get(eventId).points || 0;
                    universe.events.get(eventId).points = post.isValidated ? currentPoints + rewardPoints : currentPoints - rewardPoints;
                    await user.save();
                }
            }
        }
        res.status(200).send('Post validation status updated successfully');
    } catch (error) {
        console.error('Error validating post:', error);
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


// Like a post
app.post('/posts/:id/like', async (req, res) => {
    const postId = req.params.id;
    const userId = req.body.userId; // Pass user ID in the request body

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).send('Post not found');
        }

        // Check if the user already liked the post
        if (post.likedBy.includes(userId)) {
            return res.status(400).send('User already liked this post');
        }

        // Increment likes and add the user to likedBy
        post.likes += 1;
        post.likedBy.push(userId);
        await post.save();

        res.status(200).json({ likes: post.likes, likedBy: post.likedBy });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Unlike a post
app.post('/posts/:id/unlike', async (req, res) => {
    const postId = req.params.id;
    const userId = req.body.userId;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).send('Post not found');
        }

        // Check if the user has liked the post
        if (!post.likedBy.includes(userId)) {
            return res.status(400).send('User has not liked this post');
        }

        // Decrement likes and remove the user from likedBy
        post.likes -= 1;
        post.likedBy = post.likedBy.filter((id) => id.toString() !== userId);
        await post.save();

        res.status(200).json({ likes: post.likes, likedBy: post.likedBy });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Get universes route
app.get('/universes', async (req, res) => {
    try {
        // Fetch all universes from the database
        const universes = await Universe.find({});  // Fetch all universes
        res.status(200).json(universes);  // Send the universes in the response
    } catch (error) {
        res.status(500).send(error.message);  // Send error message if something goes wrong
    }
});

app.get('/universe/:id', async (req, res) => {
    try {
      const universe = await Universe.findById(req.params.id);
      if (!universe) {
        return res.status(404).json({ message: 'Universe not found' });
      }
      res.status(200).json(universe);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching universe details', error });
    }
  });
  

// Get a single universe by its ID
app.get('/universes/:universeId', async (req, res) => {
    try {
        const universeId = req.params.universeId;  // Get universeId from URL params
        const universe = await Universe.findById(universeId);  // Find the universe by ID

        if (!universe) {
            return res.status(404).send('Universe not found');
        }

        res.status(200).json(universe);  // Send the universe data in the response
    } catch (error) {
        res.status(500).send(error.message);  // Send error message if something goes wrong
    }
});

// Join universe route
app.post('/users/join-universe', async (req, res) => {
    const { userId, universeId } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Check if the user has already joined the universe in `joinedUniverses`
        if (!user.joinedUniverses.includes(universeId)) {
            // Add universeId to `joinedUniverses` if not already present
            user.joinedUniverses.push(universeId);
        }

        // Initialize `user.universes[universeId]` if it doesn't exist
        let universe = user.universes.get(universeId);
        if (!universe) {
            universe = {
                events: new Map()
            };
            user.universes.set(universeId, universe);
        }

        // Save the updated user document
        await user.save();
        res.status(200).send('Successfully joined the universe and initialized universe data');
    } catch (error) {
        res.status(500).send(error.message);  // Send error message if something goes wrong
    }
});

// Initialize universe and event data for the user
app.post('/users/initialize-universe', async (req, res) => {
    const { userId, universeId, eventId } = req.body;
    try {
        const user = await User.findById(userId);

        // Check if the universe exists in user.universes Map
        let universe = user.universes.get(universeId);

        if (!universe) {
            // If universe doesn't exist, initialize it with the event
            universe = {
                events: new Map([
                    [eventId, {
                        teamId : "",
                        points: 0,
                        pinnedChallenges: []
                    }]
                ])
            };
            user.universes.set(universeId, universe);
        } else if (!universe.events.get(eventId)) {
            // If the universe exists but the event doesn't, initialize the event
            universe.events.set(eventId, {
                teamId : "",
                points: 0,
                pinnedChallenges: []
            });
            user.universes.set(universeId, universe); // Update the universe with the new event
        }

        // Save the updated user data
        await user.save();
        res.status(200).send('Universe and event initialized for the user.');
    } catch (error) {
        console.error('Error initializing universe or event:', error);
        res.status(500).send(error.message);
    }
});

// PUT /events/:id
app.put('/events/:id', async (req, res) => {
    const { title, date } = req.body;
    const { id } = req.params;
  
    try {
      const event = await Event.findOneAndUpdate(
        { _id: id }, // Ensure the event belongs to the universe
        { title, date },
        { new: true }
      );
  
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
  
      res.status(200).json({ message: 'Event updated successfully', event });
    } catch (error) {
      res.status(500).json({ message: 'Error updating event', error });
    }
  });
  

// Event creation route
app.post('/events/create', upload.single('file'), async (req, res) => {
  try {
    // Destructure fields from the form data
    const { title, date, universeId } = req.body;

    // Check if the required fields are provided
    if (!title || !req.file || !universeId) {
      return res.status(400).json({ message: 'Title, image, and universeId are required.' });
    }

    // Read the file as a Base64 string
    const base64Image = fs.readFileSync(req.file.path, { encoding: 'base64' });
    const mimeType = req.file.mimetype;  // Capture the MIME type (e.g., image/jpeg, image/png)

    // Generate a unique ID for the event
    const newEventId = new mongoose.Types.ObjectId();
    // Save the event in the database
    const newEvent = new Event({
    _id: newEventId,
      id: newEventId,
      title: title,
      image: `data:${mimeType};base64,${base64Image}`,  // Store Base64 image string
      date: date || '',  // Optional date field
      challenges: '',
      teams: [],
    });

    await newEvent.save();  // Save the event to the events collection

    // Update the universe to include the newly created event
    const universe = await Universe.findById(universeId);
    if (!universe) {
      return res.status(404).json({ message: 'Universe not found.' });
    }

    universe.events.push(newEventId);  // Add the new event ID to the universe's events array
    await universe.save();  // Save the updated universe

    // Delete the temporary file (optional, since you're saving it as Base64)
    fs.unlinkSync(req.file.path);

    // Respond with the created event
    res.status(201).json(newEvent);

  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Error creating event.' });
  }
});

// Universe update route (password and logo)
app.post('/universe/update', upload.single('file'), async (req, res) => {
    const { universeId, password, styles } = req.body;
    try {
      const universe = await Universe.findById(universeId);
  
      if (!universe) {
        return res.status(404).json({ message: 'Universe not found.' });
      }
  
      // Hash the password if it's provided
      if (password) {
        if (password == "EMPTY_PASSWORD") {
            universe.hashedPassword = ""
        } else {
            const hashedPassword = bcrypt.hashSync(password, 10);
            universe.hashedPassword = hashedPassword;  // Update the password
        }
      }
  
      // Convert the uploaded logo file to Base64 if provided
      if (req.file) {
        const logoPath = req.file.path;  // File path for the uploaded logo
        const mimeType = req.file.mimetype;  // Capture the MIME type (e.g., image/jpeg, image/png)
  
        // Read the file as a Base64 string
        const base64Logo = fs.readFileSync(logoPath, { encoding: 'base64' });
        universe.logo = `data:${mimeType};base64,${base64Logo}`;  // Save the Base64 encoded logo
  
        // Remove the temporary file after reading it
        fs.unlinkSync(logoPath);
      }
      // Update the custom styles
    if (styles) {
    universe.styles = JSON.parse(styles);
    }
  
      await universe.save();  // Save the updated universe
  
      res.status(200).json({ message: 'Universe updated successfully.',universe });
    } catch (error) {
      console.error('Error updating universe:', error);
      res.status(500).json({ message: 'Error updating universe.' });
    }
  });


app.get("/", (req,res) =>{
    res.send("Hello from Backend Server !");
});
