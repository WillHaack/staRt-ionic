//
//  LPCDisplayView.h
//  AudioPlugin
//
//  Created by Sam Tarakajian on 5/30/16.
//  Copyright © 2016 Girlfriends Labs. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface LPCDisplayView : UIView
@property (nonatomic, assign) double frequencyScaling;

- (void) setLPCCoefficients:(NSArray *)coefficients;
- (void) setPeakPoints:(NSArray *)peakPoints;

@end
