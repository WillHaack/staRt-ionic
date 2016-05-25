//
//  ViewController.m
//  AudioPluginTester
//
//  Created by Sam Tarakajian on 5/19/16.
//  Copyright © 2016 Girlfriends Labs. All rights reserved.
//

#import "ViewController.h"
#import "APAudioManager.h"
#import "LPCAccountDescription.h"

@interface ViewController ()
@property (nonatomic, strong) APAudioManager *audioManager;
@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    
    self.audioManager = [[APAudioManager alloc] init];
    [self.audioManager start];
    
    CADisplayLink *lnk = [CADisplayLink displayLinkWithTarget:self selector:@selector(printCurrentCoefficients)];
    [lnk addToRunLoop:[NSRunLoop currentRunLoop]
              forMode:NSRunLoopCommonModes];
}

- (void) printCurrentCoefficients
{
    NSArray *coeffs = [self.audioManager lpcCoefficients];
    NSLog(@"Coefficients: %@", coeffs);
    double frequencyScaling = [self.audioManager frequencyScaling];
    NSLog(@"Frequency scaling: %f", frequencyScaling);
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (IBAction)startRecording:(id)sender
{
    NSDictionary *descDict = @{
                               LPCAccountDescriptionKeyAge: @(13),
                               LPCAccountDescriptionKeyGender: @"M",
                               LPCAccountDescriptionKeyHeightFeet: @(5),
                               LPCAccountDescriptionKeyHeightInches: @(11),
                               LPCAccountDescriptionKeyName: @"Testerman",
                               LPCAccountDescriptionKeyStdevF3: @(100),
                               LPCAccountDescriptionKeyTargetF3: @(1100),
                               LPCAccountDescriptionKeyTargetLPCOrder: @(32),
                               LPCAccountDescriptionKeyUUID: @"SomethingVeryUnique"
                               };
    LPCAccountDescription *desc = [LPCAccountDescription accountDescriptionWithDictionary:descDict];
    [self.audioManager startRecordingForAccountDescription:desc];
}

- (IBAction)stopRecording:(id)sender
{
    [self.audioManager stopRecording];
}

@end
