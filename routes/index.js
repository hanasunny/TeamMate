var express = require('express');
var router = express.Router();
var mongoose = require('mongoose')
var Team = mongoose.model('Team')
var Member = mongoose.model('Member')
var User = mongoose.model('User');
var passport = require('passport');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

router.param('team', function(req, res, next, id) {
    var query = Team.findById(id)

    query.exec(function(err, team) {
        if(err) { return next(err); }
        if(!team) { return next(new Error('can\'t find team')); }

        req.team = team;
        return next();
    })
})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/teams', auth, function(req, res, next) {
    var ownedTeams = [];
    var memberTeams = [];

    //Find member for current user
    Member.findOne({ 'name': req.payload.username }, function(error, member) {
    	if(error) return next(error);
    		//Find teams where current user is the creator
				Team.find( { 'creator': req.payload.username }, function(e, ownedteams) {
		        if (e) { return next(e); }

		        ownedTeams = ownedteams;
		        if(member === null) { res.json({ownedTeams, memberTeams}); return;}
		        //Find teams where current user is a member
				    Team.find({ "_id": { $in: member.teams } }, function(err, memberteams) {
		    			if(err) return next(err);
		    			memberTeams = memberteams
		    			res.json({ownedTeams, memberTeams})
		    		})
		    })
    })
})

router.post('/teams', auth, function(req, res, next) {
    var team = new Team(req.body);
    team.creator = req.payload.username;

    team.save(function(err, team) {
        if(err) { return next(err); }

        res.json(team)
    })
})

router.get('/teams/:team', auth, function(req, res) {
    req.team.populate('members', function(err, team) {
        if(err) { return next(err)}

        res.json(team)
    })
})

router.post('/teams/:team/remove', auth, function(req, res, next) {
    Team.findById(req.body.id, function(err, team) {
        if(err) return next(err);

        req.team.remove()
        req.team.save()
        //Find all members in team being deleted and remove team id from members.teams
        Member.find({ "_id": {  $in: req.team.members } }, function(err, members) {
        	for(var i = 0; i < members.length; i++) {
        		var index = members[i].teams.indexOf(req.team.id)
        		members[i].teams.splice(index, 1)
        		members[i].save()
        	}
        })
    })
    res.json(req.team)
})

router.get('/teams/:team/members', auth, function(req, res, next) {
    res.json(req.team.members)
})

router.post('/teams/:team/members', auth, function(req, res, next) {
		if(req.team.creator === req.body.name) { 
			res.status(400).send('You cannot add the owner of the project as a user!');
			return;
		}
    var newMem = new Member(req.body);

    //Does member already exist?
    Member.findOne({ 'name': req.body.name }, function(err, member) {
    	if(member === null) {
    		//If no, is member valid user?
    		User.findOne({ 'username': req.body.name }, function(e, user) {
    			if(user === null) {
    				res.status(400).send('That is not a valid user!')
    				return;
    			}
    			else {
    				//If yes, create new member & push to arrays!
		    		newMem.teams.push(req.team.id)
				    newMem.save(function(err, mem) {
				        if(err){ return next(err); }

				        req.team.members.push(mem)
				        req.team.save(function(e, team) {
				            if(e) { return next(e); }
				            res.json(mem);
				        })
				  	})
    			}
    		})
    	}
    	else {
    		//If yes, add team to teams array and to members.teams array
    		req.team.members.push(member)
    		req.team.save()
    		member.teams.push(req.team.id)
    		member.save()
    		res.json(member)
    	}
    })
})

router.post('/teams/:team/members/remove', auth, function(req, res, next) {
    var mem = Member.findById(req.body.id, function(err, member) {
        if(err) throw err;

        req.team.members.remove(member)
        req.team.save(function(e, team) {
            if(e) return next(e);
        })
        member.teams.remove(req.team.id)
        member.save()

        res.json(member)
    })
})

router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  var user = new User();

  user.username = req.body.username;

  user.setPassword(req.body.password)

  user.save(function (err){
    if(err){ return next(err); }

    return res.json({token: user.generateJWT()})
  });
});

router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

module.exports = router;
