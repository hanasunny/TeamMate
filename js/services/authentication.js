//factory used for service initialization, in this case FireBase authentication
myApp.factory('Authentication', ['$rootScope','$firebaseAuth','$firebaseObject','$location','FIREBASE_URL',function($rootScope,$firebaseAuth,$firebaseObject,$location,FIREBASE_URL){
    
    //create Firebase object and pass it the Firebase URL to our project
    var ref = new Firebase(FIREBASE_URL);
    
    //Passes the object into Firebase authentication
    var auth = $firebaseAuth(ref);
    
    //checks for user being logged in
    auth.$onAuth(function(authUser){
       if (authUser){
           var userRef = new Firebase(FIREBASE_URL + 'users/' + authUser.uid);
           var userObj = $firebaseObject(userRef);
           $rootScope.currentUser = userObj;
       } else {
           $rootScope.currentUser = '';
       }
        
    });
    
    var myObject = {
        //login method being passed user variable that comes from registration controller
        login: function(user){
            auth.$authWithPassword({
                email: user.email,
                password: user.password
            }).then(function(regUser){
                $location.path('/success');
            }).catch(function(error){
                $rootScope.message = error.message;
            });
            
        }, //login
        
        logout: function(){
            return auth.$unauth();
        }, //logout
        
        requireAuth: function(){
            return auth.$requireAuth();
        }, //require auth
        
        register: function(user){
          auth.$createUser({ 
             //sends user info to FireBase
             email: user.email,
             password: user.password
             
             //creates promise that expects successful registration and spits out message
          }).then(function(regUser){ 
              
              var regRef = new Firebase(FIREBASE_URL + 'users').child(regUser.uid).set({
                  date: Firebase.ServerValue.TIMESTAMP,
                  regUSER: regUser.uid,
                  firstname: user.firstname,
                  lastname: user.lastname,
                  email: user.email
              });
              
              //automagically logs user in once registration is complete!
              myObject.login(user);
             
             //catches error and tells user in case email already exists
          }).catch(function(error){
             $rootScope.message = error.message; 
          }); // create user             
            }//register
        };
        
        return myObject;
    
}]); //factory


