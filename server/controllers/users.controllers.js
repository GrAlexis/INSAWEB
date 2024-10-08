const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require("../models/user");


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
    const { name, password, isAdmin, classYear, lastName, email } = req.body; // Include isAdmin in request body
    const userAlreadyExist = await User.findOne({ email });
    if (userAlreadyExist) {
      return res.status(401).json({ message: 'User already exists' });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({name: name, hashedPassword,
      isAdmin: isAdmin, classYear:classYear, email,
      balance:0, lastName }); // Include isAdmin in user creation
      res.status(201).json({ message: 'User created successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'User does not exist' });
    }
    const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
    if (passwordMatch) {
      const token = jwt.sign({ email:email }, 'your_secret_key');
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
    const secretKey = 'your_secret_key'
    const decoded = jwt.verify(token, secretKey);
    res.status(200).json({'username':decoded.username});
  } catch (error) {
    res.status(500).json('Token decoding failed');

  }
  
};

const getUser = async (req, res) => {
    try{
      const userId = req.params.userId
      let user
      if (!userId){
        res.status(500).json('Missing url parameter userId')
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

const isAdmin = async (req, res) => {
  try{
    const userId = req.params.email
    userId.includes('@')
      const email = userId
      user  = await User.findOne({email: email})
      //console.log('email',user)

    if (!user ) {
      return res.status(401).json({ message: 'User does not exist' });
    }
    else{
      res.status(200).json(user.isAdmin)
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
  isAdmin
};

