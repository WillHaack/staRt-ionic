'use strict';

var lpcDirective = angular.module( 'lpcDirective',
[
    'ngResize'
]);

lpcDirective.config(['resizeProvider', function(resizeProvider){
    resizeProvider.throttle = 100;
}]);

lpcDirective.directive( 'lpcDirective', function()
{
	/* ISOLATE SCOPE KEY
		active: ????  idk what this does
		probe: "probe" ???  idk what this does. probably something w/ the practice-directive
		sand: T/F 		creates LPC with sand  (default is true)
		slider: T/F 	creates LPC with slider  (default is true)
		reset: T/F 		adds Reset Target btn
		rate: "isPracticing" ???  idk what this does. practice-directive?
		hideBtn: T/F 	adds the Show/Hide Wave btn
		waveHidden: "isFeedbacking" idk what this does. practice-directive?
		tutorial: probably N/A now
	*/

	return {

		restrict: 'E',
		controller: 'LpcDirectiveController',
		scope:
		{
      active: "=",
			probe: '=',
			sand: '=',
			slider: '=',
			reset: '=',
			rate: '=',
			hideBtn: '=',
      waveHidden: "=",
			tutorial: "="
		},
		templateUrl: 'common-components/lpc-directive/lpc-directive_template.html'
	};
} );
