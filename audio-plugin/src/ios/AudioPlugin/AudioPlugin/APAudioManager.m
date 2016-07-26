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
#import "AERecorder.h"
#import "LPCProfileDescription.h"
#import "LPCRecordingSession.h"
#import "LPCRecordingSessionData.h"

@interface APAudioManager ()
@property (nonatomic, strong) AEAudioController *audioController;
@property (nonatomic, strong) APLPCCalculator *lpcCalculator;
@property (nonatomic, strong) LPCProfileDescription *recordingAccount;
@property (nonatomic, strong) LPCRecordingSession *currentRecordingSession;
@property (nonatomic, strong) AERecorder *recorder;
@property (nonatomic, assign) BOOL isSetup;
@end

@implementation APAudioManager

- (void) setup
{
    AudioStreamBasicDescription asbd = AEAudioStreamBasicDescriptionNonInterleavedFloatStereo;
    asbd.mSampleRate = 22050.0;
    self.audioController = [[AEAudioController alloc]
                            initWithAudioDescription:asbd
                            inputEnabled:YES];
    self.audioController.preferredBufferDuration = 512.0f / asbd.mSampleRate;
    self.lpcCalculator = [[APLPCCalculator alloc] initWithAudioController:self.audioController];
    [self.audioController addInputReceiver:self.lpcCalculator];
    self.recorder = [[AERecorder alloc] initWithAudioController:self.audioController];
    [self.audioController addInputReceiver:self.recorder];
    self.isSetup = YES;
}

- (void) start
{
    if (!self.isSetup)
        [self setup];
    
    [self.audioController start:nil];
}

- (void) stop
{
    [self.audioController stop];
}

- (void) startRecordingForRecordingSession:(LPCRecordingSession *)session
{
    LPCRecordingSessionData sessionData = [session dataWithLpcOrder:self.lpcCalculator.lpcOrder];
    NSString *path = [NSString stringWithCString:sessionData.audio_path encoding:NSUTF8StringEncoding];
    [self.lpcCalculator beginRecordingLPCWithRecordingSessionData:&sessionData error:nil];
    [self.recorder beginRecordingToFileAtPath:path fileType:kAudioFileM4AType error:nil];
    self.currentRecordingSession = session;
}

- (void) stopRecording
{
    [self.recorder finishRecording];
    [self.lpcCalculator finishRecording];
    self.currentRecordingSession = nil;
}

@end
