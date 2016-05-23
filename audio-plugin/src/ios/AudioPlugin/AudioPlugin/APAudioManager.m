//
//  APAudioManager.m
//  AudioPlugin
//
//  Created by Sam Tarakajian on 5/19/16.
//  Copyright © 2016 Girlfriends Labs. All rights reserved.
//

#import "APAudioManager.h"
#import "APLPCCalculator.h"
#import "TheAmazingAudioEngine.h"

@interface APAudioManager ()
@property (nonatomic, strong) AEAudioController *audioController;
@property (nonatomic, strong) APLPCCalculator *lpcCalculator;
@end

@implementation APAudioManager

- (void) start
{
    AudioStreamBasicDescription asbd = AEAudioStreamBasicDescriptionNonInterleavedFloatStereo;
    asbd.mSampleRate = 22050.0;
    self.audioController = [[AEAudioController alloc]
                            initWithAudioDescription:asbd
                            inputEnabled:YES];
    self.audioController.preferredBufferDuration = 512.0f / asbd.mSampleRate;
    self.lpcCalculator = [[APLPCCalculator alloc] initWithAudioController:self.audioController];
    [self.audioController addInputReceiver:self.lpcCalculator];
    [self.audioController start:nil];
}

- (NSArray *) lpcCoefficients
{
    return [self.lpcCalculator getCurrentCoefficients];
}

- (double) frequencyScaling
{
    return self.lpcCalculator.frequencyScaling;
}

@end
