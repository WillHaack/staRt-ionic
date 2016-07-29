/*globals console:false, angular:false, window:false, alert:false */

'use strict';

( function(  )
{
	var profiles = angular.module( 'profiles' );

	profiles.controller('ProfilesController', function($scope, $timeout, $localForage, StartUIState, ProfileService, $rootScope, $state)
	{
		console.log('ProfilesController here!');

		// Nota Bene: A valid profile must have the following kv pairs:
		// "name" (string) the name of the profile
		// "uuid" (string) some string that is unique to each account
		// "age" (int) age in years
		// "gender" (string) Male or Female
		// "heightFeet" (int) feet portion of height
		// "heightInches" (int) inches portion of heightInches
		// "targetF3" (double, optional) the saved target F3 value
		// "stdevF3" (double, optional) the saved stdeviation F3 value
		// "targetLPCOrder" (int, optional) the saved target LPC order

		var defaultUsers = [
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
				gender: 'Male',
				uuid: '88888888'
			}
		];

		function init()
		{
			ProfileService.getAllProfiles().then( function(res) {
				$scope.profiles = res;
			});
			
			$scope.isEditing = false;

			ProfileService.getCurrentProfile().then(function(res)
			{
				$scope.data = {
					currentProfile: res
				}
			});

			$scope.$watchCollection('data', function(data)
			{
				console.log(data);
			});
		}

		$scope.updateCurrentProfile = function()
		{
			ProfileService.setCurrentProfile($scope.data.currentProfile);
		};

		$scope.setIsEditing = function(isEditing)
		{
			$scope.isEditing = isEditing;
			$scope.editing = isEditing ? "editing" : "";
		};

		$scope.saveProfile = function()
		{
			if ($scope.data.currentProfile.name !== undefined &&
				$scope.data.currentProfile.age !== undefined &&
				$scope.data.currentProfile.heightFeet !== undefined &&
				$scope.data.currentProfile.heightInches !== undefined &&
				$scope.data.currentProfile.gender !== undefined)
			{
				ProfileService.saveProfile($scope.data.currentProfile);

				ProfileService.getAllProfiles().then(function(res)
				{
					$scope.profiles = res;
				})

				$scope.setIsEditing(false);				
			} else {
				alert("Profile is missing some data");
			}

			console.log($scope.profiles);
		};

		$scope.discardProfile = function()
		{
			ProfileService.getCurrentProfile().then( function(res) {
				$scope.data.currentProfile = res;
			});
			$scope.setIsEditing(false);
		};

		$scope.createProfile = function()
		{
			$scope.data.currentProfile = ProfileService.createProfile();
			$scope.setIsEditing(true);
		};

		$scope.deleteAllProfiles = function()
		{
			$scope.data.currentProfile = undefined;
			$scope.profiles = [];
			ProfileService.deleteAllProfiles();
		};

		init();

	});

} )(  );
