/* global Mesh:false, svgLoaderToMesh:false */

Mesh.prototype.createSlider = function(dim, sliderGroup, materials) {

  /* note: for some reason dim resets a few times when loading, which screws up mesh.scale.set() cuz the transform in the SVG loader ( Matrix3.getInverse() ) can't ever handle 0s. Everthing else seems fine with the normal dim arg.  */

  // var localDim = dim;

  var starGroup = new THREE.Group();
  starGroup.name = 'starGroup';

  // MESHES --------------------------------------
  function createNeedle() {
    var geom = new THREE.PlaneGeometry(2, ((dim.row_H * 1.75) + 3));
    var mat = materials.filter(function (obj) {
      return obj.name === 'yellowMain';
    });

    var mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(0, 4, 4);
    mesh.name = 'needle';

    sliderGroup.add(mesh);
    createNeedleHL();
  }

  function createNeedleHL() {
    var geom = new THREE.PlaneGeometry(1, ((dim.row_H * 1.75) + 3));
    var mat = materials.filter(function (obj) {
      return obj.name === 'yellowHL';
    });

    var mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(-1, 4, 5);
    mesh.name = 'needle';

    sliderGroup.add(mesh);
  }

  // SVG->MESH CALLBACK ---------------------------
  function starCB() {
    // var s = localDim.col_W / 100; // star should be col_W * 1
    var s = 0.853 // (1024 / 12) / 100;
    starGroup.scale.set(s, s, s);

    var xpos = dim.col_W * -0.5;
    var ypos = dim.row_H * -0.75;
    starGroup.position.set(xpos, ypos, 4);

    sliderGroup.add(starGroup);
  }

  // LOAD SVG ---------------------------
  function loadStar() {
    svgLoaderToMesh('img/lpcDir/star.svg', 'star', starGroup, starCB);
  }

  // ---------------------------
  createNeedle();
  loadStar();

  sliderGroup.position.x = dim.defaultTargetX;
  sliderGroup.position.z = 4;
}
