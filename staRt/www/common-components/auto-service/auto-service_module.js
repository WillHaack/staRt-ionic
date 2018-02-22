var autoService = angular.module('autoService', []);

var INTRO_FREEPLAY_TIME = 600000; // Five minutes

function _hasIntersection(arrayA, arrayB) {
    return arrayA.filter(function(a) { return arrayB.indexOf(a) !== -1}).length > 0;
}

var AutoState = function(profile, currentStates, onComplete, onShow) {
    this.onComplete = onComplete;
    this.onShow = onShow;
}
AutoState.prototype = {
    currentMessage: function() { return null; },
    processUpdate: function(profile, currentStates, changelist) {}
};

var IntroAuto = function(profile, currentStates, onComplete, onShow) {
    AutoState.call(this, profile, currentStates, onComplete, onShow);

    this.welcomeDialog = {
        text: "Welcome to the staRt app! Please begin by navigating to Quiz and completing our Long Word Quiz measure.",
        title: "Welcome",
        button: "Okay"
    };
    this.syllableNextDialog = {
        text: "Please proceed to our Syllable Quiz measure.",
        title: "Syllable Quiz",
        button: "Okay"
    };
    this.tutorialNextDialog = {
        text: "Please navigate to the Tutorial.",
        title: "Tutorial",
        button: "Okay"
    };
    this.freePlayFiveMinutesDialog = {
        text: "Please navigate to Free Play and try out the wave for approximately five minutes.",
        title: "Free Play",
        button: "Okay"
    };
    this.introDoneDialog = {
        text: "You are done with your first session! Please come back soon to complete your first Quest.",
        title: "All done",
        button: "Okay"
    };

    this.currentDialog = this.welcomeDialog;
}
IntroAuto.prototype = Object.create(AutoState.prototype);
IntroAuto.prototype.currentMessage = function() {
    return this.currentDialog;
};
IntroAuto.prototype.processUpdate = function(profile, currentStates, changelist) {
    if (profile.nWordQuizComplete >= 1 && profile.nSyllableQuizComplete === 0) {
        this.currentDialog = this.syllableNextDialog;
        if (this.onShow) this.onShow(this.currentMessage());
        return;
    }

    if (profile.nSyllableQuizComplete >= 1 && profile.nTutorialComplete === 0) {
        this.currentDialog = this.tutorialNextDialog;
        if (this.onShow) this.onShow(this.currentMessage());
        return;
    }

    if (profile.nTutorialComplete >= 1 && currentStates.thisFreeplayTime < INTRO_FREEPLAY_TIME) {
        this.currentDialog = this.freePlayFiveMinutesDialog;
        if (this.onShow) this.onShow(this.currentMessage());
        return;
    }

    if (currentStates.thisFreeplayTime >= INTRO_FREEPLAY_TIME && profile.nIntroComplete === 0) {
        this.currentDialog = this.introDoneDialog;
        if (this.onShow) this.onShow(this.currentMessage());
        if (this.onComplete) this.onComplete();
        return;
    }
};

firebaseService.factory('AutoService', function($rootScope, $ionicPlatform, NotifyingService, ProfileService, SessionStatsService, $cordovaDialogs)
{
    var currentAuto = null;

    function _checkForAuto(profile, currentStates, changelist) {
        if (!currentAuto) {
            // Intro session
            if (profile.nIntroComplete === 0 && profile.formalTester) {
                currentAuto = new IntroAuto(profile, currentStates, function() {
                    NotifyingService.notify('intro-completed', profile);
                    currentAuto = null;
                }, function(message) {
                    if (message) _showMesage(message);
                });
            }
        }
        if (currentAuto && currentAuto.currentMessage()) _showMesage(currentAuto.currentMessage());
    }

    function _showMesage(message) {
        $cordovaDialogs.alert(
            message.text,
            message.title,
            message.button || "Okay"
        );
    }

    NotifyingService.subscribe('will-set-current-profile', $rootScope, function(msg, profile) {
        if (!profile) return;
        _checkForAuto(profile, SessionStatsService.getCurrentProfileStats(), ['current']);
    });

    NotifyingService.subscribe('profile-stats-updated', $rootScope, function (msg, data) {
        var profile = data[0];
        var currentStates = data[1];
        var changelist = data[2];

        if (currentAuto) {
            currentAuto.processUpdate(profile, currentStates, changelist);
        }
    });

    $ionicPlatform.on('resume', function() {
        ProfileService.getCurrentProfile().then(function (profile) {
            if (profile) {
                var currentStates = SessionStatsService.getCurrentProfileStats();
                var changelist = ['resume'];

                _checkForAuto(profile, currentStates, changelist);
            }
        });
	});

    return {
        init: function() {
            console.log("Auto Service initialized");
        }
    }
});
