'use strict';

( function(  )
{
	var freePlay = angular.module( 'freePlay' );

	freePlay.controller('FreePlayController', function($scope, $timeout, $localForage, StartUIState, $rootScope, $state)
	{
		console.log('FreePlayController here!');

		$scope.$on("$ionicView.enter", function() {
			$scope.$broadcast("enter");
		});

		$scope.$on("$ionicView.afterEnter", function() {
			$scope.$broadcast("afterEnter");
		});

		$scope.$on("$ionicView.beforeLeave", function() {
			$scope.$broadcast("beforeLeave");
		});
	});

} )(  );