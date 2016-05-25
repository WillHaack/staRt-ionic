//
//  APLPCCalculator.h
//  AudioPlugin
//
//  Created by Sam Tarakajian on 5/19/16.
//  Copyright © 2016 Girlfriends Labs. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "TheAmazingAudioEngine.h"
#import "LPCRecordingSessionData.h"

@interface APLPCCalculator : NSObject <AEAudioReceiver>
@property (nonatomic, assign) NSInteger lpcOrder;
- (id) initWithAudioController:(AEAudioController *)audioController;
- (NSArray *) getCurrentCoefficients;
- (double) frequencyScaling;

- (void) beginRecordingLPCWithRecordingSessionData:(LPCRecordingSessionData *)sessionData error:(NSError **)error;
- (void) finishRecording;
@end
