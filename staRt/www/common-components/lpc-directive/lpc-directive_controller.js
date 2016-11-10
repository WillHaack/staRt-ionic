/*globals console:false, angular:false, window:false, alert:false */
/*globals THREE:false, AudioPlugin:false */

'use strict';

var lpcDirective = angular.module( 'lpcDirective' );

lpcDirective.controller( 'LpcDirectiveController', function( $rootScope, $scope, $state, $stateParams, $element, $timeout, $localForage, ProfileService )
{

	$scope.data = {};

	$scope.$watchCollection('data', function()
	{
		//$scope.$emit('ratingChange', $scope.data.rating);
	})

	console.log('LpcDirectiveController active!');


	///////////////////////////////////
	//  Global Var for THREE Sketch
	///////////////////////////////////

		// THREE OBJECTS 
			var renderer, scene, camera, raycaster; // objects
			//var constrols, stats, axisHelper, camHelper, gridHelper; // helpers
		
		// DOM ELEMENTS
			var element; // this is the 'lpc-directive' element that is called from page or state templates

			var containerDiv; // Hold the "lpc-container" div and its child 'slider & canvas', defined in the lpc directive template, during INIT.

			var firstElt; // Used to locate the the angular element on to which the THREE canvas should be attached. (First element in 'slider & canvas' should always be where the canvas goes.) 

			var canvas; // This is the 'renderer.domElement'. Its id="lpc-canvas". This is the element on which all drawing dimensions are based. 
		
		// DRAWING DIMENSIONS
			var WIDTH, HEIGHT, ASPECT; // dim of renderer.domElement's container (2d DOM coords)
			var LEFT, RIGHT, TOP, BOTTOM; // scene boundaries based on WIDTH & HEIGHT (3d ortho coords)
			var yOffset, waveBottom, waveTop; // wave boundaries, shifts y=0 up due to sand.  Currently, only used to draw sand & slider objects. I'll deal w/ adjusting the wave drawing later.
			var pad, padV, padH, btnRad, btnBox, sliderWidth; 


		//SCENE OBJECTS (meshes, lines, sprites, etc)
			var sand, tempwave, label, star, needle, slider, pauseBtn, targetBtn; 


		// PALETTE & MATERIALS
			var colors = {
				yellowMain: 0xFFC95F,
				yellowLight: 0xFFECCB,
				blueMain: 0x53C8E9,
				blueLight: 0xC5F3FF,
				blueDark: 0x018B9D,
				white: 0xffffff,
				grayTxt: 0x4d4d4d
			};
			// mesh basic materials
			var blueMat, yellowMat, whiteMat, sandMat, blueDarkMat, blueLightMat;

			// line basic materials
			var blueDarkLineMat, peakMat, whiteLineMat, needleMat;


		// USER INTERACTION 
			var mouse; // vector2, stores NDC vals used by raycaster 
			var mouseX; // stores linScaled e.clientX vals used for slider
			var INTERSECTED = undefined;

			var pause = false;
			
			var fzVal; // holds slider val mapped to fz range
			var savedTarget = 3100; // placeholder for user's saved target
			var sliderFz = savedTarget; // position of slider
			//var targetSet = true;

			var textSprite = undefined;
			var renderTextSprite = false;


	///////////////////////////////////
	//  LPC Init
	///////////////////////////////////

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

		element = $element;

		//var containerDiv;
		for (var i=0; i<element.children().length; i++) {
			var e = element.children()[i];
			if (e.nodeName === "DIV" && e.classList.contains("lpc-container"))
				containerDiv = e;
		}
		//var firstElt;
		// var containerDiv;
		// for (var i=0; i<element.children().length; i++) {
		// 	var e = element.children()[i];
		// 	if (e.nodeName === "DIV" && e.classList.contains("slider-and-canvas"))
		// 		containerDiv = e;
		// }
		containerDiv = angular.element(element[0].querySelector('.slider-and-canvas'))[0];

		firstElt = null;

		if (containerDiv.children.length > 0)
			firstElt = containerDiv.children[0];
			
		renderer = new THREE.WebGLRenderer({ antialias: true });

		if (firstElt) {
			containerDiv.insertBefore(firstElt, renderer.domElement);
		} else {
			containerDiv.appendChild(renderer.domElement);
		}

		canvas = renderer.domElement;
		canvas.id = "lpc-canvas";

		// GET DRAWING DIM
	  		getDrawingDim();

	  	// CREATE CAMERA, SCENE, & RENDERER
	        scene = new THREE.Scene();
	        camera = new THREE.OrthographicCamera(LEFT, RIGHT, TOP, BOTTOM, 1, 1000);
			camera.position.set(0, 0, 100);
			camera.lookAt(new THREE.Vector3(0, 0, 0));
			camera.updateProjectionMatrix();
			scene.add(camera);  

			renderer.setPixelRatio( window.devicePixelRatio );
			renderer.setClearColor(0xc5f3ff, 1.0);
			renderer.setSize(WIDTH, HEIGHT);

			$scope.canvas = canvas;
			$scope.renderer = renderer;
			$scope.camera = camera;
			$scope.active = false;

		// MATERIALS, STATIC SHAPES + MESH GROUPS
			matMaker();
			drawScene();

		// USER INTERACTION

		// DEBUGGERS

		// RENDER


	// END INIT


	///////////////////////////////////
	//  DRAWING DIMS & SCALE FX
	///////////////////////////////////
		function getDrawingDim() {

			// These might be needed if the css throws off our current clientWidth & clientHeight measurements
				// waveHolderStyles = window.getComputedStyle(waveHolder);
				// canvasOffset = waveHolderStyles.marginLeft;
				// console.log("offset is: " + canvasOffset);
				
	    	WIDTH = canvas.clientWidth;    	
	    	HEIGHT = canvas.clientHeight;      	
	    	ASPECT = WIDTH/HEIGHT;

	    	// 3d coords
	    	LEFT =  WIDTH/-2; 
	    	RIGHT = WIDTH/2;
	    	TOP = 	HEIGHT/2;
	    	BOTTOM = HEIGHT/-2;

	    	// obj boundaries
	    	yOffset = HEIGHT * 0.15; //shifts y=0 up due to sand
	    	waveBottom = BOTTOM + yOffset; 
	    	//waveTop = TOP - yOffset;
	    	padH = WIDTH * 0.05; // scene padding
	    	padV = HEIGHT * 0.05; // scene padding
	    	
	    	
	    	btnRad = 30; // button radius
	    	btnBox = (padH*2)+btnRad;

	    	sliderWidth = RIGHT-btnBox;

	    	// console logs
		    	// console.log("Top is " + TOP);
		    	// console.log("Bottom is " + BOTTOM);
		    	// console.log("Left is " + LEFT);
		    	// console.log("Right is " + RIGHT);
		    	// console.log("Width is " + WIDTH);
		    	// console.log("Height is " + HEIGHT);
		    	// console.log("SandOffset is " + yOffset);
		}

		function linScale(v, inlow, inhigh, outlow, outhigh) {
			var range = outhigh - outlow;
			var domain = inhigh - inlow;
			var ov = (v - inlow) / domain;
			ov = (ov * range) + outlow;
			return ov;
		}



	///////////////////////////////////
	//  MATERIALS
	///////////////////////////////////
		function matMaker() {

			// basic mesh mats
				blueMat = new THREE.MeshBasicMaterial({ color: colors.blueMain});
				blueMat.side = THREE.DoubleSide;

				yellowMat = new THREE.MeshBasicMaterial({ color: colors.yellowMain});
				//yellowMat.side = THREE.DoubleSide;

				whiteMat = new THREE.MeshBasicMaterial({ color: colors.white});
				//whiteMat.side = THREE.DoubleSide;

				sandMat = new THREE.MeshBasicMaterial({ color: colors.yellowLight});
				//sandMat.side = THREE.DoubleSide; 

			// basic line mats
				peakMat = new THREE.LineBasicMaterial({ color: 0x2095b6 });
				//blueDarkLineMat = new THREE.LineBasicMaterial({ color: 0x2095b6 });

				needleMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3 });
		}


	///////////////////////////////////
	// DRAW SCENE (draws and adds all the non-wave elements)
	///////////////////////////////////
		/* z-order reference
			10 (top): pause/play, target, starfish
			9: sand
			8: sliderLabel
			7: needle
			6: wave
		*/

		function drawScene() {
			
		    //drawTempWave();
		    //scene.add(tempWave);

		    // creates a container to group the slider-things
		    // I couldn't find any info on THREE.group(), so I guess this will hafta do. 
			slider = new THREE.Object3D();
			slider.name = slider;

			// #hc slider range should be 0-4500
			// set pos of slider to user's saved F3 target
			var target = (linScale(savedTarget, 4500, 0, LEFT, RIGHT));
			slider.position.set(target,0,9)
			scene.add(slider);
		    	
			drawNeedle(); //returns 'needle' line mesh
			slider.add(needle);

			drawSand(); //returns 'sand' shape mesh
			scene.add(sand);

			drawLabel(); //returns 'label' shape mesh
			slider.add(label);

			drawStar(); //returns 'star' shape mesh
			slider.add(star);
			
			drawPauseBtn(); //returns 

			drawTargetBtn();  //returns 

			textSprite = makeTextSprite(savedTarget); 
			textSprite.position.set(0,10,9);
			label.add( textSprite );

		} // end draw scene

//--------------------------------------------------------------
	////////////////////////////
	//  Helpers
	////////////////////////////





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

	////////////////////////////
	//  Setup
	////////////////////////////

		// var containerDiv;
		// for (var i=0; i<element.children().length; i++) {
		// 	var e = element.children()[i];
		// 	if (e.nodeName === "DIV" && e.classList.contains("lpc-container"))
		// 		containerDiv = e;
		// }
		// var firstElt;
		// // var containerDiv;
		// // for (var i=0; i<element.children().length; i++) {
		// // 	var e = element.children()[i];
		// // 	if (e.nodeName === "DIV" && e.classList.contains("slider-and-canvas"))
		// // 		containerDiv = e;
		// // }
		// var containerDiv = angular.element(element[0].querySelector('.slider-and-canvas'))[0];

		// var firstElt = null;
		// if (containerDiv.children.length > 0)
		// 	firstElt = containerDiv.children[0];

		// var renderer = new THREE.WebGLRenderer({ antialias: true });
		// if (firstElt) {
		// 	containerDiv.insertBefore(firstElt, renderer.domElement);
		// } else {
		// 	containerDiv.appendChild(renderer.domElement);
		// }

		// var canvas = renderer.domElement;
		// canvas.id = "lpc-canvas";
		// var WIDTH=canvas.clientWidth;
		// var HEIGHT=canvas.clientHeight;
		// var ASPECT = WIDTH/HEIGHT;
		// var camera = new THREE.OrthographicCamera(WIDTH/-2, WIDTH/2, HEIGHT/-2, HEIGHT/2, 1, 1000);
		// var scene = new THREE.Scene();
		// scene.add(camera);
		// camera.position.set(0, 0, 100);
		// camera.lookAt(new THREE.Vector3(0, 0, 0));
		// renderer.setPixelRatio( window.devicePixelRatio );
		// renderer.setClearColor(0xc5f3ff, 1.0);
		// renderer.setSize(WIDTH, HEIGHT);

		// $scope.canvas = canvas;
		// $scope.renderer = renderer;
		// $scope.camera = camera;
		// $scope.active = false;

		// // materials
		// var waveMat = new THREE.MeshBasicMaterial({ color: 0x53C8E9 });
		// waveMat.side = THREE.DoubleSide;
		// var peakMat = new THREE.LineBasicMaterial({ color: 0x2095b6 });

	////////////////////////////
	//  Draw
	////////////////////////////
		var leftEdge, rightEdge, topEdge, bottomEdge;  // scene boundaries
		var peaks, points, frequencyScaling; // incoming data

		var waveGeometry = undefined; // created on demand with first peaks
		var peakGeometry = new THREE.Geometry();
		var maxNumPeaks = 20;
		for (var i=0; i<maxNumPeaks; i++) {
			peakGeometry.vertices.push(new THREE.Vector3(0,0,1));
			peakGeometry.vertices.push(new THREE.Vector3(0,0,1));
		}
		var peakSegments = new THREE.LineSegments(peakGeometry, peakMat);
		peakSegments.geometry.dynamic = true;
		scene.add(peakSegments);
		var waveMesh;
		
		$scope.lpcCoefficientCallback = function(msg) {

			if ($scope.active) {
				WIDTH = renderer.getSize().width;
				HEIGHT = renderer.getSize().height;
				leftEdge = WIDTH/-2;
				rightEdge = WIDTH/2;
				topEdge = HEIGHT/-2;
				bottomEdge = HEIGHT/2;

				points = msg.coefficients;
				peaks = msg.freqPeaks;
				frequencyScaling = msg.freqScale;

				// Make an array of all the topmost points
				var shapeArr = [];
		    	for (var i=0; i<points.length; i++) {
		    		var point = points[i] * HEIGHT/-2;
		    		var px = linScale(i * frequencyScaling, 0, points.length-1, WIDTH/-2, WIDTH/2);
		    		shapeArr.push([px, point]);
		    	}

		    	// Setup the geometry and its faces
		    	if (waveGeometry === undefined) {
		    		var tmpGeometry = new THREE.Geometry();
		    		for (var i=1; i<shapeArr.length; i++) {
			    		tmpGeometry.vertices.push(new THREE.Vector3(shapeArr[i-1][0], bottomEdge, 0));
			    		tmpGeometry.vertices.push(new THREE.Vector3(shapeArr[i][0], shapeArr[i][1], 0));
			    		if (i>0) {shapeArr[i][0]
				    		tmpGeometry.faces.push(new THREE.Face3((i-1)*2, (i-1)*2 + 1, (i-1)*2 + 2));
				    		tmpGeometry.faces.push(new THREE.Face3((i-1)*2 + 2, (i-1)*2 + 1, (i-1)*2 + 3));
				    	}
					}
		    		waveGeometry = new THREE.BufferGeometry().fromGeometry( tmpGeometry );
		    		waveGeometry.dynamic = true;
		    	}

		    	// All this does is explicitly update all of the triangles that are being used to draw the 
		    	// wave geometry. Imagine that between every two adjacent points along the top curve we draw
		    	// a long rectangle with a slanted top. The top-left corner of that rectangle is wave[i-1],
		    	// the top-right corner is wave[i], and the bottom left and bottom right are the same points
		    	// but on the bottom edge of the image. This rectangle strip has four points, but we draw it
		    	// as two triangles. Each of those triangles has three points, so there are 3 * 3 vertices
		    	// to update, for each of 2 triangles, for a total of 18 vertices per every point on the
		    	// wave curve.
		    	for (var i=1; i<shapeArr.length; i++) {
		    		var p = waveGeometry.attributes.position.array;
		    		var idx = (i-1) * 18;
		    		p[idx++] = shapeArr[i-1][0]; // Bottom-left
		    		p[idx++] = bottomEdge;
		    		p[idx++] = 0;
		    		p[idx++] = shapeArr[i-1][0]; // Top-left
		    		p[idx++] = shapeArr[i-1][1];
		    		p[idx++] = 0;
		    		p[idx++] = shapeArr[i][0]; // Top-right
		    		p[idx++] = shapeArr[i][1];
		    		p[idx++] = 0;
		    		p[idx++] = shapeArr[i-1][0]; // Bottom-left
		    		p[idx++] = bottomEdge;
		    		p[idx++] = 0;
		    		p[idx++] = shapeArr[i][0]; // Bottom-right
		    		p[idx++] = bottomEdge;
		    		p[idx++] = 0;
		    		p[idx++] = shapeArr[i][0]; // Top-right
		    		p[idx++] = shapeArr[i][1];
		    		p[idx++] = 0;
		    	}
		    	waveGeometry.attributes.position.needsUpdate = true;

		    	if (waveMesh === undefined) {
		    		waveMesh = new THREE.Mesh(waveGeometry, blueMat);
					waveMesh.name = "wave";
					scene.add( waveMesh );
		    	}

				// Update peaks
				for (var i=0; i<maxNumPeaks; i++) {
					var px=0, py=HEIGHT/2;
					if (i < peaks.length) {
						var peak = peaks[i];
						px = linScale(peak.X, -1, 1, 0, frequencyScaling);
						px = linScale(px, 0, 1, WIDTH/-2, WIDTH/2);
						py = linScale(peak.Y, 1, -1, HEIGHT/-2, HEIGHT/2);
					}
					peakGeometry.vertices[2*i].x = px;
					peakGeometry.vertices[2*i].y = py;
					peakGeometry.vertices[2*i+1].x = px;
					peakGeometry.vertices[2*i+1].y = HEIGHT/2;
				}
				peakGeometry.verticesNeedUpdate = true;
			}
		};

	$scope.animate = function() {
		if ($scope.active) {
			$scope.getLPCCoefficients($scope.lpcCoefficientCallback);
			window.requestAnimFrame($scope.animate);
			renderer.render(scene, camera);
			$scope.updateTarget();
		}
	};

	$scope.scaleContext = function() {
		var renderer = $scope.renderer;
		var canvas = $scope.canvas;
		var camera = $scope.camera;
		var WIDTH = parseInt(renderer.domElement.clientWidth);
		var HEIGHT = parseInt(renderer.domElement.clientHeight);

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

	$scope.animate();
	$scope.data = {};


	////////////////////////////
	//  Interaction & Targets
	////////////////////////////

	function setInitialTarget()
	{
		ProfileService.getCurrentProfile().then(function(res)
		{
			console.log('currentProfile:',res)
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

	setInitialTarget();

	$scope.updateTarget = function()
	{	
		// Move value bubble
		var wrappedElement = angular.element(element);
		var control = wrappedElement.find('input');

		var controlMin = control.attr('min')
		var controlMax = control.attr('max')
		var controlVal = control.val();
		var controlThumbWidth = control.attr('data-thumbwidth');

		var range = controlMax - controlMin;

		var position = ((controlVal - controlMin) / range) * 100;

		var positionOffset = Math.round(controlThumbWidth * position / 100) - (controlThumbWidth / 2);
		var output = control.next('output');

		output
		.css('left', 'calc(' + position + '% - ' + positionOffset + 'px)')
		.text(controlVal);

		// Update current user's Target F3
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
		$scope.animate();

		setInitialTarget();
	});

	$scope.$parent.$on('$ionicView.beforeLeave', function() {
		$scope.active = false;
	});

	$scope.$watch('targetF3', function()
	{
		console.log('target changed to: ', $scope.targetF3);
		//$scope.updateTarget();
	});

// =========================================================




// SHAPE MAKERS ======================================================
    function drawTempWave() {
    	var tempWaveShape = new THREE.Shape();
	    	tempWaveShape.moveTo(LEFT, 0);
	    	tempWaveShape.lineTo(RIGHT, 0);
	    	tempWaveShape.lineTo(RIGHT, waveBottom);
	   		tempWaveShape.lineTo(LEFT, waveBottom);
	    	tempWaveShape.lineTo(LEFT, 0);

	    var tempWaveGeom = new THREE.ShapeGeometry(tempWaveShape); 

    	tempWave = new THREE.Mesh(tempWaveGeom, blueMat);
    	tempWave.name = "tempWave";
    	tempWave.position.set(0,0,6);
    }

    function drawSand() {
    	var sandShape = new THREE.Shape();
	    	sandShape.moveTo(LEFT, waveBottom);
	    	sandShape.lineTo(RIGHT, waveBottom);
	    	sandShape.lineTo(RIGHT, BOTTOM);
	   		sandShape.lineTo(LEFT, BOTTOM);
	    	sandShape.lineTo(LEFT, waveBottom);

	    var sandGeom = new THREE.ShapeGeometry(sandShape); 

    	sand = new THREE.Mesh(sandGeom, sandMat);
    	sand.name = "sand";
    	
    	// Sand's x and y pos are relative to the pos specified in sandDraw, NOT the scene 
    	// Z reflects the shape's actual z pos relative to the scene/the other meshes.
    	sand.position.set(0,0,9);

    	// #st does rm'ing the mesh also rm the shape and the geom???
    	// #st am I supposed to be getting rid of these local things?
    }


    function drawNeedle() {
    	var needleGeom = new THREE.Geometry();

	    needleGeom.vertices.push(
			new THREE.Vector3(0, waveBottom, 7),
			new THREE.Vector3(0, TOP, 7 )
		);

		needle = new THREE.Line(needleGeom, needleMat);
		needle.name = "needle";
    }


    function drawLabel() {
    	var labelWidth = 75;
    	var labelHeight = 35;
    	var labelRad = 10;

		var labelShape = new THREE.Shape();
		roundedRect(labelShape, 0, 0, labelWidth , labelHeight, labelRad);
		
		var labelGeom = new THREE.ShapeGeometry(labelShape); 
    	label = new THREE.Mesh(labelGeom, whiteMat);

		label.position.set(labelWidth/-2, TOP - padH, 8 );
		label.name = "label";
	}


    function drawStar() {
    	var starShape = new THREE.Shape();

    	circle(starShape, 0, 0, 35);

    	var starGeom = new THREE.ShapeGeometry(starShape); 
	    star = new THREE.Mesh(starGeom, yellowMat);

	    star.position.set(0, BOTTOM + (yOffset/2), 10);
	    star.name = "star";

	    return star;  
    } 
	

	function drawPauseBtn() {
		var pauseShape = new THREE.Shape();
		var radius = 30;
		circle(pauseShape, 0, 0, radius);

		var pauseGeom = new THREE.ShapeGeometry(pauseShape); 
	    pauseBtn = new THREE.Mesh(pauseGeom, yellowMat);

	    pauseBtn.position.set(RIGHT-((radius/2)+padH), TOP - ((radius/2)+padV), 10);
	    pauseBtn.name = "pauseBtn";
	    scene.add(pauseBtn);
	}

	
	function drawTargetBtn() {
		var targetShape = new THREE.Shape();
		var radius = 30;
		circle(targetShape, 0, 0, radius);

		var targetGeom = new THREE.ShapeGeometry(targetShape); 
	    targetBtn = new THREE.Mesh(targetGeom, yellowMat);

	    targetBtn.position.set(RIGHT-((radius/2)+padH), BOTTOM+(yOffset/2), 10);
	    targetBtn.name = "targetBtn";
	    scene.add(targetBtn);

	}


	// SHAPE MAKERS > BASIC SHAPES ======================================================
		//https://threejs.org/docs/#Reference/Extras.Core/Path

		function roundedRect(shape, x, y, w, h, r) {
			shape.moveTo( x, y+r);
			shape.lineTo( x, y+h-r);
			shape.quadraticCurveTo( x, y+h, x+r, y+h);
			shape.lineTo( x+w-r, y+h);
			shape.quadraticCurveTo( x+w, y+h, x+w, y+h-r );
			shape.lineTo( x+w, y+r );
			shape.quadraticCurveTo( x+w, y, x+w-r, y );
			shape.lineTo( x+r, y );
			shape.quadraticCurveTo( x, y, x, y+r );
		} 

		// context.arc(x,y,r,inAngle,outAngle);
		function circle(shape, x, y, r) {
			shape.moveTo( x, y );
			shape.absarc( x, y, r, 0, 2*Math.PI);
		}


		// .absellipse ( x, y, xRadius, yRadius, startAngle, endAngle, clockwise, rotation )
		/*  Draw an ellipse absolutely positioned
				x, y -- The absolute center of the ellipse 
				xRadius -- The radius of the ellipse in the x axis
				yRadius -- The radius of the ellipse in the y axis 
				startAngle -- The start angle in radians 
				endAngle -- The end angle in radians 
				clockwise -- Sweep the ellipse clockwise. Defaults to false.
				rotation -- The rotation angle of the ellipse in radians, counterclockwise from the positive X axis. 
				Optional, defaults to 0.
		*/

	// CONTEXT2D TEXT SPRITE ======================================================
		// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D#Text_styles

		// 	var material = new THREE.SpriteMaterial( {
		// 	map: new THREE.CanvasTexture( generateSprite() ),
		// 	blending: THREE.AdditiveBlending
		// } );

		function makeTextSprite(message) {
				
			// styles
			var fontface = "Quicksand";
			var fontsize = 36;
			var color = "#4d4d4d";

			// canvas has to be 256px by 128px
			var canvas2d = document.createElement('canvas');
			canvas2d.width = 256;
			canvas2d.height = 128;
			var ctx = canvas2d.getContext('2d');
			//ctx.font = fontsize + "em" + fontface;
			

		    
		    //use this if you want to draw the label ele in the canvas2d
			// var msgWidth = ctx.measureText( message );
			// var textWidth = msgWidth.width;
			
			// text color

			ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
			ctx.fillRect(0, 0, canvas2d.width, canvas2d.height );
			ctx.font = "20pt Quicksand";
			ctx.fillStyle = color;
			ctx.textAlign = "center";
			ctx.fillText(message, canvas2d.width/2, canvas2d.height/2);

			var spriteMaterial = new THREE.SpriteMaterial( {
				map: new THREE.CanvasTexture( canvas2d ),
			});
			
			textSprite = new THREE.Sprite( spriteMaterial );
			textSprite.scale.set(200,100,1.0);
			textSprite.name = "fzLabel";
			
			return textSprite;	
		}



// close out lpc-directive	

} );
