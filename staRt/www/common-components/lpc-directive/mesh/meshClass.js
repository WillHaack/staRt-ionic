function Mesh() {
	//this.hello = () => console.log('LETS MAKE SOME MESHES!');
} // end Mesh Constructor

// Mesh is just a class through which to access each static mesh Group's 'create' function.
// Rationale: its easier just to attach just 1 object, 'Mesh,' to the lpcDirective.
// The code for each mesh group is in lpc-directive/meshes/.

// All the Mesh.create fx are called from LPCRenderer.drawScene()


// EXPORTS =======================================
var lpcDirective = angular.module('lpcDirective');
lpcDirective.value('Mesh', new Mesh());
