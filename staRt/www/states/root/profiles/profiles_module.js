'use strict';

( function(  )
{
	var profiles = angular.module( 'profiles',
	[ ] );

	profiles.config( function( $stateProvider )
	{
		$stateProvider.state( 'root.profiles',
		{
			url: 'profiles',
			views:
			{
				'content-view':
				{
					templateUrl: 'states/root/profiles/profiles_template.html',
					controller: 'ProfilesController as profiles'
				}
			}
			// abstract: true,
		} );
	} );

} )(  );
