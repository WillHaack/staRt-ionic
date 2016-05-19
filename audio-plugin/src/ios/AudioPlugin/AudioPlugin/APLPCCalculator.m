//
//  APLPCCalculator.m
//  AudioPlugin
//
//  Created by Sam Tarakajian on 5/19/16.
//  Copyright © 2016 Girlfriends Labs. All rights reserved.
//

#import "APLPCCalculator.h"

@interface APLPCCalculator () <AEAudioReceiver> {
@public
    int coefficientCount;
    SInt16 coefficients[100];
}

@end

@implementation APLPCCalculator

- (id) init
{
    self = [super init];
    if (self) {
        coefficientCount = 10;
    }
    return self;
}

- (NSArray *) getCurrentCoefficients
{
    NSMutableArray *array = [[NSMutableArray alloc] init];
    for (int i=0; i<coefficientCount; i++) {
        [array addObject:@(coefficients[i])];
    }
    return array;
}

static void receiverCallback(__unsafe_unretained APLPCCalculator *THIS,
                             __unsafe_unretained AEAudioController *audioController,
                             void *source,
                             const AudioTimeStamp *time,
                             UInt32 frames,
                             AudioBufferList *audio)
{
    int cnt = THIS->coefficientCount;
    for (int i=0; i<MIN(frames, cnt); i++) {
        THIS->coefficients[i] = ((SInt16 *) audio->mBuffers[0].mData)[i];
    }
}
-(AEAudioReceiverCallback)receiverCallback
{
    return receiverCallback;
}

@end
