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
  },
  stopRecording: function(successCallback, errorCallback) {
    cordova.exec(
      successCallback,
      errorCallback,
      "AudioPlugin",
      "stopRecording",
      null
    );
  },
  isRecording: function(successCallback) {
    cordova.exec(
      successCallback,
      null,
      "AudioPlugin",
      "isRecording",
      null
    );
  },
  recordingsForAccount: function(accountDescription, successCallback, errorCallback) {
    cordova.exec(
      successCallback,
      errorCallback,
      "AudioPlugin",
      "recordingsForAccount",
      [accountDescription]
    );
  },
  deleteRecording: function(recordingDescription, successCallback, errorCallback) {
    cordova.exec(
      successCallback,
      errorCallback,
      "AudioPlugin",
      "deleteRecording",
      [recordingDescription]
    );
  },
  deleteAllRecordings: function(successCallback, errorCallback) {
    cordova.exec(
      successCallback,
      errorCallback,
      "AudioPlugin",
      "deleteAllRecordings",
      null
    );
  }
};
