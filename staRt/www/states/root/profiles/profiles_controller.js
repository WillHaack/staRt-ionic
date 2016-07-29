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

		$scope.isEditing = false;

		$localForage.getItem('profiles').then(function(res)
		{
			if (res)
			{
				$scope.profiles = res;
				console.log($scope.profiles);
			}
			else
			{
				$localForage.setItem('profiles', defaultUsers);
				$scope.profiles = defaultUsers;
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

		// http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript#105074
		function guid() {
			return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		    s4() + '-' + s4() + s4() + s4();
		}

		function s4() {
		  return Math.floor((1 + Math.random()) * 0x10000)
		    .toString(16)
		    .substring(1);
		}

		function newUserProfile() {
			return {
				name: undefined,
				age: undefined,
				heightFeet: undefined,
				heightInches: undefined,
				gender: undefined,
				uuid: guid()
			};
		}

		$scope.setIsEditing = function(isEditing)
		{
			$scope.isEditing = isEditing;
			$scope.editing = isEditing ? "editing" : "";
		};

		$scope.saveProfile = function()
		{
			if ($scope.data.currentUser.name !== undefined &&
				$scope.data.currentUser.age !== undefined &&
				$scope.data.currentUser.heightFeet !== undefined &&
				$scope.data.currentUser.heightInches !== undefined &&
				$scope.data.currentUser.gender !== undefined)
			{
				var idx = $scope.profiles.findIndex(function(el) {
					return el.uuid == this.uuid;
				}, $scope.data.currentUser);
				if (idx === -1) {
					$scope.profiles.push($scope.data.currentUser);
					idx = $scope.profiles.length - 1;
				} else {
					$scope.profiles[idx] = $scope.profiles.currentUser;
				}
				$scope.setIsEditing(false);
				$localForage.setItem('profiles', $scope.profiles);
				$scope.data.currentUser = $scope.profiles[idx];
			} else {
				alert("Profile is missing some data");
			}
		};

		$scope.discardProfile = function()
		{
			$scope.setIsEditing(false);
		};

		$scope.createProfile = function()
		{
			var profile = newUserProfile();
			$scope.setIsEditing(true);
			$scope.data.currentUser = profile;
		};

		$scope.deleteAllProfiles = function()
		{
			$scope.data.currentUser = undefined;
			$scope.profiles = [];
			$localForage.setItem('profiles', undefined);
		};

	});

} )(  );
