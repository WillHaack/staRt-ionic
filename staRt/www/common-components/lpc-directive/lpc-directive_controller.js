/*globals console:false, angular:false, window:false, alert:false */
/*globals THREE:false, AudioPlugin:false */

'use strict';

// requestAnim shim layer by Paul Irish
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame    ||
	window.oRequestAnimationFrame      ||
	window.msRequestAnimationFrame     ||
	function(/* function */ callback, /* DOMElement */ element){
		window.setTimeout(callback, 1000 / 60);
	};
})();

function linScale(v, inlow, inhigh, outlow, outhigh) {
	var range = outhigh - outlow;
	var domain = inhigh - inlow;
	var ov = (v - inlow) / domain;
	ov = (ov * range) + outlow;
	return ov;
}

var lpcDirective = angular.module( 'lpcDirective' );

lpcDirective.controller( 'LpcDirectiveController',
	function($rootScope, $scope, $state, $stateParams, $element, $timeout, $localForage, ProfileService, LPCRenderer )
	{

	$scope.data = {};

	$scope.$watchCollection('data', function()
	{
		$scope.$emit('ratingChange', $scope.data.rating);
	});

	$scope.lpcRenderer = new LPCRenderer($element, 20);

	// Mouse events
	$scope.lpcRenderer.renderer.domElement.addEventListener('mousedown', onTouchStart, false);
	window.addEventListener('mousemove', onTouchMove, false);
	window.addEventListener('mouseup', onTouchEnd, false);

	// Touch events
	$scope.lpcRenderer.renderer.domElement.addEventListener('touchstart', onTouchStart, false);
	$scope.lpcRenderer.renderer.domElement.addEventListener('touchmove', onTouchMove, false);
	$scope.lpcRenderer.renderer.domElement.addEventListener('touchcancel', onTouchEnd, false);
	$scope.lpcRenderer.renderer.domElement.addEventListener('touchend', onTouchEnd, false);

	$scope.active = false;
	$scope.pause = false;
	$scope.pointerDown = false;

	///////////////////////////////////
	//  GET DATA
	///////////////////////////////////
		$scope.getLPCCoefficients = function(cb) {
			if (window.AudioPlugin !== undefined) {
				AudioPlugin.getLPCCoefficients(cb);
			} else {
				$scope.makeDummyData(cb);
			}
		};


		var pointCount = 256;
		var dummyPoints = [];
		for (var i=0; i<pointCount; i++)
			dummyPoints.push(0);
		var dummyNoisiness = 0.05

		$scope.makeDummyData = function(cb) {

			var msg = {};
			msg.coefficients = [];
			msg.freqPeaks = [];

			for (var i=0; i<pointCount; i++) {
				if (i==0 || i==(pointCount-1))
					dummyPoints[i] = 0;
				else {
					var p = (Math.random() - 0.5) * dummyNoisiness;
					dummyPoints[i] = dummyPoints[i] + p;
				}
			}
			for (var i=0; i<pointCount; i++) {
				if (i==0 || i==(pointCount-1))
					msg.coefficients.push(dummyPoints[i])
				else {
					var vrg = dummyPoints[i-1] + dummyPoints[i] + dummyPoints[i+1]
					msg.coefficients.push(vrg/3);
				}
			}
			for (var i=0; i<pointCount; i++) {
				if (i>0 && i<(pointCount-1)) {
					if (dummyPoints[i-1] > dummyPoints[i] && dummyPoints[i] < dummyPoints[i+1]) {
						msg.freqPeaks.push({
							X: linScale(i, 0, pointCount-1, -1, 1),
							Y: msg.coefficients[i]
						});
					}
				}
			}
			msg.freqScale = 2.2;
			if (cb)
				cb(msg);
		}

		$scope.lpcCoefficientCallback = function(msg) {
			if ($scope.active) {
				var points = msg.coefficients;
				var peaks = msg.freqPeaks;
				var frequencyScaling = msg.freqScale;

				$scope.lpcRenderer.updateWave(points, peaks, frequencyScaling);
			}
		};


	///////////////////////////////////
	//  MOUSE HANDLERS -- DELETE AFTER DEBUGGING
	///////////////////////////////////
		// function onMouseDown( event ) {
		// 	event.preventDefault();		

		// 	canvas.addEventListener( 'mousemove', onMouseMove, false );
		// 	canvas.addEventListener( 'mouseup', onMouseUp, false );
		// 	canvas.addEventListener( 'mouseout', onMouseOut, false ); 

		// 	// NDC for raycaster. raycaster will ONLY accept NDC for mouse events 
		// 	mouse.x = ( event.clientX / canvas.clientWidth ) * 2 - 1;
		// 	mouse.y = (( event.clientY / canvas.clientHeight ) * -1) * 2 + 1; // GOTTA FLIP FOR DOM COORDS! tres important!!!
		// 	// #st - maybe these are wrong

		// 	// RAYCASTER
		// 	raycaster.setFromCamera(mouse, camera); // gives the raycaster coords from mouse (NDC) & cam (world) positions

		// 	var intersects = raycaster.intersectObjects(scene.children, true); // cast a ray & get an array of things that it hits. 'recursive = true' is necessary to autoloop thru the descendants of grouped objs (i.e. scence.children's children)
		// 	console.log(intersects.length);

		// 	if (intersects.length > 0) { // if the ray hits things
		// 		for ( var i = 0; i < intersects.length; i++ ) {
					
		// 			INTERSECTED = intersects[i];
		// 			console.log(intersects[ i ].object.name);

		// 			if (INTERSECTED.object.name === "pauseBtn") {
		// 				if(pause === false) {
		// 					pause = true;
		// 					console.log('wave is paused.');
		// 				} else {
		// 					pause = false;
		// 					console.log('wave is running');
		// 				}

		// 			} else if (INTERSECTED.object.name === "targetBtn") {

		// 				if (sliderFz != savedTarget) {

		// 					// reposition slider
		// 					var target = (linScale(savedTarget, 4500, 0, LEFT, RIGHT));
		// 					slider.position.setX(target);

		// 					// update canvas2d
		// 					label.remove( textSprite );
		// 					textSprite = Drawing.makeTextSprite(savedTarget); 
		// 					textSprite.position.set(0,10,9);
		// 					label.add( textSprite );
		// 				}

		// 			// } else if (INTERSECTED.object.name === "star") {
		// 			// 	console.log('star');
		// 			// } 

		// 			} // end if targetBtn
		// 		} // end forLoop 
		// 	} else {
		// 		INTERSECTED = null;  // clear your ray gun
		// 	}
		// } // end onMouseDown

		// function onMouseMove(e) {
		// 	e.preventDefault();
			 
		// 	 	// #st if positioned using css you need to add offset to event.clientX. However the offset shouldn't go thru linScale, so not sure how to solve
		// 		mouseX = linScale(e.clientX, 0, WIDTH, LEFT, RIGHT); 

		// 		if (mouseX >= (LEFT+(padH)) && mouseX <= (sliderWidth-(padH))) {
		// 			slider.position.setX(mouseX);
					
		// 			// map fz range for slider
		// 			sliderFz = Math.ceil(linScale(mouseX, LEFT, RIGHT, 4500, 0));
		// 			renderTextSprite = true;
		// 		}
		// } // end onMouseMove

		// function onMouseUp( e ) {
		// 	canvas.removeEventListener( 'mousemove', onMouseMove, false );
		// 	canvas.removeEventListener( 'mouseup', onMouseUp, false );
		// 	canvas.removeEventListener( 'mouseout', onMouseOut, false );
		// 	renderTextSprite = false;
		// }

		// function onMouseOut( e ) {
		// 	canvas.removeEventListener( 'mousemove', onMouseMove, false );
		// 	canvas.removeEventListener( 'mouseup', onMouseUp, false );
		// 	canvas.removeEventListener( 'mouseout', onMouseOut, false );
		// }

	///////////////////////////////////
	//  TOUCH HANDLERS
	///////////////////////////////////

		// TOUCH 
		// https://developer.apple.com/library/content/documentation/AudioVideo/Conceptual/HTML-canvas-guide/AddingMouseandTouchControlstoCanvas/AddingMouseandTouchControlstoCanvas.html
		// touch points can be calc'd from the DOM ele, but even though the method is called .pageX and .pageY

		// if touch
		// canvas.addEventListener('touchstart', onTouchStart, false );
		// canvas.addEventListener('touchmove', onTouchMove, false); 
		// canvas.addEventListener('touchend', onTouchEnd, false); 
		// canvas.addEventListener('touchcancel', onTouchCancel, false); 
		// document.body.addEventListener("touchcancel", touchUp, false);

		$scope.lpcRenderer.renderer.domElement.addEventListener('mousedown', onTouchStart, false);

		function onTouchStart( e )
		{
			// $scope.lpcRenderer.sliderPosition = e.layerX - $scope.lpcRenderer.WIDTH/2

			if ($scope.pointerDown === false) {
				$scope.pointerDown = true;

				if (e.type === 'touchstart') $scope.trackedTouch = e.identifier;

				e.preventDefault();

				var point = {
					x: e.layerX - $scope.lpcRenderer.WIDTH / 2,
					y: e.layerY - $scope.lpcRenderer.HEIGHT / 2
				};

				var intersects = $scope.lpcRenderer.hitTest(point);
				if (intersects === 'pauseBtn' || intersects === 'targetBtn') {
					handleButtonPress(intersects);
				} else {
					$scope.trackingTarget = true;
					$scope.data.targetf3 = linScale(e.layerX, 0, $scope.lpcRenderer.WIDTH, 0, 4500);
					$scope.updateTarget();
				}
			}
		}

		function onTouchMove( e )
		{
			if ($scope.trackedTouch !== undefined && $scope.trackedTouch !== e.identifier) return;

			if ($scope.trackingTarget) {
				e.preventDefault();

				var element = $scope.lpcRenderer.renderer.domElement;
				var rect = element.getBoundingClientRect();
				var px = e.pageX - rect.left;

				$scope.data.targetf3 = linScale(px, 0, $scope.lpcRenderer.WIDTH, 0, 4500);
				$scope.updateTarget();
			}
		}

		function onTouchEnd( e ) {
			if ($scope.trackedTouch !== undefined && $scope.trackedTouch !== e.identifier) return;

			e.preventDefault();

			$scope.pointerDown = false;
			$scope.trackedTouch = undefined;
			$scope.trackingTarget = false;
		}


	///////////////////////////////////
	//  RENDER
	///////////////////////////////////
		$scope.animate = function() {
			if ($scope.active) {
				if ($scope.renderTextSprite) {
					if ( textSprite === undefined ) {
						textSprite = Drawing.makeTextSprite(sliderFz);
						textSprite.position.set(0,10,9);
						label.add( textSprite );
					} else {
						label.remove( textSprite );
						textSprite = Drawing.makeTextSprite(sliderFz);
						textSprite.position.set(0,10,9);
						label.add( textSprite );
					}
				}

				if ($scope.pause === false) {
					$scope.getLPCCoefficients($scope.lpcCoefficientCallback);
				}

				//stats.update();
				window.requestAnimFrame($scope.animate);
				$scope.lpcRenderer.render();

				//$scope.updateTarget();
			}
		};
		$scope.animate();

	///////////////////////////////////
	//  MISC UTILS
	///////////////////////////////////
		$scope.scaleContext = function() {
			var renderer = $scope.lpcRenderer.renderer;
			var canvas = $scope.lpcRenderer.canvas;
			var camera = $scope.lpcRenderer.camera;

			getDrawingDim();
			// var WIDTH = parseInt(renderer.domElement.clientWidth);
			// var HEIGHT = parseInt(renderer.domElement.clientHeight);

			if (renderer.getSize().width != WIDTH ||
				renderer.getSize().height != HEIGHT)
			{
				renderer.setSize(WIDTH, HEIGHT);
				camera.left = -WIDTH/2;
		        camera.right = WIDTH/2;
		        camera.top = -HEIGHT/2;
		        camera.bottom = HEIGHT/2;
		        camera.updateProjectionMatrix();
		    }
		}


//--------------------------------------------------------------

	////////////////////////////
	//  Interaction & Targets
	////////////////////////////

	function setInitialTarget() {
		ProfileService.getCurrentProfile().then(function(res)
		{
			console.log('currentProfile:', res)
			if (res) {
				if (res.targetF3)
				{
					$scope.data.targetF3 = res.targetF3;
					console.log('existing targetf3:', res.targetF3)
				}
				else
				{
					$scope.data.targetF3 = ProfileService.lookupDefaultF3(res);
					console.log('going w default tf3:', $scope.data.targetF3);
				}
			}

			// Set initial LPC
			$timeout(function()
			{
				$scope.updateTarget();
			});
		})
	}

	$scope.updateTarget = function() {

		var sliderPosition = linScale($scope.data.targetf3, 0, 4500, 0, 1);
		$scope.lpcRenderer.sliderPosition = sliderPosition;
		$scope.lpcRenderer.targetFrequency = $scope.data.targetf3;

		//Update current user's Target F3
		ProfileService.getCurrentProfile().then(function(res)
		{
			if (res) {
				var currentProfile = res;
				currentProfile.targetF3 = parseInt($scope.data.targetF3);
				ProfileService.saveProfile(currentProfile);
			}
		})
	}

	$scope.resetF3 = function() {
		ProfileService.getCurrentProfile().then(function(res)
		{
			if(res)
			{
				$scope.data.targetF3 = ProfileService.lookupDefaultF3(res);
				$timeout(function()
				{
					$scope.updateTarget();
				})
			}
		})
	}

	$scope.$parent.$on('$ionicView.afterEnter', function() {
		$scope.active = true;
		setInitialTarget();
		$scope.animate();
	});

	$scope.$parent.$on('$ionicView.beforeLeave', function() {
		$scope.active = false;
	});

	$scope.$watch('targetF3', function()
	{
		console.log('target changed to: ', $scope.targetF3);
		$scope.updateTarget();
	});
});
