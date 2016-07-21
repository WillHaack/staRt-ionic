/*globals console:false, angular:false, window:false, alert:false */
/*globals THREE:false, AudioPlugin:false */

'use strict';

var lpcDirective = angular.module( 'lpcDirective' );

lpcDirective.controller( 'LpcDirectiveController', function( $rootScope, $scope, $state, $stateParams, $element )
{

	console.log('LpcDirectiveController active!');

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

	var element = $element;
	var WIDTH=800, HEIGHT=600;

	$scope.getLPCCoefficients = function(cb) {
		if (window.AudioPlugin !== undefined) {
			AudioPlugin.getLPCCoefficients(cb);
		}
	};

	var ASPECT = WIDTH/HEIGHT;
	var camera = new THREE.OrthographicCamera(WIDTH/-2, WIDTH/2, HEIGHT/-2, HEIGHT/2, 1, 1000);
	var scene = new THREE.Scene();
	scene.add(camera);
	camera.position.set(0, 0, 100);
	camera.lookAt(new THREE.Vector3(0, 0, 0));
	var renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize(WIDTH, HEIGHT);
	element.append(renderer.domElement);

	var line;
	var peaks, points, frequencyScaling;
	var peakSegments;

	$scope.lpcCoefficientCallback = function(msg) {
		points = msg.coefficients;
		peaks = msg.freqPeaks;
		frequencyScaling = msg.freqScale;
		if (line === undefined) {
			var material = new THREE.LineBasicMaterial({
				color: 0x0000ff
			});
			var geometry = new THREE.Geometry();
			for (var i=0; i<points.length; i++) {
				var point = points[i];
				var px = linScale(i*frequencyScaling, 0, points.length-1, WIDTH/-2, WIDTH/2);
				geometry.vertices.push(new THREE.Vector3(px, 0, 0));
			}
			line = new THREE.Line(geometry, material);
			line.geometry.dynamic = true;
			scene.add(line);
		}

		if (peakSegments === undefined) {
			var material = new THREE.LineBasicMaterial({
				color: 0x00ff00
			});
			var geometry = new THREE.Geometry();
			peakSegments = new THREE.LineSegments(geometry, material);
			scene.add(peakSegments);
		}
	};

	$scope.update = function() {
		if (line !== undefined) {
			for (var i=0; i<points.length; i++) {
				var px = linScale(i*frequencyScaling, 0, points.length-1, WIDTH/-2, WIDTH/2);
				var py = linScale(points[i], 1, -1, HEIGHT/-2, HEIGHT/2);
				line.geometry.vertices[i].set(px, py, 0);
			}
			line.geometry.verticesNeedUpdate = true;
		}

		if (peaks !== undefined) {
			var geometry = new THREE.Geometry();
			for (var i=0; i<peaks.length; i++) {
				var peak = peaks[i];
				var px = linScale(peak.X, -1, 1, 0, frequencyScaling);
				px = linScale(px, 0, 1, WIDTH/-2, WIDTH/2);
				var py = linScale(peak.Y, 1, -1, HEIGHT/-2, HEIGHT/2);
				var v1 = new THREE.Vector3(px, py, 1);
				var v2 = new THREE.Vector3(px, HEIGHT/2, 1);
				geometry.vertices.push(v1);
				geometry.vertices.push(v2);
			}
			peakSegments.geometry = geometry;
			peakSegments.geometry.verticesNeedUpdate = true;
		}
	};

	$scope.animate = function() {
		$scope.getLPCCoefficients($scope.lpcCoefficientCallback);
		window.requestAnimFrame($scope.animate);
		$scope.update();
		renderer.render(scene, camera);
	};

	$scope.animate();

} );
