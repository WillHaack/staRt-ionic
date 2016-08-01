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
	return {

		restrict: 'E',
		controller: 'LpcDirectiveController',
		scope:
		{
			slider: '='
		},
		templateUrl: 'common-components/lpc-directive/lpc-directive_template.html'
		// link: function(scope, element, attrs) {
	 //      cleanup = $rootScope.$on('locale-changed', function(locale) {
	 //        element.text(LocaleService.getTranslation(originalText, attrs.locale || locale));
	 //      });
	 //      scope.$on('$destroy', function() {
	 //        console.log("destroy");
	 //        cleanup();
	 //      });
	 //    }
	};
} );
