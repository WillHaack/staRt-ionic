'use strict';

( function(  )
{
	var freePlay = angular.module( 'freePlay' );

	freePlay.controller('FreePlayController', function($scope, $timeout, $localForage, StartUIState, $rootScope, $state)
	{
		console.log('FreePlayController here!');

		// Set initial LPC target
		$localForage.getItem('lpcTarget').then(function(res)
		{
			if (res)
			{
				$scope.currentTarget = res;
			}
			else
			{
				$scope.currentTarget = 3000;
			}
		});

		$scope.updateCurrentTarget = function()
		{
			$localForage.setItem('lpcTarget', $scope.currentTarget );
		}


	});

} )(  );