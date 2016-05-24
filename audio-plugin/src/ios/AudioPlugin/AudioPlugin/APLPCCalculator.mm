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

//#define TEST_WITH_SIN_WAVE  1

@interface APLPCCalculator () <AEAudioReceiver> {
@public
    AudioManager *audioManager;
    Float32 sampleRate;
    LPCDisplayManager *lpcDisplayManager;
    
    
    Vector3 _freqVertices[NUM_LPC_DISPLAY_BINS];          /**< OpenGL vertices for drawing LPC magnitude spectrum */
    Vector3 _peakVertices[2*NUM_LPC_DISPLAY_BINS];        /**< OpenGL vertices for drawing peaks in LPC magnitude spectrum */
    Vector3 _targetFreqVertices[2*MAX_NUM_TARG_FORMANTS]; /**< OpenGL vertices containing points defining lines indicating target formant frequencies in LPC magnitude */
    
    double m_targetFormantFreqs[MAX_NUM_TARG_FORMANTS];       /**< array of target formant frequencies */
    
    double sinPhase;
    double _frequency;
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
        _frequency = 22050.0 / 100.0;
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
    
    lpcDisplayManager->render(lpc_mag_buffer, _freqVertices, _peakVertices);
    lpcDisplayManager->renderTargetFormantFreqs(_targetFreqVertices, m_targetFormantFreqs, MAX_NUM_TARG_FORMANTS);
    
    NSMutableArray *array = [[NSMutableArray alloc] init];
    for (int i=0; i<lpcDisplayManager->_numDisplayBins; i++) {
        [array addObject:@(_freqVertices[i].y)];
    }
    return array;
}

- (double) frequencyScaling
{
    float normFreq = 2.0 * MAX_DISPLAY_FREQ / sampleRate;
    float scaleX = 1.0 / normFreq;
    return scaleX;
}

static void receiverCallback(__unsafe_unretained APLPCCalculator *THIS,
                             __unsafe_unretained AEAudioController *audioController,
                             void *source,
                             const AudioTimeStamp *time,
                             UInt32 frames,
                             AudioBufferList *audio)
{
    Float32 *inA = (Float32 *)audio->mBuffers[0].mData;
    Float32 *inB = (Float32 *)audio->mBuffers[1].mData;
    
#ifdef TEST_WITH_SIN_WAVE
    Float64 sampleRate = 22050.0; //THIS->_sampleRate;
    Float32 freq = THIS->_frequency;
    // Get a pointer to the dataBuffer of the AudioBufferList
    //Float32 *outA = (Float32 *)ioData->mBuffers[0].mData;
    //Float32 *outB = (Float32 *)ioData->mBuffers[1].mData;
    
    // The amount the phase changes in  single sample
    double phaseIncrement = 2 * M_PI * freq / sampleRate;
    // Pass in a reference to the phase value, you have to keep track of this
    // so that the sin resumes right where the last call left off
    Float32 phase = THIS->sinPhase;
    
    double sinSignal;
    // Loop through the callback buffer, generating samples
    for (UInt32 i = 0; i < frames; ++i) {
        // calculate the next sample
        sinSignal = sin(phase);
        inA[i] = sinSignal;
        //outB[i] = sinSignal;
        phase = phase + phaseIncrement;
    }
    // Reset the phase value to prevent the float from overflowing
    if (phase >= 2 * M_PI * freq) {
        phase = phase - 2 * M_PI * freq;
    }
    // Store the phase for the next callback.
    THIS->sinPhase = phase;
    
    memcpy( THIS->audioManager->m_lpc_mag_buffer, inA, frames * sizeof(Float32));
    
#else
    THIS->audioManager->grabAudioData(inA);
    THIS->audioManager->computeLPC();
#endif
}

-(AEAudioReceiverCallback)receiverCallback
{
    return receiverCallback;
}

@end
