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
		var peaks = [];

		lpc.coefficentCallback = function(msg) {
			points = msg.coefficients;
			peaks = msg.freqPeaks;
			frequencyScaling = msg.freqScale;
		};

		lpc.preload = function() {
		};

		lpc.setup = function() {
			myCanvas = lpc.createCanvas(screen.width, screen.height/2, lpc.WEBGL);
			myCanvas.parent(element.children()[0]);
			var width = screen.width;
			var height = screen.height/2.0;
			lpc.ortho(-width, width, -height, height);
			lpc.frameRate(myFrameRate);
		};

		lpc.draw = function() {
			lpc.background('#00ff00');
			lpc.line(-1, 0, 1, 1, 0, 1);
			//$scope.getLPCCoefficients(lpc.coefficentCallback);
			lpc.strokeWeight(1);
			lpc.noFill();

			return;

      // Not sure exactly how the points are meant to be scaled...
      var scaleFac = -1.0;

			// First draw the peaks, so that they'll appear behind
			lpc.stroke('#0000ff');
			for (var i=0; i<peaks.length; i++) {
				var px = peaks[i].X;
				px = (px * (myCanvas.width/2) + (myCanvas.width/2)) * frequencyScaling;
				var py = peaks[i].Y * scaleFac;
				py = py * (myCanvas.height/2) + (myCanvas.height/2);
				lpc.line(px, myCanvas.height, px, py);
			}

			lpc.stroke('#00ff00');
			lpc.beginShape();
      for (i=0; i<points.length; i++) {
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
