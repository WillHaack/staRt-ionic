var canvas;

function setup () {
  canvas = createCanvas(600,400);
  canvas.parent(document.getElementById('lpc-container'));
}

function draw () {
  ellipse(50, 50, 80, 80);
}
