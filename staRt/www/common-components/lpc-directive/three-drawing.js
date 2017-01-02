var lpcDirective = angular.module('lpcDirective');

lpcDirective.value('Drawing', new Drawing());

var canvas2d = document.createElement('canvas');
canvas2d.width = 256;
canvas2d.height = 128;

function Drawing() { }

// SHAPE MAKERS > BASIC SHAPES ======================================================
// https://threejs.org/docs/#Reference/Extras.Core/Path
Drawing.prototype.roundedRect = function(shape, x, y, w, h, r)
{
	shape.moveTo( x, y+r);
	shape.lineTo( x, y+h-r);
	shape.quadraticCurveTo( x, y+h, x+r, y+h);
	shape.lineTo( x+w-r, y+h);
	shape.quadraticCurveTo( x+w, y+h, x+w, y+h-r );
	shape.lineTo( x+w, y+r );
	shape.quadraticCurveTo( x+w, y, x+w-r, y );
	shape.lineTo( x+r, y );
	shape.quadraticCurveTo( x, y, x, y+r );
};

Drawing.prototype.circle = function(shape, x, y, r)
{
	shape.moveTo( x, y );
	shape.absarc( x, y, r, 0, 2*Math.PI);
};

// CONTEXT2D TEXT SPRITE ======================================================
// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D#Text_styles
Drawing.prototype.makeTextSprite = function(message)
{
	var fontface = "Quicksand";
	var fontsize = 36;
	var color = "#4d4d4d";

	// canvas has to be 256px by 128px
	var ctx = canvas2d.getContext('2d');
	ctx.clearRect(0, 0, 256, 128);
	//ctx.font = fontsize + "em" + fontface;

	//use this if you want to draw the label ele in the canvas2d
	// var msgWidth = ctx.measureText( message );
	// var textWidth = msgWidth.width;

	// text color

	// ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
	// ctx.fillRect(0, 0, canvas2d.width, canvas2d.height );
	ctx.font = "20px Quicksand";
	ctx.fillStyle = color;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(message, canvas2d.width/2, canvas2d.height/2);

	var spriteMaterial = new THREE.SpriteMaterial( {
		map: new THREE.CanvasTexture( canvas2d ),
	});

	textSprite = new THREE.Sprite( spriteMaterial );
	textSprite.scale.set(256, 128, 1.0);
	textSprite.name = "fzLabel";

	return textSprite;
};
