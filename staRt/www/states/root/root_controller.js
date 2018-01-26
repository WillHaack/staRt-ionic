'use strict';

( function(  )
{
	var root = angular.module( 'root' );

	root.controller('RootController', function($scope, $timeout, $localForage, $ionicNavBarDelegate, FirebaseService, StartUIState, ProfileService, UploadService, $rootScope, $state)
	{
		//console.log('RootController here!');

		$localForage._localforage.defineDriver(window.cordovaSQLiteDriver).then(function() {
			return $localForage._localforage.setDriver([
				// Try setting cordovaSQLiteDriver if available,
				window.cordovaSQLiteDriver._driver,
				// otherwise use one of the default localForage drivers as a fallback.
				// This should allow you to transparently do your tests in a browser
				$localForage._localforage.INDEXEDDB,
				$localForage._localforage.WEBSQL,
				$localForage._localforage.LOCALSTORAGE
			]);
		});

		$scope.state = $state;
		$scope.state.loggedIn = !!firebase.auth().currentUser;

		// Initialize UI
		StartUIState.getLastActiveIndex($localForage).then(function(data)
		{
			$scope.startUIState = data;
			firebase.auth().onAuthStateChanged(function (user) {
				if (user) {
					console.log("Logged in as " + user);
				}

				var wasLoggedIn = $scope.state.loggedIn;
				$scope.state.loggedIn == !!user;

				if (!user) {
					if (wasLoggedIn) $state.go('root', {}, { reload: true });
				} else {
					if (!wasLoggedIn) {
						$state.go('root.profiles', {}, { reload: true });
					} else {
						// I have no idea why the navbar hides itself after login. I promise to
						// investigate this an fix it later—removing this extremely gross hack—
						// later when other more important things are done
						console.log("Gross (but hopefully harmless) hack still at play");
						$ionicNavBarDelegate.title("Profiles");
						$ionicNavBarDelegate.showBar(true);
					}
				}
			});

			if (firebase.auth().currentUser === null) {
				console.log("Prompting for login");
				FirebaseService.startUi();
			}
		});

		//console.log($scope.state);

		$scope.selectIndex = function(index)
		{
			StartUIState.setLastActiveIndex($localForage, index);
			$scope.content = StartUIState.content[index];
		};

		$scope.tabData = StartUIState.tabData;
	});

} )(  );