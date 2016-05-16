module.exports = {
  iosalert: function(title, message, buttonLabel, successCallback) {
    cordova.exec(successCallback,
                 null, // No failure callback
                 "AudioPlugin",
                 "alert",
                 [title, message, buttonLabel]);
  }
};
