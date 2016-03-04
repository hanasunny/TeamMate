var app = angular.module('TeamMate', ['ui.router']);

app.controller('MainCtrl', [
'$scope',
'teams',
function($scope, teams){
	$scope.teams = teams.teams;
  $scope.addTeam = function() {
  	if(!$scope.title || $scope.title === '') { return; }
  	$scope.teams.push({title: $scope.title, members: 0})
  	$scope.title = '';
  }
}]);

app.controller('TeamsCtrl', [
'$scope',
'$stateParams',
'teams',
function($scope, $stateParams, teams){
	$scope.team = teams.teams[$stateParams.id];
	$scope.addMember = function() {
		$scope.team.members.push({name: $scope.name})
		$scope.name = '';
	}
}]);

app.factory('teams', [function() {
	var o = {
		teams: [
  	{title: 'Team1', members: [{name: 'Pieter'}, {name: 'Pieter2'}]},
  	{title: 'Team2', members: [{name: 'Hana'},]},
  	{title: 'Team3', members: [{name: 'Cody'},]},
  	{title: 'Team4', members: [{name: 'Tiffany'},]}
		]
	};
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
		  url: '/teams/{id}',
		  templateUrl: '/teams.html',
		  controller: 'TeamsCtrl'
		});

  $urlRouterProvider.otherwise('home');
}]);