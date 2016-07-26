'use strict';

var lpcDirective = angular.module( 'lpcDirective', [] );

lpcDirective.directive( 'lpcDirective', function()
{
	return {

		restrict: 'E',
		controller: 'LpcDirectiveController',
		scope:
		{
			slider: '='
		},
		templateUrl: 'common-components/lpc-directive/lpc-directive_template.html'
	};
} );
