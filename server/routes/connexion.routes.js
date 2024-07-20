const express = require("express");
const router_connexion = express.Router();
const {login, validate} = require("../controllers/connexion.controllers")


router.get("/", login);

router.get("/validate", validate);



module.exports = router_connexion;