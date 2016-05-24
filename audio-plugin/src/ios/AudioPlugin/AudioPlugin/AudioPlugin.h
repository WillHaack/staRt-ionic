//
//  AudioPlugin.h
//  AudioPlugin
//
//  Created by Sam Tarakajian on 5/16/16.
//  Copyright © 2016 Girlfriends Labs. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <Cordova/CDV.h>

@interface AudioPlugin : CDVPlugin <UIAlertViewDelegate> {}
- (void)getLPCCoefficients:(CDVInvokedUrlCommand *)command;
- (void)startRecording:(CDVInvokedUrlCommand *)command;
- (void)stopRecording:(CDVInvokedUrlCommand *)command;
@end
