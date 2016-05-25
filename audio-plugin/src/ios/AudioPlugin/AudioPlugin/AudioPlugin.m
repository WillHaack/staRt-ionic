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
    LPCAccountDescription *description;
    NSDictionary *accountAsDict = [command argumentAtIndex:0 withDefault:nil andClass:[NSDictionary class]];
    if (accountAsDict) {
        description = [LPCAccountDescription accountDescriptionWithDictionary:accountAsDict];
        [self.audioManager startRecordingForAccountDescription:description];
    } else {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_INVALID_ACTION
                                                    messageAsString:@"Must pass valid JSON description of account to record"];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }
}

- (void)stopRecording:(CDVInvokedUrlCommand *)command
{
    [self.audioManager stopRecording];
}

@end
