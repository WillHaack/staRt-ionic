//
//  AudioPlugin.m
//  AudioPlugin
//
//  Created by Sam Tarakajian on 5/16/16.
//  Copyright © 2016 Girlfriends Labs. All rights reserved.
//

#import "AudioPlugin.h"
#import "APAudioManager.h"

@interface AudioPlugin ()
@property (nonatomic, strong) APAudioManager *audioManager;
@end

@implementation AudioPlugin
- (void)pluginInitialize
{
    self.audioManager = [[APAudioManager alloc] init];
    [self.audioManager start];
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

@end
