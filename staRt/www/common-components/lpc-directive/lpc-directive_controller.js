/*globals console:false, angular:false, window:false, alert:false */
/*globals THREE:false, AudioPlugin:false */

'use strict';

var maxTargetTextUpdateCount = 2;

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

	// --------- #HC
	var canvasElement = $element[0].querySelector('#lpc-canvas');
	var parentElement = $element[0].querySelector('#lpc-canvas-parentSize');
	//console.log('canvas ele: ', canvasElement);

	$scope.lpcRenderer = new LPCRenderer(parentElement, canvasElement, 20);

	$scope.lpcHidden = false;
	$scope.lpcRenderer.doShowSand = $scope.sand;
	$scope.lpcRenderer.doShowSlider = $scope.slider;
	$scope.targetNeedsUpdate = false;
	$scope.targetTextUpdateCount = 0;

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

		function positionForTouch(t) {
			if (t.layerX && t.layerY) {
				var point = {
					x: t.layerX - $scope.lpcRenderer.WIDTH / 2,
					y: t.layerY - $scope.lpcRenderer.HEIGHT / 2
				};
				return point;

			} else {
				var rect = $scope.lpcRenderer.canvas.getBoundingClientRect();
				var point = {
					x: t.pageX - rect.left - $scope.lpcRenderer.WIDTH / 2,
					y: t.pageY - rect.top - $scope.lpcRenderer.HEIGHT / 2
				};
				return point;
			}
		}

		function onTouchStart( e )
		{
			if ($scope.active !== true) return;

			if ($scope.lpcRenderer.doShowSlider === false) return;

			if ($scope.pointerDown === false) {
				$scope.pointerDown = true;

				if (e.type === 'touchstart') {
					$scope.trackedTouch = e.changedTouches[0].identifier;
				}

				if (e.cancellable) e.preventDefault();

				var point = positionForTouch((e.type === 'touchstart') ? e.changedTouches[0] : e);
				var px = point.x + $scope.lpcRenderer.WIDTH / 2;

				var intersects = $scope.lpcRenderer.hitTest(point);
				if (intersects === 'pauseBtn' || intersects === 'targetBtn') {
					handleButtonPress(intersects);
				} else {
					$scope.trackingTarget = true;
					$scope.data.targetF3 = linScale(px, 0, $scope.lpcRenderer.WIDTH, 0, 4500);
					$scope.updateTarget();
				}
			}
		}

		function onTouchMove( e )
		{
			if ($scope.active !== true) return;

			var identifier = ((e.changedTouches !== undefined) ? e.changedTouches[0].identifier : undefined);
			if ($scope.trackedTouch !== undefined && $scope.trackedTouch !== identifier) return;

			if ($scope.trackingTarget) {
				if (e.cancellable) e.preventDefault();

				var element = $scope.lpcRenderer.renderer.domElement;

				var point = positionForTouch((e.changedTouches !== undefined) ? e.changedTouches[0] : e);
				var px = point.x + $scope.lpcRenderer.WIDTH / 2;

				$scope.data.targetF3 = linScale(px, 0, $scope.lpcRenderer.WIDTH, 0, 4500);
				$scope.targetNeedsUpdate = true;
			}
		}

		function onTouchEnd( e ) {
			if ($scope.active !== true) return;

			if (!$scope.pointerDown) return;

			var identifier = ((e.changedTouches !== undefined) ? e.changedTouches[0].identifier : undefined);
			if ($scope.trackedTouch !== undefined && $scope.trackedTouch !== identifier) return;

			if (e.cancellable) e.preventDefault();

			$scope.pointerDown = false;
			$scope.trackedTouch = undefined;
			$scope.trackingTarget = false;
		}


	///////////////////////////////////
	//  RENDER
	///////////////////////////////////
		$scope.animate = function () {
		  if ($scope.active) {

		    if ($scope.lpcRenderer.WIDTH !== $scope.lpcRenderer.parentElement.clientWidth ||
		      $scope.lpcRenderer.HEIGHT !== $scope.lpcRenderer.parentElement.clientHeight
		    ) {
		      $scope.updateCanvasSize();
		    }

		    if ($scope.renderTextSprite) {
		      if (textSprite === undefined) {
		        textSprite = Drawing.makeTextSprite(sliderFz);
		        textSprite.position.set(0, 10, 9);
		        label.add(textSprite);
		      } else {
		        label.remove(textSprite);
		        textSprite = Drawing.makeTextSprite(sliderFz);
		        textSprite.position.set(0, 10, 9);
		        label.add(textSprite);
		      }
		    }

		    if ($scope.pause === false) {
		      $scope.getLPCCoefficients($scope.lpcCoefficientCallback);
		    }

		    //stats.update();
		    window.requestAnimFrame($scope.animate);
		    if ($scope.targetNeedsUpdate) {
		      if ($scope.targetTextUpdateCount >= maxTargetTextUpdateCount) {
		        $scope.targetTextUpdateCount = 0;
		        $scope.updateTarget();
		        $scope.targetNeedsUpdate = false;
		      } else {
		        $scope.targetTextUpdateCount++;
		      }
		    }
		    $scope.lpcRenderer.render();
		  }
		};

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
					console.log('existing targetF3:', res.targetF3)
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

		if ($scope.data.targetF3 === undefined) return;

		var sliderPosition = linScale($scope.data.targetF3, 0, 4500, 0, 1);
		$scope.lpcRenderer.sliderPosition = sliderPosition;
		$scope.lpcRenderer.targetFrequency = $scope.data.targetF3;

    //Update current user's Target F3
    ProfileService.runTransactionForCurrentProfile(function(handle, profile, t) {
      t.update(handle, { targetF3: parseInt($scope.data.targetF3) });
    });
	};

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
	};

	$scope.stopPractice = function() {
		$scope.$emit('stopPractice');
	}

	$scope.showLPC = function() {
		$scope.lpcHidden = false;
	};

	$scope.hideLPC = function() {
		$scope.lpcHidden = true;
	}

	$scope.updateCanvasSize = function() {
		$scope.lpcRenderer.updateDrawingDim();
		$scope.lpcRenderer.updateCameraSize();
		$scope.lpcRenderer.clearScene();
		$scope.lpcRenderer.drawScene();
		setInitialTarget();
	}

	{
		if ('ontouchstart' in window) {
			$scope.lpcRenderer.renderer.domElement.addEventListener('touchstart', onTouchStart, false);
			$scope.lpcRenderer.renderer.domElement.addEventListener('touchmove', onTouchMove, false);
			$scope.lpcRenderer.renderer.domElement.addEventListener('touchcancel', onTouchEnd, false);
			$scope.lpcRenderer.renderer.domElement.addEventListener('touchend', onTouchEnd, false);
		} else {
			$scope.lpcRenderer.renderer.domElement.addEventListener('mousedown', onTouchStart, false);
			window.addEventListener('mousemove', onTouchMove, false);
			window.addEventListener('mouseup', onTouchEnd, false);
		}

		$scope.pause = false;
		$scope.pointerDown = false;

		$scope.updateCanvasSize();
		$scope.active = true;
		setInitialTarget();
		$scope.animate();
	}

	$scope.$on("resetRating", function() {
		$scope.data.rating = 0;
	});

	$scope.$watch('targetF3', function() {
		$scope.updateTarget();
	});


	$scope.myURL = $state.current.name;

	var unsubscribe = $rootScope.$on("$urlChangeStart", function(event, next) {
		if (next === $scope.myURL) {
			$scope.active = true;
			$scope.animate();
			$scope.updateCanvasSize();
			setInitialTarget();
		} else {
			$scope.active = false;
		}
	});

	$scope.$on("$destroy", function() {
		unsubscribe();
	});
});
