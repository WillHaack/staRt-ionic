var lpcDirective = angular.module('lpcDirective');

lpcDirective.factory('LPCRenderer', function ( Draw, Mesh )
{
	function LPCRenderer(parentElement, canvasElement, maxNumPeaks)
	{
		this.maxNumPeaks = maxNumPeaks;
		this.materials = undefined;
		this.dim = {};

		this.graphicsGroup = undefined;
		this.sliderGroup = undefined;
		this.bubBtnGroup = undefined;
		this.peaksGroup = undefined;
		this.waveGroup = undefined;
		this.waveMesh = undefined;

		this.initialize(parentElement, canvasElement);
	}

	Object.defineProperty(LPCRenderer.prototype, 'sliderPosition', {
		set: function sliderPosition(s) {
			if (s > 1) s = 1;
			if (s < 0) s = 0;

			if (this.sliderGroup !== undefined) {
				this.sliderGroup.position.x =
					this.linScale( s, 0, 1,
						this.dim.wave.edgeLeft,
						this.dim.wave.edgeRight
					);
			}
		}
	});

	/*
	Object.defineProperty(LPCRenderer.prototype, 'doShowSlider', {
		get: function() {
			return this._doShowSlider;
		},
		set: function(slider) {
			this._doShowSlider = slider;
			if (this.slider !== undefined) this.slider.visible = slider;
		}
	});
	*/

	Object.defineProperty(LPCRenderer.prototype, 'beachScene', {
		get: function() {
			return this._beachScene;
		},
		set: function( beach ) {
			if (this.beach !== undefined) {
				return this._beachScene = false;
			} else {
				return this._beachScene = beach;
			}
		}
	});


	LPCRenderer.prototype.linScale = function(v, inlow, inhigh, outlow, outhigh) {
		return Draw.linScale(v, inlow, inhigh, outlow, outhigh);
	};

	// ===============================================
	// SCENE SET UP ----------------------------------

	LPCRenderer.prototype.updateDrawingDim = function()
	{
		this.dim.W = this.parentElement.clientWidth;
		this.dim.H = this.parentElement.clientHeight;
		this.dim.aspect = this.dim.W / this.dim.H;

		this.dim.edgeLeft = this.dim.W / -2;
		this.dim.edgeRight = this.dim.W / 2;
		this.dim.edgeTop = this.dim.H / 2;
		this.dim.edgeBottom = this.dim.H / -2;

		this.dim.row_H = this.dim.H / 4;
		this.dim.col_W = this.dim.W / 12;

		if (this._beachScene) {
			//console.log( 'this is beachScene');
			// wave boundaries
			this.dim.wave = {
				edgeLeft: this.dim.edgeLeft + (this.dim.col_W * 3),
				edgeTop: this.dim.edgeTop - (this.dim.row_H * 1.25),
				edgeRight: this.dim.edgeRight - (this.dim.col_W * 2),
				edgeBottom: this.dim.edgeBottom + (this.dim.row_H * 1.25)
			};
		} else {
			//console.log( 'not beachScene');
			// wave boundaries are same as parent ele
			this.dim.wave = {
				edgeLeft: this.dim.edgeLeft,
				edgeTop: this.dim.edgeTop,
				edgeRight: this.dim.edgeRight,
				edgeBottom: this.dim.edgeBottom
			};
		}
	};

	LPCRenderer.prototype.buildStage = function()
	{
		this.scene = new THREE.Scene();
		this.camera = new THREE.OrthographicCamera(this.dim.edgeLeft, this.dim.edgeRight, this.dim.edgeTop, this.dim.edgeBottom, 1, 1000);
		this.scene.add(this.camera);
	};

	LPCRenderer.prototype.updateCameraSize = function()
	{
		// this.renderer.setPixelRatio( 1 );
		// this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize(this.dim.W, this.dim.H);
		this.renderer.setClearColor( 0x000000, 0 );

		this.camera.position.set(0, 0, 100);
		this.camera.aspect = this.dim.aspect;
		this.camera.lookAt(new THREE.Vector3(0, 0, 0));
		this.camera.left = this.dim.edgeLeft;
		this.camera.top = this.dim.edgeTop;
		this.camera.right = this.dim.edgeRight;
		this.camera.bottom = this.dim.edgeBottom;
		this.camera.updateProjectionMatrix();
	};

	LPCRenderer.prototype.buildMaterials = function()
	{
		if (this.materials != undefined) { this.materials= undefined; }

		this.materials = [];

		var commonColors = [
			{ name: 'blueMain', color: 0x53C8E9 },
			{ name: 'aquaMain', color: 0x50d3d6 },
			{ name: 'yellowMain', color: 0xFFC95F },
			{ name: 'yellowHL', color: 0xffe592 },
			{ name: 'whitePure', color: 0xffffff },
			{ name: 'bubShad', color: 0xb4e9ed },
			{ name: 'bubBg', color: 0xf0f9fc },
			{ name: 'ropeDark', color: 0xe3d5ba },
			{ name: 'ropeLight', color: 0xf3e7cd }
		]; // end basicMats

		// LINE MAT
		this.materials.push( new THREE.LineBasicMaterial({
			color: 0x018B9D,
			name:'peakMat'
		}));

		// BASIC MATS
		for(var i=0; i<commonColors.length; i++) {
			var item = commonColors[i];
			var mat = new THREE.MeshBasicMaterial({
				color: item.color,
				name: item.name,
				side: THREE.DoubleSide,
			});
			this.materials.push(mat);
		}
	};

	// ===============================================
	// DYNAMIC MESHES: CREATE & UPDATE 	--------------

	LPCRenderer.prototype.createPeakSegments = function() {

		if (this.peaksGroup === !undefined) return;

		var peakGeometry = new THREE.Geometry();
		for (var i=0; i < this.maxNumPeaks; i++) {
			peakGeometry.vertices.push(new THREE.Vector3(0,0,3));
			peakGeometry.vertices.push(new THREE.Vector3(0,0,3));
		}

		var mat = this.materials.filter(function (obj) {
			return obj.name === 'peakMat';
		});

		var peakSegments = new THREE.LineSegments(peakGeometry, mat[0]);
		peakSegments.name = 'peaks';
		peakSegments.geometry.dynamic = true;

		this.peaksGroup.add(peakSegments);
		//return peakSegments;
	};

	LPCRenderer.prototype.createWaveMesh = function() {
	/* Sets up an empty geom to recieve updates
	// from AudioPlugin and scene changes	*/
		var pointCount = 256;

		// this.waveGroup is defined on drawScene()
		if (this.waveGroup === undefined) return;
		if (this.waveMesh === !undefined) return;

		// Make an array of all the topmost points
		var emptyShapeArr = [];
		for (var i=0; i<pointCount; i++) {
			var point = this.dim.wave.edgeTop;
			var px = this.linScale(i, 0, pointCount-1, this.dim.wave.edgeLeft, this.dim.wave.edgeRight);
			emptyShapeArr.push([px, point]);
		}

		// Create geometry and its faces
		if (this.waveGeometry === undefined) {
			var tmpGeometry = new THREE.Geometry();

			for (var i=1; i<emptyShapeArr.length; i++) {
				tmpGeometry.vertices.push(new THREE.Vector3(
					emptyShapeArr[i-1][0], this.dim.wave.edgeBottom, 0));

				tmpGeometry.vertices.push(new THREE.Vector3(
					emptyShapeArr[i][0], emptyShapeArr[i][1], 0));

				if (i>0) {
					tmpGeometry.faces.push(new THREE.Face3((i-1)*2, (i-1)*2 + 1, (i-1)*2 + 2));
					tmpGeometry.faces.push(new THREE.Face3((i-1)*2 + 2, (i-1)*2 + 1, (i-1)*2 + 3));
				}
			}

			this.waveGeometry = new THREE.BufferGeometry().fromGeometry( tmpGeometry );
			this.waveGeometry.dynamic = true;
		}
	}; // createWaveMesh


	LPCRenderer.prototype.updateWave = function(points, peaks, frequencyScaling)
	{
		if (this.peaksGroup === undefined) return;

		// An array to hold incoming data for topmost points
		var shapeArr = [];
		for (var i=0; i<points.length; i++) {
			var point = points[i] * this.dim.wave.edgeTop;
			var px = this.linScale(i * frequencyScaling, 0, points.length-1, this.dim.wave.edgeLeft, this.dim.wave.edgeRight);
			shapeArr.push([px, point]);
		}

		/* TLDR; Update waveGeometry.attributes with new data from the shapeArr
				All this does is explicitly update all of the triangles that are being used to draw the
				wave geometry. Imagine that between every two adjacent points along the top curve we draw
				a long rectangle with a slanted top. The top-left corner of that rectangle is wave[i-1],
				the top-right corner is wave[i], and the bottom left and bottom right are the same points
				but on the bottom edge of the image. This rectangle strip has four points, but we draw it
				as two triangles. Each of those triangles has three points, so there are 3 * 3 vertices
				to update, for each of 2 triangles, for a total of 18 vertices per every point on the
				wave curve.
		*/

		for (var i=1; i<shapeArr.length; i++) {
			var p = this.waveGeometry.attributes.position.array;
			var idx = (i-1) * 18;
			p[idx++] = shapeArr[i-1][0]; // Bottom-left
			p[idx++] = this.dim.wave.edgeBottom; //bottomEdge;
			p[idx++] = 0;
			p[idx++] = shapeArr[i-1][0]; // Top-left
			p[idx++] = shapeArr[i-1][1];
			p[idx++] = 0;
			p[idx++] = shapeArr[i][0]; // Top-right
			p[idx++] = shapeArr[i][1];
			p[idx++] = 0;
			p[idx++] = shapeArr[i-1][0]; // Bottom-left
			p[idx++] = this.dim.wave.edgeBottom; //bottomEdge;
			p[idx++] = 0;
			p[idx++] = shapeArr[i][0]; // Bottom-right
			p[idx++] = this.dim.wave.edgeBottom; //bottomEdge;
			p[idx++] = 0;
			p[idx++] = shapeArr[i][0]; // Top-right
			p[idx++] = shapeArr[i][1];
			p[idx++] = 0;
		}
		this.waveGeometry.attributes.position.needsUpdate = true;

		if (this.waveMesh === undefined) {
			if (this._beachScene) {
				this.waveMesh = new THREE.Mesh(this.waveGeometry, this.materials[2]);
			} else { // if ( !beachScene )
				this.waveMesh = new THREE.Mesh(this.waveGeometry, this.materials[1]);
			} // end ( !beachScene )
			this.waveGroup.add( this.waveMesh );
		} // end if (this.waveMesh === undefined)

		this.updatePeaks( peaks, frequencyScaling );
	}; // end updateWave();

	// updatePeaks() should only be called from w/in updateWave()
	LPCRenderer.prototype.updatePeaks = function(peaks, frequencyScaling)
	{
		var peakSegments = this.scene.getObjectByName('peaks');

		for (var i = 0; i < this.maxNumPeaks; i++) {
			var px = 0, py = this.dim.wave.edgeBottom;
			if (i < peaks.length) {
				var peak = peaks[i];
				px = this.linScale(peak.X, -1, 1, 0, frequencyScaling);
				px = this.linScale(px, 0, 1, this.dim.wave.edgeLeft, this.dim.wave.edgeRight);
				py = this.linScale(peak.Y, 1, -1, this.dim.wave.edgeTop, this.dim.wave.edgeBottom);
			}
			peakSegments.geometry.vertices[2*i].x = px;
			peakSegments.geometry.vertices[2*i].y = py;
			peakSegments.geometry.vertices[2*i+1].x = px;
			peakSegments.geometry.vertices[2*i+1].y = this.dim.wave.edgeBottom;
		}
		peakSegments.geometry.verticesNeedUpdate = true;
	}; // updatePeaks()


	// ===============================================
	// COMPOSE THE SCENE -----------------------------

	LPCRenderer.prototype.drawScene = function()
	{
		this.peaksGroup = new THREE.Group();
		this.peaksGroup.name = 'peaksGroup';

		this.waveGroup = new THREE.Group();
		this.waveGroup.name = 'waveGroup';

		if (this._beachScene) {
			this.graphicsGroup = new THREE.Group();
			this.graphicsGroup.name = 'graphicsGroup';

			this.sliderGroup = new THREE.Group();
			this.sliderGroup.name = 'sliderGroup';

			this.bubBtnGroup = new THREE.Group();
			this.bubBtnGroup.name = 'bubBtnGroup';

			/* --------------------------------------------------
				Synchronously makes each non-dynamic mesh and
				adds them to their Group, and then to the Scene

				ARGS:
						- All 'Mesh.create' functions need:
								1.) the current dim,
								2.) a parent Group
						- 'Mesh.create' methods that do NOT reply entirely on the
							svgLoaderToMesh will need:
							3.) a material in this.materials
							4.) any req'd shape helpers from Draw
				*/

			Mesh.createFoamGroup( this.dim, this.graphicsGroup );

			var roundedRect = Draw.roundedRect;
			Mesh.createPostLeft( this.dim, this.graphicsGroup, this.materials, roundedRect );

			Mesh.createPostRight( this.dim, this.graphicsGroup );

			Mesh.createBubBtn( this.dim, this.bubBtnGroup, this.materials );
			this.scene.add( this.bubBtnGroup );

			Mesh.createSlider( this.dim, this.sliderGroup, this.materials );
			this.scene.add( this.sliderGroup );

			// ----------------------------------
			this.graphicsGroup.position.z = 2;
			this.scene.add( this.graphicsGroup );

			this.createWaveMesh();
			this.createPeakSegments();
			this.peaksGroup.position.set(0, -5, 1);
			this.waveGroup.position.set(0, -5, 0);

		} else {
			console.log( 'Beach is FALSE');
			this.createWaveMesh();
			this.createPeakSegments();
		}
		this.scene.add(this.waveGroup);
		this.scene.add(this.peaksGroup);
	};

	LPCRenderer.prototype.clearScene = function()
	{
		this.scene.remove( this.graphicsGroup );
		this.scene.remove( this.sliderGroup );
		this.scene.remove( this.bubBtnGroup );
		this.scene.remove( this.peaksGroup );
		this.waveMesh === undefined;
		this.peaksGroup = undefined;
	};

	// ================================================
	// EVERYTHING ELSE --------------------------------

	// Really simple hittest that just returns the name of the hit object, if any
	LPCRenderer.prototype.hitTest = function(point)
	{
		// NDC for raycaster. raycaster will ONLY accept NDC for mouse events
		point.x = 2 * (point.x / this.canvas.clientWidth );
		point.y = (( point.y / this.canvas.clientHeight ) * -2);

		// gives the raycaster coords from mouse (NDC) & cam (world) positions
		this.raycaster.setFromCamera(point, this.camera);

		var intersects = this.raycaster.intersectObjects(this.scene.children, true); // cast a ray & get an array of things that it hits. 'recursive = true' is necessary to autoloop thru the descendants of grouped objs (i.e. scence.children's children)
		//console.log(intersects.length);
		if (intersects.length > 0) { // if the ray hits things
			for ( var i = 0; i < intersects.length; i++ ) {

				var INTERSECTED = intersects[i];

				return INTERSECTED.object.name;
			}
		}
	};

	LPCRenderer.prototype.render = function() {
		this.renderer.render(this.scene, this.camera);
	};

	LPCRenderer.prototype.initialize = function(parentElement, canvasElement)
	{
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas: canvasElement });
		// this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setPixelRatio( 1 );

		this.parentElement = parentElement;
		this.canvas = canvasElement;
		this.canvas.id = 'lpc-canvas';

		this.savedTarget = 2247;

		this.updateDrawingDim();
		this.buildStage();
		this.updateCameraSize();
		this.buildMaterials();
		//this.drawScene(); is called from the controller on scene change

		this.raycaster = new THREE.Raycaster();
	};

	LPCRenderer.prototype.destroy = function() {
		delete this.renderer;
		delete this.canvas;

		// Remove all children
		while (this.scene.children.length) {
			this.scene.remove(this.scene.children[0]);
		}

		var disposables = ['geometries', 'materials'];
		for (var k = 0; k < disposables.length; k++) {
			var junk = this[disposables[k]];
			for (var i=0; i<junk.length; i++) {
				junk[i].dispose();
			}
		}

		//this.geometries = [];
		this.materials = [];
	};

	return LPCRenderer;
});
