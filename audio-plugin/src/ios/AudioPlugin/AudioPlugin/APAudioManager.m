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
    self.audioController = [[AEAudioController alloc]
                            initWithAudioDescription:AEAudioStreamBasicDescriptionNonInterleavedFloatStereo
                            inputEnabled:YES];
    self.lpcCalculator = [[APLPCCalculator alloc] initWithAudioController:self.audioController];
    [self.audioController addInputReceiver:self.lpcCalculator];
    [self.audioController start:nil];
}

- (NSArray *) lpcCoefficients
{
    return [self.lpcCalculator getCurrentCoefficients];
}

@end
