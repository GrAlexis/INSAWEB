const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require("../models/user");
const {clientId,
  clientSecret,
  refreshToken,
  refreshAccessToken,
  createMessage,
  sendEmail} = require('../gmail')

const secretKey = 'cléTC2024*SheeshDev'

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
    // Vérifiez si le token est présent dans l'en-tête de la requête
    
    const { name, password, isAdmin, classYear, lastName, email } = req.body;
    const userAlreadyExist = await User.findOne({ email });

    if (userAlreadyExist) {
      return res.status(401).json({ message: 'User already exists' });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        password: hashedPassword,
        isAdmin,
        classYear,
        email,
        balance: 0,
        lastName,
      });

      res.status(201).json({ message: 'User created successfully' });
    }
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: error.message });
  }
};

const registerUserGlobal = async (req, res) => {
  try {
    
    const { name, password, classYear, lastName, email } = req.body;

    // Vérifiez si isAdmin est à true et renvoyez une erreur
    if (isAdmin === true) {
      return res.status(400).json({ message: 'isAdmin must be false or not included' });
    }

    const userAlreadyExist = await User.findOne({ email });
    if (userAlreadyExist) {
      return res.status(401).json({ message: 'User already exists' });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const token = jwt.sign({email:email}, secretKey, {expiresIn:'15m'})
      const access_token = await refreshAccessToken(clientId, clientSecret, refreshToken)
      if (access_token) {
        // Call the sendEmail function with the access token
        await sendEmail(access_token, email, '[Sheeesh] Code de vérification de votre compte',`Bonjour,\nSi vous recevez ce mail c\'est que vous vous êtes inscrits sur notre application Sheeesh.\nIl vous reste plus qu\'une étape avant que vous puissiez commencer à sheeesher.\nIl faut que vous cliquiez sur ce lien: http://localhost:5000/api/user/verify-account/${token} pour activer votre compte.(Promis c\'est pas du phishing)\n\nL\'équipe de devloppeurs de Sheeesh ;-)`);
      } else {
          console.error("Could not retrieve access token, email not sent.");
      }
      const user = await User.create({
        name,
        hashedPassword, // Assurez-vous d'utiliser le bon champ ici
        isAdmin : false,
	      classYear,
        email,
        balance: 0,
        lastName
      }); // isAdmin est géré par le modèle, donc pas besoin de l'inclure ici
      res.status(201).json({ message: 'User created successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMdp = async (req,res) => {
  try{
    const {token, newMdp} = req.body
    const decoded = jwt.verify(token, secretKey)
    const newHashedPassword = await bcrypt.hash(newMdp, 10)
    if (decoded){
      const updatedUser = await User.findOneAndUpdate(
        { email: decoded.email },                  // Condition: trouver l'utilisateur par son nom d'utilisateur
        { hashedPassword:newHashedPassword },          // Champ à mettre à jour
        { new: true, runValidators: true }       // Options: retourner le document mis à jour et valider les schémas
      );
      if (updatedUser){
        return res.status(202).json('Successfully updated password')
      }
      else{
        console.error('User not found')
        return res.status(404).json('User not found')
      }
    }
    else{
      return res.status(401).json('Wrong token')
    }
  }
  catch (error){
    console.log(error)
    return res.status(500).json('Erreur de bz')
  }
}

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
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
      res.status(200).json({ token });
    } else {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const decodeToken = (req,res) => {
  try {
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
    return res.redirect('http://localhost:3000/home')
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
  registerUserGlobal
};

