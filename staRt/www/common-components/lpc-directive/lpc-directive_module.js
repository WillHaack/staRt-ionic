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
		slider: T/F 	creates LPC with slider  (default is true)
		reset: T/F 		adds Reset Target btn
		rate: "isPracticing" ???  idk what this does. practice-directive?
		hideBtn: T/F 	adds the Show/Hide Wave btn
		waveHidden: "isFeedbacking" idk what this does. practice-directive?
		tutorial:

    beach: T/F flag for lpc-renderer script. Default: false.
      false: render returns only the wave (Tutorial, Profiles/Settings)
      true: render returns the beach scene with Slider, Pause/Play, Reset, etc (Free Play, Quest)
	*/

	return {

		restrict: 'E',
		controller: 'LpcDirectiveController',
		scope:
		{
      active: "=",
			probe: '=',
			slider: '=',
			reset: '=',
			rate: '=',
			hideBtn: '=',
      waveHidden: "=",
			tutorial: "=",
      beach: "="
		},
		templateUrl: 'common-components/lpc-directive/lpc-directive_template.html'
	};
} );
