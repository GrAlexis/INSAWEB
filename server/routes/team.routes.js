const express = require("express");
const router_team = express.Router();
const Team = require("../models/team");
const {createTeam,updateTeam,deleteTeam,getAll,getTeam,assignTeam,getAllMembers} = require("../controllers/team.controller")


router_team.post("/", createTeam);
router_team.put("/:id",updateTeam);

router_team.delete("/:id", deleteTeam);

router_team.get("/ids", getAll);
router_team.delete("/:id/members",getAllMembers);
router_team.get('/:id', getTeam)
router_team.post('/assignTeam', assignTeam)



module.exports = router_team;