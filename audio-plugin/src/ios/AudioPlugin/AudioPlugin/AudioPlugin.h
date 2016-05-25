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

// Recording should take an options array, which includes whether or not you want to store LPC coefficients alongside it.
- (void)startRecording:(CDVInvokedUrlCommand *)command;
- (void)stopRecording:(CDVInvokedUrlCommand *)command;
@end
