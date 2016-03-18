var express = require('express');
var router = express.Router();
var mongoose = require('mongoose')
var Team = mongoose.model('Team')
var Member = mongoose.model('Member')

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
  res.render('index', { title: 'Express' });
});

router.get('/teams', function(req, res, next) {
    Team.find(function(err, teams) {
        if (err) { return next(err); }

        res.json(teams)
    })
})

router.post('/teams', function(req, res, next) {
    var team = new Team(req.body);

    team.save(function(err, team) {
        if(err) { return next(err); }

        res.json(team)
    })
})

router.get('/teams/:team', function(req, res) {
    req.team.populate('members', function(err, team) {
        if(err) { return next(err)}

        res.json(team)
    })
})

router.post('/teams/:team/remove', function(req, res, next) {
    var t = Team.findById(req.body.id, function(err, team) {
        if(err) return next(err);

        req.team.remove()
        req.team.save()
    })
    res.json(req.team)
})

router.get('/teams/:team/members', function(req, res, next) {
    res.json(req.team.members)
})

router.post('/teams/:team/members', function(req, res, next) {
    var member = new Member(req.body);

    member.save(function(err, member) {
        if(err){ return next(err); }

        req.team.members.push(member)
        req.team.save(function(e, team) {
            if(e) { return next(e); }

            res.json(member)
        })

    })
})

router.post('/teams/:team/members/remove', function(req, res, next) {
    var mem = Member.findById(req.body.id, function(err, member) {
        if(err) throw err;

        req.team.members.remove(member)
        req.team.save(function(e, team) {
            if(e) return next(e);

            res.json(member)
        })
    })

})



module.exports = router;
