//
//  AudioPlugin.m
//  AudioPlugin
//
//  Created by Sam Tarakajian on 5/16/16.
//  Copyright © 2016 Girlfriends Labs. All rights reserved.
//

#import "AudioPlugin.h"
#import "APAudioManager.h"
#import "LPCAccountDescription.h"
#import "LPCRecordingSession.h"

@interface AudioPlugin ()
@property (nonatomic, strong) APAudioManager *audioManager;
@end

@implementation AudioPlugin
- (void)pluginInitialize
{
    self.audioManager = [[APAudioManager alloc] init];
    [self.audioManager start];
    NSLog(@"Initializing AudioPlugin, saving to dir %@", [APAudioManager applicationAppSupportDirectory]);
}

- (void)getLPCCoefficients:(CDVInvokedUrlCommand *)command
{
    NSNumber *xScaleFactor = @([self.audioManager frequencyScaling]);
    NSArray *audioCoefficients = [self.audioManager lpcCoefficients];
    NSDictionary *resultDict = @{
                                 @"freqScale" : xScaleFactor,
                                 @"coefficients" : audioCoefficients
                                 };
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                            messageAsDictionary:resultDict];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void)startRecording:(CDVInvokedUrlCommand *)command
{
    if (self.audioManager.currentRecordingSession != nil) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_INVALID_ACTION
                                                    messageAsString:@"Can't start recording--already recording"];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }
    
    LPCAccountDescription *description;
    NSDictionary *accountAsDict = [command argumentAtIndex:0 withDefault:nil andClass:[NSDictionary class]];
    if (accountAsDict) {
        description = [LPCAccountDescription accountDescriptionWithDictionary:accountAsDict];
        LPCRecordingSession *session = [LPCRecordingSession sessionWithAccountDescription:description];
        [self.audioManager startRecordingForRecordingSession:session];
        NSDictionary *recordingFiles = [session recordingFilesDictionary];
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                messageAsDictionary:recordingFiles];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    } else {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_INVALID_ACTION
                                                    messageAsString:@"Must pass valid JSON description of account to record"];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }
}

- (void)stopRecording:(CDVInvokedUrlCommand *)command
{
    LPCRecordingSession *session = self.audioManager.currentRecordingSession;
    if (session) {
        [self.audioManager stopRecording];
        NSDictionary *recordingFiles = [session recordingFilesDictionary];
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                messageAsDictionary:recordingFiles];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    } else {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_INVALID_ACTION
                                                    messageAsString:@"Can't stop recording--no active recording session"];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }
}

- (void)isRecording:(CDVInvokedUrlCommand *)command
{
    LPCRecordingSession *session = self.audioManager.currentRecordingSession;
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:(session != nil)];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void)recordingsForAccount:(CDVInvokedUrlCommand *)command
{
    LPCAccountDescription *description;
    NSDictionary *accountAsDict = [command argumentAtIndex:0 withDefault:nil andClass:[NSDictionary class]];
    if (accountAsDict) {
        description = [LPCAccountDescription accountDescriptionWithDictionary:accountAsDict];
        NSArray *recordings = [LPCRecordingSession recordingsForAccount:description];
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray:recordings];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    } else {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_INVALID_ACTION
                                                    messageAsString:@"Must pass valid JSON description of account"];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }
}

- (void)deleteRecording:(CDVInvokedUrlCommand *)command
{
    
}

- (void)deleteAllRecordings:(CDVInvokedUrlCommand *)command
{
    
}

@end
