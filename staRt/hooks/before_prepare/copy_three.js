#!/usr/bin/env node

// Copy three from npm to www/lib

var fs = require("fs-extra");
var path = require("path");

var source = path.resolve(__dirname, "../../node_modules/three");
var destination = path.resolve(__dirname, "../../www/lib/three.js");

console.log("source: " + source);
console.log("destination: " + destination);

fs.copy(source, destination, function (err) {
  if (err) {
    console.log('An error occured while copying the folder.');
    console.log(err);
    return console.error(err);
  }
  console.log('Copy completed!');
});
