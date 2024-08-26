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
    const users = await User.find({}, 'username isAdmin'); 
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const registerUser = async (req, res) => {
  try {
    const { username, password, isAdmin } = req.body; // Include isAdmin in request body
    const userAlreadyExist = await User.findOne({ username });
    if (userAlreadyExist) {
      return res.status(401).json({ message: 'User already exists' });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ username, password: hashedPassword, isAdmin: isAdmin }); // Include isAdmin in user creation
      res.status(201).json({ message: 'User created successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'User does not exist' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      const token = jwt.sign({ username: user.username }, 'your_secret_key');
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
    const { token, secretKey } = req.body;
    const decoded = jwt.verify(token, secretKey);
    res.status(200).json(decoded.username);
  } catch (error) {
    throw new Error('Token decoding failed');
  }
  
};



module.exports = {
  registerUser,
  deleteUser,
  loginUser,
  getAllUsers,
  decodeToken,
  updateUser
};