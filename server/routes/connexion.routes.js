const express = require("express");
const router_connexion = express.Router();
const {login, validate} = require("../controllers/connexion.controllers")


router_connexion.get("/", login);

router_connexion.get("/validate", validate);



module.exports = router_connexion;