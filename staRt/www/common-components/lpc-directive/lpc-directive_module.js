'use strict';

var lpcDirective = angular.module( 'lpcDirective', [] );

lpcDirective.directive( 'lpcDirective', function()
{
	return {

		restrict: 'E',
		controller: 'LpcDirectiveController',
		templateUrl: 'common-components/lpc-directive/lpc-directive_template.html'
	};
} );
