/*globals console:false, angular:false, window:false, alert:false */

'use strict';

( function(  )
{
	var profiles = angular.module( 'profiles' );

	profiles.controller('ProfilesController', function($scope, $timeout, $localForage, StartUIState, $rootScope, $state)
	{
		console.log('ProfilesController here!');

		// Nota Bene: A valid profile must have the following kv pairs:
		// "name" (string) the name of the profile
		// "uuid" (string) some string that is unique to each account
		// "age" (int) age in years
		// "gender" (string) M or F
		// "heightFeet" (int) feet portion of height
		// "heightInches" (int) inches portion of heightInches
		// "targetF3" (double, optional) the saved target F3 value
		// "stdevF3" (double, optional) the saved stdeviation F3 value
		// "targetLPCOrder" (int, optional) the saved target LPC order

		var users = [
			{
				name: 'Eeyore',
				age: 16,
				heightFeet: 5,
				heightInches: 2,
				gender: 'Male',
				uuid: '12345678'
			},
			{
				name: 'Piglet',
				age: 4,
				heightFeet: 3,
				heightInches: 2,
				gender: 'Male',
				uuid: '87654321'
			},
			{
				name: 'Pooh',
				age: 26,
				heightFeet: 7,
				heightInches: 2,
				sex: 'Male',
				uuid: '88888888'
			}
		];

		$localForage.getItem('profiles').then(function(res)
		{
			if (res)
			{
				// For now, setting it equal to 'users' as well
				$scope.profiles = users;
				console.log($scope.profiles);
			}
			else
			{
				$localForage.setItem('profiles', users);
				$scope.profiles = users;
			}
		});

		$scope.updateCurrentUser = function()
		{
			$localForage.setItem('currentUser', $scope.data.currentUser);
		};

		$scope.data = {
			currentUser: $localForage.getItem('currentUser')
		};

		$scope.$watchCollection('data', function(data)
		{
			console.log(data);
		});

	});

} )(  );
