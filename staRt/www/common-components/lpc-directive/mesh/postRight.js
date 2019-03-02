/* global Mesh:false, svgLoaderToMesh:false */

Mesh.prototype.createPostRight = function(dim, graphicsGroup) {
  //console.log( 'create postRight!');

  var postRightGroup = new THREE.Group(); // parent group
  postRightGroup.name = 'postRightGroup';

  var postSmallGroup = new THREE.Group(); // 3 mesh
  postSmallGroup.name = 'postSmallGroup';

  var resetBtnGroup = new THREE.Group(); // 5 mesh
  resetBtnGroup.name = 'resetBtnGroup';

  // MESH CALLBACKS ---------------------------
  function postSmallCB() {
    // postSmallGroup.scale.set(s, s, s);

    var xpos = dim.col_W * 3.97;
    var ypos = dim.row_H * -0.31;
    var zpos = 1;
    var zrot = -0.09;
    postSmallGroup.position.set(xpos, ypos, zpos);
    postSmallGroup.rotation.set(0, 0, zrot);
  }

  function resetBtnCB() {
    // resetBtnGroup.scale.set(s, s, s);

    var xpos = dim.col_W * 3.52;
    var ypos = dim.row_H * -0.365;
    var zpos = 2;
    var zrot = -0.09;
    resetBtnGroup.position.set(xpos, ypos, zpos);
    resetBtnGroup.rotation.set(0, 0, zrot);
  }

  // LOAD SVG ---------------------------
  function loadPostSmall() {
    svgLoaderToMesh('img/lpcDir/postSmall.svg', 'postSmall', postSmallGroup, postSmallCB);
  }
  function loadresetBtn() {
    svgLoaderToMesh('img/lpcDir/signWood.svg', 'resetBtn', resetBtnGroup, resetBtnCB);
  }

  // ---------------------------
  loadPostSmall();
  loadresetBtn();

  postRightGroup.add(postSmallGroup, resetBtnGroup);
  postRightGroup.position.z = 3;

  graphicsGroup.add(postRightGroup);
}
