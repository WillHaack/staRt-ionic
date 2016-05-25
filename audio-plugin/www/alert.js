module.exports = {
  getLPCCoefficients: function(successCallback) {
    cordova.exec(successCallback,
                 null, // No failure callback
                 "AudioPlugin",
                 "getLPCCoefficients",
                 null); // No arguments
  },
  startRecording: function(accountDescription, successCallback, errorCallback) {
    cordova.exec(
      successCallback,
      errorCallback,
      "AudioPlugin",
      "startRecording",
      [accountDescription]
    );
  }
};
