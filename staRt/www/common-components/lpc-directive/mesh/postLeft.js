/* global Mesh:false, svgLoaderToMesh:false */

Mesh.prototype.createPostLeft = function(dim, graphicsGroup, materials, roundedRect) {
	//console.log( 'create postLeft!');

	var postBigGroup = new THREE.Group();
	postBigGroup.name = 'postLeftGroup';

	var ropeGroup = new THREE.Group();
	ropeGroup.name = 'ropeGroup';

	var fzSignGroup = new THREE.Group();
	fzSignGroup.name = 'fzSignGroup';

	function createRopes() {
		var ropeGroupTop = new THREE.Group();
		var r = 5;
		var h = dim.row_H * 0.09;

		function createRopeBG() {
			var w = dim.col_W * 0.78;

			var shape = new THREE.Shape();
			// roundedRect: (shape, x, y, w, h, r)
			shape = roundedRect(shape, 0, 0, w, h, r);

			var geom = new THREE.ShapeGeometry(shape);
			var mat = materials.filter(function (obj) {
				return obj.name === 'ropeDark';
			});

			var rope = new THREE.Mesh(geom, mat);
			rope.position.set(0, 0, 2);

			ropeGroupTop.add(rope);
		}

		function createRopeHL() {
			var w = dim.col_W * 0.4;

			var shape = new THREE.Shape();
			shape = roundedRect(shape, 0, 0, w, h, r);
			var geom = new THREE.ShapeGeometry(shape);
			var mat = materials.filter(function (obj) {
				return obj.name === 'ropeLight';
			});

			var ropeHL = new THREE.Mesh(geom, mat);
			ropeHL.position.set(0, 0, 3);

			ropeGroupTop.add(ropeHL);
		}

		createRopeBG();
		createRopeHL();

		var ropeGroupBottom = ropeGroupTop.clone();
		ropeGroupBottom.position.set(-1, -14, 0);
		ropeGroupBottom.rotation.set(0, 0, -0.1);

		ropeGroup.add(ropeGroupTop, ropeGroupBottom);

		var xpos = dim.col_W * -3.65;
		var ypos = dim.row_H * -0.4;
		ropeGroup.position.set(xpos, ypos, 4);
		ropeGroup.rotation.set(0, 0, -0.1);

		graphicsGroup.add(ropeGroup);
	} // end create_ropes()


	// MESH CALLBACKS ---------------------------
	function postBigCB() {
		// var s = 0.75;
		// postBigGroup.scale.set(s, s, s);

		var xpos = (dim.col_W * -3.75) - 4;
		var ypos = (dim.row_H * 0.5);
		var zpos = 3;
		var zrot = 0;
		postBigGroup.position.set(xpos, ypos, zpos);
		postBigGroup.rotation.set(0, 0, zrot);

		graphicsGroup.add(postBigGroup);

		createRopes();
	}

	function fzSignCB() {
		// var s = 0.75;
		// fzSignGroup.scale.set(s, s, s);

		var xpos = dim.col_W * -3.8;
		var ypos = dim.row_H * 0.23;
		var zpos = 6;
		var zrot = 0;
		fzSignGroup.position.set(xpos, ypos, zpos);
		fzSignGroup.rotation.set(0, 0, zrot);

		graphicsGroup.add(fzSignGroup);
	}

	// LOAD SVG ---------------------------
	function loadPostBig() {
		svgLoaderToMesh('img/lpcDir/postBig.svg', 'postBig', postBigGroup, postBigCB);
	}

	function loadFzSign() {
		svgLoaderToMesh('img/lpcDir/fzSign.svg', 'fzSign', fzSignGroup, fzSignCB);
	}

	// ----------------------------------------
	//createPost();
	loadPostBig();
	loadFzSign();
};
