var scene = new THREE.Scene();
// var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
var camera = new THREE.OrthographicCamera( 300 / - 2, 300 / 2, 200 / 2, 200 / - 2, 1, 1000 );
var currentLine;

var renderer = new THREE.WebGLRenderer();
renderer = new THREE.WebGLRenderer({canvas: document.getElementById("lpc-canvas")});
// document.body.appendChild( renderer.domElement );

camera.position.z = 5;

function render() {
	requestAnimationFrame( render );
	renderer.render( scene, camera );
}
render();

function drawLPC(segmentPoints) {
  if (currentLine !== undefined) {
    scene.remove(currentLine);
  }
  var material = new THREE.LineBasicMaterial({
  	color: 0xffffff
  });

  var geometry = new THREE.Geometry();
  for (var i in segmentPoints) {
    geometry.vertices.push(
      new THREE.Vector3(
        (segmentPoints[i][0] - 0.5) * 300,
        (segmentPoints[i][1] - 0.5) * 200,
        segmentPoints[i][2]
      )
    );
  }

  // geometry.vertices.push(
  // 	new THREE.Vector3( -1, 0, 0 ),
  // 	new THREE.Vector3( 0, 1, 0 ),
  // 	new THREE.Vector3( 1, 0, 0 )
  // );

  var line = new THREE.Line( geometry, material );
  scene.add( line );
  currentLine = line;
}
