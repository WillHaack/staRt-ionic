'use strict';

( function(  )
{
	var root = angular.module( 'root',
	[ 
		'LocalForageModule',
		'startStateService',
		'lpcDirective',
		'auto',
		'freePlay',
		'profiles',
		'resources',
		'syllables',
		'tutorial',
		'words'
	] );

	root.config( function( $stateProvider )
	{
		$stateProvider.state( 'root',
		{
			url: '/',
			views:
			{
				'app-view':
				{
					templateUrl: 'states/root/root_template.html',
					controller: 'RootController as root'
				}
			},
			resolve:
			{
				normsData: function($http) {
	          		return $http.get('data/F3r_norms_Lee_et_al_1999.csv');
	        	}
			}
			// abstract: true
		});
	} );

} )(  );
