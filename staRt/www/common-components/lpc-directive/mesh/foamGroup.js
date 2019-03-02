/* global Mesh:false, svgLoaderToMesh:false */

Mesh.prototype.createFoamGroup = function(dim, graphicsGroup) {
  // console.log( 'create Foam Group');

  // var localDim = dim;

  var foamGroup = new THREE.Group();
  foamGroup.name = 'foamGroup';

  // MESH CALLBACK ---------------------------
  function foamBaseCB() {
    // var s = 1
    // var sY = 1; //0.75;
    // var sX = localDim.W / 100; //
    // foamGroup.scale.set(s, s, 1);

    var xpos = dim.edgeLeft + dim.col_W;
    var ypos = (dim.row_H * -0.75);
    var zpos = 2;
    foamGroup.position.set(xpos, ypos, zpos);

    foamGroup.children.forEach(function (i) {
      i.material.transparent = true;
      i.material.opacity = 0.75;
    });

    graphicsGroup.add(foamGroup);
  }

  // LOAD SVG ---------------------------
  function loadFoamBase() {
    svgLoaderToMesh(
      'img/lpcDir/foamBase.svg',
      'foamBase',
      foamGroup,
      foamBaseCB
    );
  }

  loadFoamBase();
}
