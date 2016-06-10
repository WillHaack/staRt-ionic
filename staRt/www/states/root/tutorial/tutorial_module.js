'use strict';

( function(  )
{
	var tutorial = angular.module( 'tutorial',
	[ ] );

	tutorial.config( function( $stateProvider )
	{
		$stateProvider.state( 'root.tutorial',
		{
			url: 'tutorial',
			views:
			{
				'content-view':
				{
					templateUrl: 'states/root/tutorial/tutorial_template.html',
					controller: 'TutorialController as tutorial'
				}
			}
			// abstract: true,
		} );
	} );

} )(  );
