/* global Mesh:false, svgLoaderToMesh:false */

Mesh.prototype.createBubBtn = function(dim, bubBtnGroup, materials) {
	//console.log( 'create BubBtn');

	var pauseGroup, playGroup;

	var seg = 32;
	var bubScale = 0.33;
	var bubRadius = dim.col_W * bubScale;

	function createBubs() {

		function createBubShad() {
			var geom = new THREE.CircleGeometry( bubRadius, seg);
			var mat = materials.filter(function (obj) {
				return obj.name === 'bubShad';
			});

			var mesh = new THREE.Mesh(geom, mat);
			mesh.position.set(2, -2, 6);
			mesh.name = 'bubBtn';

			bubBtnGroup.add(mesh);
		}

		function createBubBg() {
			var geom = new THREE.CircleGeometry( bubRadius, seg);
			var mat = materials.filter(function (obj) {
				return obj.name === 'bubBg';
			});

			var mesh = new THREE.Mesh(geom, mat);
			mesh.position.set(0, 0, 7);
			mesh.name = 'bubBtn';

			bubBtnGroup.add(mesh);
		}

		function createBubHl() {
			var r = dim.col_W * 0.08;

			var geom = new THREE.CircleGeometry(r, seg);
			var mat = materials.filter(function (obj) {
				return obj.name === 'whiteMat';
			});

			var mesh = new THREE.Mesh(geom, mat);
			mesh.position.set(-9, 12, 8);
			mesh.name = 'bubBtn';

			bubBtnGroup.add(mesh);
		}

		createBubShad();
		createBubBg();
		createBubHl();

		bubBtnGroup.position.set(dim.col_W * 3.25, (dim.row_H - (bubRadius/2) + 6), 6);
	} // end createBubs


	// ----------------------------------------
	function createPauseBtn() {
		pauseGroup = new THREE.Group();
		pauseGroup.name = 'pauseGroup';

		var s = bubScale + 0.1;

		svgLoaderToMesh(
			'img/lpcDir/pauseIcon.svg',
			'pauseIcon',
			pauseGroup
		);

		pauseGroup.scale.set(s, s, s);
		pauseGroup.position.set(-15, 15, 9);
		pauseGroup.visible = true;

		bubBtnGroup.add(pauseGroup);
	} // createPauseBtn()

	function createPlayBtn() {
		playGroup = new THREE.Group();
		playGroup.name = 'playGroup';
		var s = bubScale + 0.1; //arbitrary scale factor

		svgLoaderToMesh(
			'img/lpcDir/playIcon.svg',
			'playIcon',
			playGroup
		);

		playGroup.scale.set(s, s, s);
		playGroup.position.set(-13, 13, 9);
		playGroup.visible = false;

		bubBtnGroup.add(playGroup);
	} // createPlayBtn()


	// ---------------------------
	createBubs();
	createPauseBtn();
	createPlayBtn();
};
