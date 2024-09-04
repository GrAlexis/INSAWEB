const express = require("express");
const router_user = express.Router();
const Product = require("../models/user");
const {  registerUser, deleteUser, loginUser, getAllUsers, decodeToken, updateUser, getUser, isAdmin} = require("../controllers/users.controllers")


router_user.delete("/delete", deleteUser)
router_user.post("/register", registerUser)
router_user.post("/login",loginUser);
router_user.get('/isAdmin/:email', isAdmin)

router_user.get("/all", getAllUsers);
router_user.get("/:userId", getUser)

router_user.post("/update", updateUser);
router_user.post("/decode",decodeToken);



module.exports = router_user;