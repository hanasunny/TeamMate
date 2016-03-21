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
			for(var i = 0; $scope.teams['ownedTeams'].length; i++) {
				if($scope.teams['ownedTeams'][i]._id === team._id) {
					index = i;
					break;
				}
			}
			if(index > -1) {
				$scope.teams['ownedTeams'].splice(index, 1)
			}
		})
	}
}]);

app.controller('TeamCtrl', [
	'$scope',
	'teams',
	'team',
	function($scope, teams, team) {
		var noMemberExists = 1;
		$scope.team = team;
		$scope.addMember = function() {
			if($scope.body === '') { return; }
			for(var i = 0; i < $scope.team.members.length; i++) {
				if($scope.team.members[i].name == $scope.name) {
					noMemberExists = 0;
				}
			}
			if(noMemberExists) {
				teams.addMember(team._id, {
					name: $scope.name
				}).success(function(member) {
					$scope.team.members.push(member)
				})
			}
			$scope.name = '';
			noMemberExists = 1;
		}
		$scope.removeMember = function(id) {
			teams.removeMember(team._id, {
				id: id
			}).success(function(member) {
				var index = -1
				for(var i = 0; i < $scope.team.members.length; i++) {
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

app.controller('AuthCtrl', [
'$scope',
'$state',
'auth',
function($scope, $state, auth){
  $scope.user = {};

  $scope.register = function(){
    auth.register($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };

  $scope.logIn = function(){
    auth.logIn($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };
}])

app.controller('NavCtrl', [
'$scope',
'auth',
function($scope, auth){
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;
}]);

app.factory('teams', ['$http', 'auth', function($http, auth) {
	var o = {
		teams: []
	};
	o.getAll = function() {
		return $http.get('/teams', {
			headers: { 'Authorization': 'Bearer '+auth.getToken() }
		}).success(function(data) {
			angular.copy(data, o.teams)
		})
	}
	o.create = function(team) {
		return $http.post('/teams', team, {
			headers: { 'Authorization': 'Bearer '+auth.getToken() }
		}).success(function(data) {
			o.teams['ownedTeams'].push(data)
		})
	}
	o.remove = function(team) {
		return $http.post('/teams/' + team._id + '/remove', team, {
			headers: { 'Authorization': 'Bearer '+auth.getToken() }
		})
	}
	o.get = function(id) {
		return $http.get('/teams/' + id, {
			headers: { 'Authorization': 'Bearer '+auth.getToken() }
		}).then(function(res) {
			return res.data
		});
	}
	o.addMember = function(id, member) {
		return $http.post('/teams/' + id + '/members', member, {
			headers: { 'Authorization': 'Bearer '+auth.getToken() }
		})
	}
	o.removeMember = function(id, member) {
		return $http.post('/teams/' + id + '/members/remove', member, {
			headers: { 'Authorization': 'Bearer '+auth.getToken() }
		})
	}
	return o;
}])

app.factory('auth', ['$http', '$window', '$state', function($http, $window, $state){
   var auth = {};

	auth.saveToken = function (token){
	  $window.localStorage['teammate-token'] = token;
	};

	auth.getToken = function (){
	  return $window.localStorage['teammate-token'];
	}

	auth.isLoggedIn = function(){
	  var token = auth.getToken();

	  if(token){
	    var payload = JSON.parse($window.atob(token.split('.')[1]));

	    return payload.exp > Date.now() / 1000;
	  } else {
	    return false;
	  }
	};
	auth.currentUser = function(){
	  if(auth.isLoggedIn()){
	    var token = auth.getToken();
	    var payload = JSON.parse($window.atob(token.split('.')[1]));

	    return [payload.username, payload._id];
	  }
	};
	auth.register = function(user){
	  return $http.post('/register', user).success(function(data){
	    auth.saveToken(data.token);
	  });
	};
	auth.logIn = function(user){
	  return $http.post('/login', user).success(function(data){
	    auth.saveToken(data.token);
	  });
	};
	auth.logOut = function(){
	  $window.localStorage.removeItem('teammate-token');
	  $state.go('login')
	};
  return auth;
}])

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'TeamsCtrl',
			resolve: {
				postPromise: ['teams', function(teams) {
					return teams.getAll();
				}]
			}
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
	})
	.state('login', {
	  url: '/login',
	  templateUrl: '/login.html',
	  controller: 'AuthCtrl',
	  onEnter: ['$state', 'auth', function($state, auth){
	    if(auth.isLoggedIn()){
	      $state.go('home');
	    }
	  }]
	})
	.state('register', {
	  url: '/register',
	  templateUrl: '/register.html',
	  controller: 'AuthCtrl',
	  onEnter: ['$state', 'auth', function($state, auth){
	    if(auth.isLoggedIn()){
	      $state.go('home');
	    }
	  }]
	});

  $urlRouterProvider.otherwise('home');
}]);

app.run(function($rootScope, auth, $location) {
	$rootScope.$on("$stateChangeStart", function(event, next, current) {
		if(auth.isLoggedIn() === false && next.url !== '/register') {
			$location.path('/login')
		}
	})
})