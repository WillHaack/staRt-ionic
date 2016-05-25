//
//  APAudioManager.h
//  AudioPlugin
//
//  Created by Sam Tarakajian on 5/19/16.
//  Copyright © 2016 Girlfriends Labs. All rights reserved.
//

#import <Foundation/Foundation.h>

@class LPCAccountDescription;

@interface APAudioManager : NSObject
+ (NSString *) applicationAppSupportDirectory;
- (void) start;
- (NSArray *) lpcCoefficients;
- (double) frequencyScaling;
- (void) startRecordingForAccountDescription:(LPCAccountDescription *)description;
- (void) stopRecording;
@end
