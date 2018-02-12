'use strict';

( function(  )
{
	var freePlay = angular.module( 'freePlay' );

	freePlay.controller('FreePlayController', function($scope, $timeout, $localForage, StartUIState, NotifyingService, $rootScope, $state)
	{
		console.log('FreePlayController here!');

		var lastChronoTime = Date.now();

		var logInterval = function() {
			var nextChronoTime = Date.now();
			var duration = nextChronoTime - lastChronoTime;
			NotifyingService.notify("freeplay-tick", duration);
			lastChronoTime = nextChronoTime;
		}

		// Start a timer to log the time spend in free play
		var ticker = setInterval(logInterval, 60000);

		$scope.$on('$destroy', function() {
			logInterval();
			clearInterval(ticker);
		});
	});

} )(  );