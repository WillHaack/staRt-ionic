'use strict';

var lpcDirective = angular.module( 'lpcDirective' );


lpcDirective.controller( 'LpcDirectiveController', function( $rootScope, $scope, $state, $stateParams, $element )
{

	console.log('LpcDirectiveController active!');

	var element = $element;

	$scope.getLPCCoefficients = function(cb) {
		if (window.AudioPlugin !== undefined) {
			AudioPlugin.getLPCCoefficients(cb);
		}
	};

	//Start lpc drawer
	var sketch = function(lpc) {

		var url;
		var myCanvas;
		var myFrameRate = 30;
		var running = true;
		var frequencyScaling = 1.0;
		var points = [];

		lpc.coefficentCallback = function(msg) {
			points = msg.coefficients;
			frequencyScaling = msg.freqScale;
		};

		lpc.preload = function() {
		};

		lpc.setup = function() {
			myCanvas = lpc.createCanvas(screen.width, screen.height/2);
			myCanvas.parent(element.children()[0]);
			lpc.frameRate(myFrameRate);
		};

		lpc.draw = function() {
			lpc.background('#aaffaa');
			$scope.getLPCCoefficients(lpc.coefficentCallback);
			lpc.stroke('#000000');
			lpc.strokeWeight(3);
			lpc.noFill();
			lpc.beginShape();

      // Not sure exactly how the points are meant to be scaled...
      var scaleFac = -1.0;

      for (var i=0; i<points.length; i++) {
      	var px = i / (points.length) * myCanvas.width * frequencyScaling;
      	var py = points[i] * scaleFac;
      	py = py * (myCanvas.height/2) + (myCanvas.height/2);
      	lpc.vertex(px, py);
      }
      lpc.endShape();
  };

  lpc.mouseClicked = function() {
  };

  lpc.stopDraw = function() {
  	lpc.noLoop();
  	running = false;
  };

  lpc.startDraw = function() {
  	lpc.loop();
  	running = true;
  };
};
$scope.myP5 = new p5(sketch);

} );
