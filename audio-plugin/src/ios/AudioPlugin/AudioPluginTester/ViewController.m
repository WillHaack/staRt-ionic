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
#import "LPCRecordingSession.h"
#import "CHCSVParser.h"

static NSDictionary *s_descDict;

@interface ViewController ()
@property (nonatomic, strong) APAudioManager *audioManager;
@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    
    s_descDict = @{
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
    
    self.audioManager = [[APAudioManager alloc] init];
    [self.audioManager start];
    
    CADisplayLink *lnk = [CADisplayLink displayLinkWithTarget:self selector:@selector(printCurrentCoefficients)];
    [lnk addToRunLoop:[NSRunLoop currentRunLoop]
              forMode:NSRunLoopCommonModes];
}

- (void) printCurrentCoefficients
{
    return;
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
    LPCAccountDescription *desc = [LPCAccountDescription accountDescriptionWithDictionary:s_descDict];
    LPCRecordingSession *session = [LPCRecordingSession sessionWithAccountDescription:desc];
    [self.audioManager startRecordingForRecordingSession:session];
}

- (IBAction)stopRecording:(id)sender
{
    [self.audioManager stopRecording];
}

- (IBAction)listRecordings:(id)sender
{
    LPCAccountDescription *desc = [LPCAccountDescription accountDescriptionWithDictionary:s_descDict];
    NSArray<LPCRecordingSession *> *sessions = [LPCRecordingSession recordingsForAccount:desc];
    NSLog(@"%@", [sessions description]);
}

@end
