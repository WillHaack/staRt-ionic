'use strict';

( function(  )
{
	var tutorial = angular.module( 'tutorial' );

	tutorial.controller('TutorialController', function($scope, $timeout, $localForage, StartUIState, $rootScope, $state)
	{
		
		$scope.coinData = [
			{ 
				id: "coin1",
				sref: "",
				img: "",
				txt: "the wave",
				ani: "",
				xpos: "",
				ypos: "",
				height: "",
				width: ""
			},
			{ 
				id: "coin2",
				sref: "",
				img: "",
				txt: "eee sounds",
				ani: "",
				xpos: "",
				ypos: "",
				height: "",
				width: ""
			},
			{ 
				id: "coin3",
				sref: "",
				img: "",
				txt: "ahh sounds",
				ani: "",
				xpos: "",
				ypos: "",
				height: "",
				width: ""
			},
			{ 
				id: "coin4",
				sref: "",
				img: "",
				txt: "ooh sounds",
				ani: "",
				xpos: "",
				ypos: "",
				height: "",
				width: ""
			},
			{ 
				id: "coin5",
				sref: "",
				img: "",
				txt: "/r/ sounds",
				ani: "",
				xpos: "",
				ypos: "",
				height: "",
				width: ""
			},
		];

		$scope.sliderOpts = {
		    effect: 'slide',
		    initialSlide: 0,
		    pagination: false,

		    // this seems to be the only way to get the swiperJs obj
		    onInit: function(swiper){  
		    $scope.swiper = swiper;
		    console.log($scope.swiper);
		    // Now you can do whatever you want with the swiper
		    },

		    onSlideChangeEnd: function(swiper){
		    console.log('The active index is ' + swiper.activeIndex); 
		    }
		  };

		
		




		console.log('TutorialController here!');
	});

} )(  );

/*

Slide Events
The slides component dispatches events when the active slide changes

$ionicSlides.slideChangeStart	This event is emitted when a slide change begins
$ionicSlides.slideChangeEnd	This event is emitted when a slide change completes
$ionicSlides.sliderInitialized	This event is emitted when the slider is initialized. It provides access to an instance of the slider.

*/