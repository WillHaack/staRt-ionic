var Draw = function Draw() {
  this.log = function () { return console.log('Draw is available'); };
};

// ==============================================
// DRAWING UTILS ----------------------
Draw.prototype.linScale = function ( v, inlow, inhigh, outlow, outhigh ) {
  var range = outhigh - outlow;
  var domain = inhigh - inlow;
  var ov = (v - inlow) / domain;
  ov = (ov * range) + outlow;

  return ov;
}

Draw.prototype.clamp = function ( val, min, max ) {
  return Math.max( min, Math.min( max, val ) );
}

//https://en.wikipedia.org/wiki/Smoothstep
Draw.prototype.smoothStep = function ( x, min, max ) {
  if ( x <= min ) { return 0; }
  if ( x >= max ) { return 1; }
  x = ( x - min ) / ( max - min );

  return x * x * ( 3 - 2 * x );
}

Draw.prototype.randFloat = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

Draw.prototype.randInt = function (min, max) { // min-max inclusive
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// https://en.wikipedia.org/wiki/Linear_interpolation
Draw.prototype.lerp = function ( x, y, t ) {
  return ( 1 - t ) * x + t * y;
}


// ==============================================
// BASIC SHAPES ----------------------
Draw.prototype.roundedRect = function(shape, x, y, w, h, r) {
  shape.moveTo(x, y + r); // starts in upper right corner
  shape.lineTo(x, y + h - r);
  shape.quadraticCurveTo(x, y + h, x + r, y + h);
  shape.lineTo(x + w - r, y + h);
  shape.quadraticCurveTo(x + w, y + h, x + w, y + h - r);
  shape.lineTo(x + w, y + r);
  shape.quadraticCurveTo(x + w, y, x + w - r, y);
  shape.lineTo(x + r, y);
  shape.quadraticCurveTo(x, y, x, y + r);

  return shape;
};

Draw.prototype.ellipse = function(shape, x, y, rx, ry) {
  shape.moveTo(x, y);
  shape.ellipse(x, y, rx, ry);

  return shape;
};


// EXPORTS =======================================
var lpcDirective = angular.module('lpcDirective');
lpcDirective.value('Draw', new Draw());
