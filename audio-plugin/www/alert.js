module.exports = {
  getLPCCoefficients: function(successCallback) {
    cordova.exec(successCallback,
                 null, // No failure callback
                 "AudioPlugin",
                 "getLPCCoefficients",
                 null); // No arguments
  }
};
