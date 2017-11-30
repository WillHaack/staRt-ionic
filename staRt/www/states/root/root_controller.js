'use strict';

( function(  )
{
	var root = angular.module( 'root' );

	root.controller('RootController', function($scope, $timeout, $localForage, StartUIState, ProfileService, UploadService, $rootScope, $state)
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

		// Initialize UI
		StartUIState.getLastActiveIndex($localForage).then(function(data)
		{
			$scope.startUIState = data;
		});

		$scope.state = $state;

		//console.log($scope.state);

		$scope.selectIndex = function(index)
		{
			StartUIState.setLastActiveIndex($localForage, index);
			$scope.content = StartUIState.content[index];
		};

		$scope.tabData = StartUIState.tabData;
	});

} )(  );