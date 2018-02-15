var autoService = angular.module('autoService', []);

var INTRO_FREEPLAY_TIME = 40000; // Five minutes

firebaseService.factory('AutoService', function($rootScope, NotifyingService, SessionStatsService, $cordovaDialogs)
{
    var shownDialogs = [];

    // Initial Session Dialogs
    var welcomeDialog = {
        text: "Welcome to the staRt app! Please begin by navigating to Quiz and completing our Long Word Quiz measure.",
        title: "Welcome",
        button: "Okay"
    };
    var syllableNextDialog = {
        text: "Please proceed to our Syllable Quiz measure.",
        title: "Syllable Quiz",
        button: "Okay"
    };
    var tutorialNextDialog = {
        text: "Please navigate to the Tutorial.",
        title: "Tutorial",
        button: "Okay"
    };
    var freePlayFiveMinutesDialog = {
        text: "Please navigate to Free Play and try out the wave for approximately five minutes.",
        title: "Free Play",
        button: "Okay"
    };
    var introDoneDialog = {
        text: "You are done with your first session! Please come back soon to complete your first Quest.",
        title: "All done",
        button: "Okay"
    };

    function _displayDialog(dialog) {
        if (shownDialogs.indexOf(dialog) === -1) shownDialogs.push(dialog);
        $cordovaDialogs.alert(dialog.text, dialog.title, dialog.button || "Okay");
    }

    function _hasIntersection(arrayA, arrayB) {
        return arrayA.filter(function(a) { return arrayB.indexOf(a) !== -1}).length > 0;
    }

    function _shouldShowIntroDialogForProfile(profile, currentStates, changelist) {
        if (profile.formalTester && profile.nIntroComplete === 0) {
            var doShow = _hasIntersection([
                "nWordQuizComplete",
                "nSyllableQuestComplete",
                "nTutorialComplete",
                "thisFreeplayTime",
                "current"
            ], changelist);

            return doShow;
        }
        
        return false;
    }

    function _showIntroDialogForProfile(profile, currentStates, changelist) {
        if (profile.nWordQuizComplete === 0) {
            if (shownDialogs.indexOf(welcomeDialog) === -1) {
                _displayDialog(welcomeDialog);
                return;
            }
        }

        if (profile.nWordQuizComplete >= 1 && profile.nSyllableQuizComplete === 0) {
            _displayDialog(syllableNextDialog);
            return;
        }

        if (profile.nSyllableQuizComplete >= 1 && profile.nTutorialComplete === 0) {
            _displayDialog(tutorialNextDialog);
            return;
        }

        if (profile.nTutorialComplete >= 1 && currentStates.thisFreeplayTime < INTRO_FREEPLAY_TIME) {
            _displayDialog(freePlayFiveMinutesDialog);
            return;
        }

        if (currentStates.thisFreeplayTime >= INTRO_FREEPLAY_TIME && profile.nIntroComplete === 0) {
            _displayDialog(introDoneDialog);
            NotifyingService.notify('intro-completed', profile);
            return;
        }
    }

    NotifyingService.subscribe('will-set-current-profile', $rootScope, function(msg, profile) {
        shownDialogs = [];
        if (!profile) return;
        if (_shouldShowIntroDialogForProfile(profile, SessionStatsService.getCurrentProfileStats(), ['current'])) {
            _showIntroDialogForProfile(profile, SessionStatsService.getCurrentProfileStats(), ['current']);
        }
    });

    NotifyingService.subscribe('profile-stats-updated', $rootScope, function (msg, data) {
        var profile = data[0];
        var currentStates = data[1];
        var changelist = data[2];

        if (_shouldShowIntroDialogForProfile(profile, currentStates, changelist)) {
            _showIntroDialogForProfile(profile, currentStates, changelist);
        }
    });

    return {
        init: function() {
            console.log("Auto Service initialized");
        }
    }
});
