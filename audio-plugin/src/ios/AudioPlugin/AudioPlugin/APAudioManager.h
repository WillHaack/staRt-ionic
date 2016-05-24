//
//  APAudioManager.h
//  AudioPlugin
//
//  Created by Sam Tarakajian on 5/19/16.
//  Copyright © 2016 Girlfriends Labs. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface APAudioManager : NSObject
- (void) start;
- (NSArray *) lpcCoefficients;
- (double) frequencyScaling;
- (void) startRecording:(NSString *)uuidString;
- (void) stopRecording;
@end
