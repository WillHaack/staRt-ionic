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
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                 messageAsArray:[self.audioManager lpcCoefficients]];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

@end
