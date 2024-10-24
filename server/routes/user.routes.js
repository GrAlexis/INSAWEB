const express = require("express");
const router_user = express.Router();
const Product = require("../models/user");
const {  registerUser, registerUserGlobal,deleteUser, loginUser, getAllUsers, updateMdp,
     decodeToken, updateUser, getUser, isAdmin, verifyAccount, createResetMdpLink,
     loginUserGoogle} = require("../controllers/users.controllers")


router_user.delete("/delete", deleteUser)
router_user.post("/registerAdminUser", registerUser)
router_user.post("/registerGlobal",registerUserGlobal)
router_user.post("/login",loginUser);
router_user.post("/isAdmin", isAdmin)
router_user.post("/updateMdp", updateMdp)
router_user.post("/forgot-password", createResetMdpLink)
router_user.post('/loginGoogle', loginUserGoogle)

router_user.get("/all", getAllUsers);
router_user.get("/:userId", getUser)
router_user.get("/verify-account/:token", verifyAccount)

router_user.post("/update", updateUser);
router_user.post("/decode",decodeToken);



module.exports = router_user;
