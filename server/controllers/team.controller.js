const Team = require("../models/team");


const createTeam = async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).send('Post not found');
        }
        res.status(200).send('Post deleted');
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const updateTeam = async (req, res) => {
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
};

const deleteTeam = async (req, res) => {
    const { id } = req.params;

    try {
        // Find and delete the team
        const deletedTeam = await Team.findOneAndDelete({ id });

        if (!deletedTeam) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Update the event to remove the deleted team ID
        await Event.updateOne(
            { id: deletedTeam.eventId },
            { $pull: { teams: id } }
        );

        // Clear the teamId for all users who were in the deleted team
        await User.updateMany(
            { teamId: id },
            { $unset: { teamId: "" } } // Clears the teamId field
        );

        // Clear the teamId for all posts associated with the deleted team
        await Post.updateMany(
            { teamId: id },
            { $unset: { teamId: "" } } // Clears the teamId field
        );

        res.status(200).json({ message: 'Team deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting team', error });
    }
};

const getAll =  async (req, res) => {
    try {
      const teams = await Team.find({}, { id: 1, _id: 0 });
      res.status(200).json(teams);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching team IDs', error });
    }
  }

const getAllMembers  =  async (req, res) => {
    try {
      const team = await Team.findOne({ id: req.params.id }).populate('members');
  
      const members = team.members.map(member => ({
        _id: member._id,
        teamId: member.teamId,
        name: member.name,
        points: member.eventPoints.get(team.eventId) || 0,
      })).sort((a, b) => b.points - a.points);
  
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching team members' });
    }
}

const getTeam = async (req, res) => {
    try {
      const team = await Team.findOne({ id: req.params.id });
      if (!team) {
        return res.status(404).send('Team not found');
      }
      res.status(200).json(team);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

const assignTeam = async (req, res) => {
    const { userId, teamId, eventId, previousTeamId } = req.body;

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
                console.log("previousTeam.members "+previousTeam.members)
                await previousTeam.save();
            }
        }

        // If the new teamId is empty, simply remove the teamId from the user
        if (!teamId) {
            user.teamId = '';
            await user.save();
            return res.status(200).send('User removed from team successfully');
        }

        // Find team by teamId
        const team = await Team.findOne({ id: teamId });
        if (!team) {
            return res.status(404).send('Team not found');
        }

        // Assign user to team
        user.teamId = teamId;
        if (!user.eventPoints.has(eventId)) {
            user.eventPoints.set(eventId, 0); // Initialize points for the event
        }
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
}


module.exports = {
    assignTeam,
    createTeam,
    deleteTeam,
    getTeam,
    getAllMembers,
    getAll,
    updateTeam  
}