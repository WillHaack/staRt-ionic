'use strict';

( function(  )
{
	var syllables = angular.module( 'syllables' );

	syllables.controller('SyllablesController', function($scope, $timeout, $localForage, StartUIState, $rootScope, $state)
	{
		console.log('SyllablesController here!');

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