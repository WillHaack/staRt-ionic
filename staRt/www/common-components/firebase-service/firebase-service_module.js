var firebaseService = angular.module('firebaseService', []);

firebaseService.factory('FirebaseService', function()
{
    function signInSuccess(currentUser, credential, redirectUrl) {
        // Do something.
        // Return type determines whether we continue the redirect automatically
        // or whether we leave that to developer to handle.

        console.log("Sign in successful!!");
        console.log(credential);

        return false;
    }

    var uiConfig = {
        callbacks: {
            signInSuccess: signInSuccess
        },
        signInOptions: [
            firebase.auth.EmailAuthProvider.PROVIDER_ID
        ],
        signInFlow: 'popup'
    };

    var firebaseApp = firebase.initializeApp({
        apiKey: "AIzaSyCcifZep5wuYGaX0kg_EB3wdT75UJAQ0HY",
        authDomain: "start-firebase-3a446.firebaseapp.com",
        databaseURL: "https://start-firebase-3a446.firebaseio.com",
        projectId: "start-firebase-3a446",
        storageBucket: "start-firebase-3a446.appspot.com",
        messagingSenderId: "333691923555"
    });

    var db = firebaseApp.firestore();

    // Initialize the FirebaseUI Widget using Firebase.
    var ui = new firebaseui.auth.AuthUI(firebase.auth());

    return {
        app: function() { return firebaseApp; },

        db: function() { return db; },

        loggedIn: function() { return !!firebase.auth().currentUser; },

        startUi: function() { ui.start('#firebaseui-auth-container', uiConfig); },

        timestamp: function() { return firebase.firestore.FieldValue.serverTimestamp(); },

        userId: function() { return firebase.auth().currentUser ? firebase.auth().currentUser.uid : null; }
    }
});
