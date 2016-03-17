//factory used for service initialization, in this case FireBase authentication
myApp.factory('Authentication', ['$rootScope','$firebaseAuth','FIREBASE_URL',function($rootScope,$firebaseAuth,FIREBASE_URL){
    
    //create Firebase object and pass it the Firebase URL to our project
    var ref = new Firebase(FIREBASE_URL);
    
    //Passes the object into Firebase authentication
    var auth = $firebaseAuth(ref);
    
    return{
        login: function(user){
            $rootScope.message = "Welcome" + user.email;
        },
        
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
              
             $rootScope.message = "Hello " + user.firstname + ", Thanks for registering";
             
             //catches error and tells user in case email already exists
          }).catch(function(error){
             $rootScope.message = error.message; 
          }); // create user             
            }//register
        };
    
}]); //factory


