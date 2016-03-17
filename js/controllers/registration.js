myApp.controller('RegistrationController', ['$scope','Authentication', function($scope, Authentication){
   
   $scope.login = function(){
      //passes user model to Authentication login function
       Authentication.login($scope.user);
   }; //login
   
   $scope.register = function(){
      Authentication.register($scope.user);
   }; //register
   
   $scope.logout = function(){
      Authentication.logout();
   }; //logout
   
}]); // controller