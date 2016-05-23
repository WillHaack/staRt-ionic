//
//  APLPCCalculator.h
//  AudioPlugin
//
//  Created by Sam Tarakajian on 5/19/16.
//  Copyright © 2016 Girlfriends Labs. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "TheAmazingAudioEngine.h"

@interface APLPCCalculator : NSObject <AEAudioReceiver>
- (id) initWithAudioController:(AEAudioController *)audioController;
- (NSArray *) getCurrentCoefficients;
- (double) frequencyScaling;
@end
