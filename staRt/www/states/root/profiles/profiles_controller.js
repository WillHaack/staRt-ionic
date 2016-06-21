'use strict';

( function(  )
{
	var profiles = angular.module( 'profiles' );

	profiles.controller('ProfilesController', function($scope, $timeout, $localForage, StartUIState, $rootScope, $state)
	{
		console.log('ProfilesController here!');

		var users = [
			{
				name: 'Eeyore'
			},
			{
				name: 'Piglet'
			},
			{
				name: 'Pooh'
			}
		]

		$localForage.getItem('profiles').then(function(res)
		{
			if (res)
			{
				$scope.profiles = res;
				console.log($scope.profiles);
			}
			else
			{
				$localForage.setItem('profiles', users);
				$scope.profiles = users;
			}
		});
	});

} )(  );