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

@interface APAudioManager ()
@property (nonatomic, strong) AEAudioController *audioController;
@property (nonatomic, strong) APLPCCalculator *lpcCalculator;
@property (nonatomic, strong) AERecorder *recorder;
@end

@implementation APAudioManager

- (void) createApplicationSupportDirectoryIfNecessary
{
    // got to make sure this exists
    NSFileManager *manager = [NSFileManager defaultManager];
    NSString *appSupportDir = [self applicationAppSupportDirectory];
    if(![manager fileExistsAtPath:appSupportDir]) {
        __autoreleasing NSError *error;
        BOOL ret = [manager createDirectoryAtPath:appSupportDir withIntermediateDirectories:NO attributes:nil error:&error];
        if(!ret) {
            NSLog(@"ERROR app support: %@", error);
            exit(0);
        }
    }
}

- (NSString *) applicationAppSupportDirectory
{
    return [NSSearchPathForDirectoriesInDomains(NSApplicationSupportDirectory, NSUserDomainMask, YES) lastObject];
}

- (void) start
{
    [self createApplicationSupportDirectoryIfNecessary];
    
    AudioStreamBasicDescription asbd = AEAudioStreamBasicDescriptionNonInterleavedFloatStereo;
    asbd.mSampleRate = 22050.0;
    self.audioController = [[AEAudioController alloc]
                            initWithAudioDescription:asbd
                            inputEnabled:YES];
    self.audioController.preferredBufferDuration = 512.0f / asbd.mSampleRate;
    self.lpcCalculator = [[APLPCCalculator alloc] initWithAudioController:self.audioController];
    [self.audioController addInputReceiver:self.lpcCalculator];
    [self.audioController start:nil];
    self.recorder = [[AERecorder alloc] initWithAudioController:self.audioController];
    [self.audioController addInputReceiver:self.recorder];
}

- (NSArray *) lpcCoefficients
{
    return [self.lpcCalculator getCurrentCoefficients];
}

- (double) frequencyScaling
{
    return self.lpcCalculator.frequencyScaling;
}

- (NSString *) recordingPathForUUID:(NSString *)uuid
{
    return [NSString stringWithFormat:@"%@/%@.aiff", [self applicationAppSupportDirectory], uuid];
}

- (void) startRecording:(NSString *)uuidString
{
    NSString *path = [self recordingPathForUUID:uuidString];
    [self.recorder beginRecordingToFileAtPath:path fileType:kAudioFileAIFFType error:nil];
}

- (void) stopRecording
{
    [self.recorder finishRecording];
}

@end
