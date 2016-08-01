'use strict';

( function(  )
{
	var resources = angular.module( 'resources' );

	resources.controller('ResourcesController', function($scope, $timeout, $localForage, StartUIState, $rootScope, $state)
	{
		console.log('ResourcesController here!');

		$scope.lpcOrder = 25;

		$scope.logPluginLPCOrder = function(order)
		{
			console.log("Plugin LPC order is now: " + order);
		}

		$scope.setLPCOrder = function(order)
		{
			$scope.lpcOrder = order;
		};

		$scope.updatePluginLPCOrder = function() {
			if (window.AudioPlugin !== undefined) {
					AudioPlugin.setLPCOrder($scope.lpcOrder, $scope.logPluginLPCOrder);
			}
		}

		$scope.$on('$ionicView.afterEnter', function(event)
		{
			console.log('view content loaded!');
			if (window.AudioPlugin !== undefined)
			{
				AudioPlugin.getLPCOrder($scope.setLPCOrder);
			};
		});

	});

} )(  );
