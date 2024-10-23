const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require("../models/user");
const { refreshAccessToken,  sendEmail} = require('../gmail')
const secrets = require('../secrets_API.json')
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('870362726807-4dcvr8vvcq0lkvnrkhh89sgr3plbtuib.apps.googleusercontent.com');



const deleteUser = async (req, res) => {
  try {
    const { username } = req.body;
    const deletedUser = await User.findOneAndDelete({ username: username });
    if (deletedUser) {
      res.status(200).json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { username, newField } = req.body;
    const updatedUser = await User.findOneAndUpdate(
      { username: username },
      { $set: newField },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'name isAdmin'); 
    users.forEach(obj => {delete obj._id})
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const registerUser = async (req, res) => {
  try {
    const { name, password, classYear, lastName, email } = req.body;
    const secretKey = process.env.DEV_SECRET
    // Vérification si l'utilisateur existe déjà
    const userAlreadyExist = await User.findOne({ email });
    if (userAlreadyExist) {
      return res.status(401).json({ message: 'User already exists' });
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création de l'utilisateur
    const user = await User.create({
      name,
      hashedPassword,
      isAdmin: true,
      classYear,
      email,
      balance: 0,
      lastName,
    });

    // Vérifie si l'utilisateur a été créé avec succès
    if (!user) {
      return res.status(500).json({ message: 'Failed to create user' });
    }

    // Retourner une réponse de succès
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    // Gestion des erreurs
    console.error('Error in registerUser:', error);
    res.status(500).json({ message: error.message });
  }
};
const registerUserGlobal = async (req, res) => {
  try {
    const { name, password, classYear, lastName, email, isAdmin } = req.body;
    const secretKey = process.env.DEV_SECRET;

    // Vérifie si isAdmin est à true
    if (isAdmin === true) {
      return res.status(400).json({ message: 'isAdmin must be false or not included' });
    }

    const userAlreadyExist = await User.findOne({ email });
    if (userAlreadyExist) {
      return res.status(401).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const token = jwt.sign({ email: email }, secretKey, { expiresIn: '15m' });
    const access_token = await refreshAccessToken(secrets['web']['client_id'], secrets['web']['client_secret'], secrets['web']['refresh_token'])
    if (access_token) {
      try {
        await sendEmail(
          access_token,
          email,
          '[Sheeesh] Code de vérification de votre compte',
          `Bonjour,\nSi vous recevez ce mail c\'est que vous vous êtes inscrits sur notre application Sheeesh.\nIl vous reste plus qu\'une étape avant que vous puissiez commencer à sheeesher.\nIl faut que vous cliquiez sur ce lien: ${process.env.DEV_BACK_URL}/api/user/verify-account/${token} pour activer votre compte.(Promis c\'est pas du phishing)\n\nL\'équipe de developpeurs de Sheeesh ;-)`
        );
      } catch (emailError) {
        console.error("Email not sent:", emailError);
        return res.status(500).json({ message: "Failed to send verification email." });
      }
    } else {
      console.error("Could not retrieve access token, email not sent.");
      return res.status(500).json({ message: "Could not send verification email." });
    }

    const user = await User.create({
      name,
      hashedPassword,
      isAdmin: false,
      classYear,
      email,
      balance: 0,
      lastName,
      universes: {
        "64f3c9a9ef437ef982acb1e3": {}
      }
    });

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateMdp = async (req,res) => {
  try{
    const URL = process.env.DEV_FRONT_URL;
    const secretKey = process.env.DEV_SECRET;
    const {token, newMdp} = req.body;
    const decoded = jwt.verify(token, secretKey);
    const newHashedPassword = await bcrypt.hash(newMdp, 10);;
    if (decoded){
      const updatedUser = await User.findOneAndUpdate(
        { email: decoded.email },                  // Condition: trouver l'utilisateur par son nom d'utilisateur
        { hashedPassword:newHashedPassword },          // Champ à mettre à jour
        { new: true, runValidators: true }       // Options: retourner le document mis à jour et valider les schémas
      );
      if (updatedUser){
        return res.status(201).json("Pswd updated OK");
        

      }
      else{
        console.error('User not found')
        return res.status(404).json('User not found');
      }
    }
    else{
      return res.status(401).json('Wrong token');
    }
  }
  catch (error){
    console.log(error)
    return res.status(500).json('Erreur de bz');
  }
}

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const secretKey = process.env.DEV_SECRET
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'User does not exist' });
    }
    if (!user.active){
      return res.status(402).json({message: 'Account not yet activated'})
    }
    const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
    if (passwordMatch) {
      const token = jwt.sign({ email:email }, secretKey);

       // Check if the user has joined any universes
       const hasJoinedUniverses = user.joinedUniverses && user.joinedUniverses.length > 0;
       console.log("hasjoineduniverse "+hasJoinedUniverses)

      res.status(200).json({ 
        token,
        redirectToUniverseSelection: !hasJoinedUniverses // If no joined universes, frontend will redirect to selection page
      });
    } else {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUserGoogle = async (req, res) => {
  try {
    const tokenGoogle  = req.body.token
    const ticket = await client.verifyIdToken({
      idToken:tokenGoogle,
      audience: "870362726807-4dcvr8vvcq0lkvnrkhh89sgr3plbtuib.apps.googleusercontent.com", // Make sure this matches your client ID
    });
    const payload = ticket.getPayload();

    // Extract user information from the payload
    const userId = payload['sub']; // The unique Google user ID
    const email = payload['email'];
    const name = payload['name'];
    const picture = payload['picture'];

    // Continue with your application logic
    //console.log(email)
    const userAlreadyExist = await User.findOne({ email });
    if (!userAlreadyExist) {
      return res.status(401).json({ message: 'User doesn\'t exists' });
    }
    const secretKey = process.env.DEV_SECRET
    const token = jwt.sign({ email:email }, secretKey);
    return res.status(200).json({ token, 'email':email});
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw new Error('Invalid ID token');
  }
}

const decodeToken = (req,res) => {
  try {
    const secretKey = process.env.DEV_SECRET
    const { token } = req.body;
    const decoded = jwt.verify(token, secretKey);
    return res.status(200).json({'email':decoded.email});
  } catch (error) {
    return res.status(500).json('Token decoding failed');
  }
  
};

const isAdmin = async (req, res) => {
  try{
    const email = req.body.email
    if (!email){
      return res.status(500).json('Missing email')
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'User does not exist' });
    }
    return res.status(200).json(user.isAdmin)
  }
  catch (error){
    console.log(error)
    res.status(500).json(error)
  }
}


const verifyAccount = async (req, res) => {
  const secretKey = process.env.DEV_SECRET
  const token = req.params.token
  if (!token){
    res.status(500).json({'message':'Missing url parameter token'})
  }
  try{
    const decoded = jwt.verify(token, secretKey)
    const updatedUser = await User.findOneAndUpdate(
      { email: decoded.email },                  // Condition: trouver l'utilisateur par son nom d'utilisateur
      { active:true },          // Champ à mettre à jour
      { new: true, runValidators: true }       // Options: retourner le document mis à jour et valider les schémas
    );
    return res.redirect(`${process.env.DEV_FRONT_URL}/home`)
  }
  catch (err){
    res.status(401).json({'message':"token invalide ou expiré"})
  }
}


const getUser = async (req, res) => {
    try{
      const userId = req.params.userId
      let user
      if (!userId){
        res.status(500).json({'message':'Missing url parameter userId'})
      }
      if (userId.includes('@')){
        const email = userId
        user  = await User.findOne({email: email})
        //console.log('email',user)
      }
      else{
        user = await User.findById({_id: userId });
       // console.log('USerId', user)
      }
      if (!user ) {
        return res.status(401).json({ message: 'User does not exist' });
      }
      else{
        res.status(200).json(user)
      }
    }
    catch (error){
      //console.log(error)
      res.status(500).json(error)
    }
}

const createResetMdpLink = async (req, res) => {
  const secretKey = process.env.DEV_SECRET
  const email = req.body.email
  const user = await User.findOne({email:email})
  if (!user){
    return res.status(404).json({"message":"User not found"})
  }
  const token = jwt.sign({email:email}, secretKey, {expiresIn:'15m'})
  const access_token = await refreshAccessToken(secrets['web']['client_id'], secrets['web']['client_secret'], secrets['web']['refresh_token'])
  if (access_token) {
    // Call the sendEmail function with the access token
    try{    
      await sendEmail(access_token, email, '[Sheeesh] Lien pour recreer votre mot de passe',`Bonjour,\nSi vous recevez ce mail c\'est que vous vous avez cliqué sur mot de passe oublié.\nCliquez sur ce lien: ${process.env.DEV_FRONT_URL}/reset-password/${token} pour changer votre mot de passe.(Promis c\'est pas du phishing)\n\nL\'équipe de developpeurs de Sheeesh ;-)`);
      return res.status(200).json({'message':"Email for resetting password sent"})
    }
    catch {
      return res.status(500).json({"message":"Email not sent but we don't know why"})
    }
  } else {
      console.error("Could not retrieve access token, email not sent.");
      return res.status(500).json({'message':"Could not send the reset password email because of unknown causes"})
  }
}

module.exports = {
  registerUser,
  deleteUser,
  loginUser,
  getAllUsers,
  decodeToken,
  updateUser,
  getUser,
  isAdmin,
  verifyAccount,
  updateMdp,
  loginUserGoogle,
  createResetMdpLink,
  registerUserGlobal
};

