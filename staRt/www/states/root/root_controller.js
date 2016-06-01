'use strict';

( function(  )
{
	var root = angular.module( 'root' );

	root.controller('RootController', function($scope, $timeout, $localForage, StartUIState, $rootScope, $state)
	{
		console.log('RootController here!');

		StartUIState.getLastActiveIndex($localForage).then(function(data)
		{
			$scope.startUIState = data;
		});

		$scope.selectIndex = function(index)
		{
			StartUIState.setLastActiveIndex($localForage, index);
			$scope.content = StartUIState.content[index];
		};

		$scope.tabTitles = StartUIState.tabTitles;
	});

} )(  );