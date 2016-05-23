//
//  APLPCCalculator.m
//  AudioPlugin
//
//  Created by Sam Tarakajian on 5/19/16.
//  Copyright © 2016 Girlfriends Labs. All rights reserved.
//

#import "APLPCCalculator.h"
#import "AudioManager.h"
#import "LPCDisplayManager.h"
#import <AVFoundation/AVFoundation.h>

#define LPC_ORDER (18)                  /**< default number LPC coefficients */
#define LPC_NUM_DISPLAY_BINS (256)      /**< resolution of LPC magnitude spectrum */
#define MAX_NUM_TARG_FORMANTS (5)   /**< maximum number of LPC target formant frequencies */
#define NUM_LPC_DISPLAY_BINS (256)  /**< number of points in OpenGL structure used to draw LPC magnitude spectrum */
#define MAX_DISPLAY_FREQ (4500)     /**< upper limit of LPC magnitude spectrum display (Hz) */

@interface APLPCCalculator () <AEAudioReceiver> {
@public
    AudioManager *audioManager;
    Float32 sampleRate;
    LPCDisplayManager *lpcDisplayManager;
    
    
    Vector3 _freqVertices[NUM_LPC_DISPLAY_BINS];          /**< OpenGL vertices for drawing LPC magnitude spectrum */
    Vector3 _peakVertices[2*NUM_LPC_DISPLAY_BINS];        /**< OpenGL vertices for drawing peaks in LPC magnitude spectrum */
    Vector3 _targetFreqVertices[2*MAX_NUM_TARG_FORMANTS]; /**< OpenGL vertices containing points defining lines indicating target formant frequencies in LPC magnitude */
    
    double m_targetFormantFreqs[MAX_NUM_TARG_FORMANTS];       /**< array of target formant frequencies */
}

@end

@implementation APLPCCalculator

- (id) initWithAudioController:(AEAudioController *)audioController
{
    self = [super init];
    if (self) {
        sampleRate = audioController.inputAudioDescription.mSampleRate;
        Float64 bufferDurationSecs = [[AVAudioSession sharedInstance] IOBufferDuration];
        UInt32 bufferLengthSamples = AEConvertSecondsToFrames(audioController, bufferDurationSecs);
        audioManager = new AudioManager(bufferLengthSamples, LPC_ORDER, NUM_LPC_DISPLAY_BINS, sampleRate);
        audioManager->enable_lpc_compute();
        lpcDisplayManager = new LPCDisplayManager(NUM_LPC_DISPLAY_BINS, sampleRate);
    }
    return self;
}

- (NSArray *) getCurrentCoefficients
{
    // Get the LPC data
    int lpcSize = audioManager->m_lpc_magSpecResolution;  //audioManager->m_lpc_BufferSize;
    Float32 lpc_mag_buffer[lpcSize];
    memcpy(lpc_mag_buffer, audioManager->m_lpc_mag_buffer, lpcSize * sizeof(Float32));
    
    // set scaling so that specified maximum frequency is displayed
    float normFreq = 2.0 * MAX_DISPLAY_FREQ / sampleRate;
    float scaleX = 1.0 / normFreq;
    
    // this can be used to adjust y-scaling (e.g. to use more range along the y-axis, set a number > 1.0)
    float scaleY = 1.0;
    
    lpcDisplayManager->render(lpc_mag_buffer, _freqVertices, _peakVertices);
    lpcDisplayManager->renderTargetFormantFreqs(_targetFreqVertices, m_targetFormantFreqs, MAX_NUM_TARG_FORMANTS);
    
    NSMutableArray *array = [[NSMutableArray alloc] init];
    for (int i=0; i<audioManager->m_lpc_order; i++) {
        [array addObject:@(lpc_mag_buffer[i])];
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
    Float32 *inA = (Float32 *)audio->mBuffers[0].mData;
    THIS->audioManager->grabAudioData(inA);
    THIS->audioManager->computeLPC();
}

-(AEAudioReceiverCallback)receiverCallback
{
    return receiverCallback;
}

@end
