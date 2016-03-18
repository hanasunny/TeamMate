var app = angular.module('TeamMate', ['ui.router']);

app.controller('MainCtrl', [
'$scope',
'teams',
function($scope, teams){

}]);

app.controller('TeamsCtrl', [
'$scope',
'teams',
function($scope, teams){
	$scope.teams = teams.teams;

	$scope.addTeam = function() {
		if(!$scope.title || $scope.title === '') { return; }
		teams.create({
			title: $scope.title
		})
		$scope.title = '';
	}
	$scope.removeTeam = function(team) {
		teams.remove(team).success(function() {
			var index = -1
			for(var i = 0, len = $scope.teams.length; i < len; i++) {
				if($scope.teams[i]._id === team._id) {
					index = i;
					break;
				}
			}
			if(index > -1) {
				$scope.teams.splice(index, 1)
			}
		})
	}
}]);

app.controller('TeamCtrl', [
	'$scope',
	'teams',
	'team',
	function($scope, teams, team) {
		$scope.team = team;
		$scope.addMember = function() {
			if($scope.body === '') { return; }
			teams.addMember(team._id, {
				name: $scope.name
			}).success(function(member) {
				$scope.team.members.push(member)
			})
			$scope.name = '';
		}
		$scope.removeMember = function(id) {
			teams.removeMember(team._id, {
				id: id
			}).success(function(member) {
				var index = -1
				for(var i = 0, len = $scope.team.members.length; i < len; i++) {
					if($scope.team.members[i]._id === member._id) {
						index = i;
						break;
					}
				}
				if(index > -1) {
					$scope.team.members.splice(index, 1)
				}
			})
		}
	}
])

app.factory('teams', ['$http', function($http) {
	var o = {
		teams: []
	};
	o.getAll = function() {
		return $http.get('/teams').success(function(data) {
			angular.copy(data, o.teams)
		})
	}
	o.create = function(team) {
		return $http.post('/teams', team).success(function(data) {
			o.teams.push(data)
		})
	}
	o.remove = function(team) {
		return $http.post('/teams/' + team._id + '/remove', team)
	}
	o.get = function(id) {
		return $http.get('/teams/' + id).then(function(res) {
			return res.data
		});
	}
	o.addMember = function(id, member) {
		return $http.post('/teams/' + id + '/members', member)
	}
	o.removeMember = function(id, member) {
		return $http.post('/teams/' + id + '/members/remove', member)
	}
	return o;
}])

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'MainCtrl'
    })
	.state('teams', {
	  url: '/teams',
	  templateUrl: '/teams.html',
	  controller: 'TeamsCtrl',
		resolve: {
			postPromise: ['teams', function(teams) {
				return teams.getAll();
			}]
		}
	})
	.state('team', {
		url: '/team/{id}',
		templateUrl: '/team.html',
		controller: 'TeamCtrl',
		resolve: {
			team: ['$stateParams', 'teams', function ($stateParams, teams) {
				return teams.get($stateParams.id);
			}]
		}
	});

  $urlRouterProvider.otherwise('home');
}]);