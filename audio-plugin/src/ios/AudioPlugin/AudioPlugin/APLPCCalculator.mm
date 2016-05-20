//
//  APLPCCalculator.m
//  AudioPlugin
//
//  Created by Sam Tarakajian on 5/19/16.
//  Copyright © 2016 Girlfriends Labs. All rights reserved.
//

#import "APLPCCalculator.h"
#import "AudioManager.h"
#import <AVFoundation/AVFoundation.h>

#define LPC_ORDER (18)                  /**< default number LPC coefficients */
#define LPC_NUM_DISPLAY_BINS (256)      /**< resolution of LPC magnitude spectrum */
#define MAX_DISPLAY_FREQ (4500)     /**< upper limit of LPC magnitude spectrum display (Hz) */

@interface APLPCCalculator () <AEAudioReceiver> {
@public
    AudioManager *audioManager;
    Float32 sampleRate;
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
        audioManager = new AudioManager(bufferLengthSamples, LPC_ORDER, LPC_NUM_DISPLAY_BINS, sampleRate);
        audioManager->enable_lpc_compute();
    }
    return self;
}

- (void) renderMagnitudeBuffer:(Float32 *)lpc_mag_buffer
         intoFrequencyVertexes:(SceneVertex *)freqVertices
              intoPeakVertexes:(SceneVertex *)peakVertices
{
    float x_pos, y_pos;
    UInt32 peakIndices[_numDisplayBins];
    memset(peakIndices, 0, _numDisplayBins * sizeof(UInt32));
    
    // find average LPC mag values
    float avgLpc[_numDisplayBins];
    memset(avgLpc, 0, sizeof(float)*_numDisplayBins);
    
    _historyBuffer->writeBuffer(lpc_mag_buffer);
    _historyBuffer->averageAllBuffers(avgLpc);
    
    // find peaks
    findMaxima(avgLpc, _numDisplayBins, &peakIndices[0], &m_numPeaks);
    
    float mag;
    int pk_cnt = 0, curr_pk_idx;
    
    float min_y_pos = -1.0;
    
    memset(freqVertices,0,_numDisplayBins * sizeof(SceneVertex));
    memset(peakVertices, 0, m_numPeaks * sizeof(SceneVertex));
    
    for (int i=0; i<_numDisplayBins; i++) {
        // scale between -1.0 and 1.0
        x_pos = (2.0*(float)i / (float)(_numDisplayBins-1)) - 1.0;
        
        mag = MAX( (float)( 20.0 * log10(fabsf(avgLpc[i])+1e-20)), MIN_DB_VAL );
        mag = MIN( mag, MAX_DB_VAL );
        
        y_pos = mag / ( MAX_DB_VAL - MIN_DB_VAL ); // + 1.0;
        
        freqVertices[i].positionCoords.x = x_pos;
        freqVertices[i].positionCoords.y = y_pos;
        freqVertices[i].positionCoords.z = 0.0;
        
        
        // This is for under-verticies:
        /*
         /////
         peakVertices[i*2].positionCoords.x = x_pos;
         peakVertices[i*2].positionCoords.y = min_mag;
         peakVertices[i*2].positionCoords.z = 0.0;
         
         //peakVertices[i*2].sceneColor = GLKVector4Make(0.625f, 0.0f, 1.0f, 1.0f);
         //peakVertices[i*2].sceneColor = GLKVector4Make(0.0f, 0.0f, 1.0f, 1.0f);
         
         peakVertices[i*2 + 1].positionCoords.x = x_pos;
         peakVertices[i*2 + 1].positionCoords.y = y_pos;
         peakVertices[i*2 + 1].positionCoords.z = 0.0;
         */
        
        //peakVertices[i*2 + 1].sceneColor = GLKVector4Make(0.0f, 0.0f, 1.0f, 1.0f);
        
        //continue;
        
        curr_pk_idx = (int)peakIndices[pk_cnt];
        if (curr_pk_idx == i) {
            peakVertices[2*pk_cnt].positionCoords.x = x_pos;
            peakVertices[2*pk_cnt].positionCoords.y = min_y_pos;
            peakVertices[2*pk_cnt].positionCoords.z = 0.0;
            peakVertices[2*pk_cnt + 1].positionCoords.x = x_pos;
            peakVertices[2*pk_cnt + 1].positionCoords.y = y_pos;
            peakVertices[2*pk_cnt + 1].positionCoords.z = 0.0;
            pk_cnt++;
        }
    }
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
    
#ifdef USE_LOCAL_FREQ_VERTS
    displayManager->render(lpc_mag_buffer,_freqVertices, _peakVertices);
    displayManager->renderTargetFormantFreqs(_targetFreqVertices, m_targetFormantFreqs, MAX_NUM_TARG_FORMANTS);
    
    NSMutableArray *array = [[NSMutableArray alloc] init];
    for (int i=0; i<audioManager->m_lpc_order; i++) {
        [array addObject:@(audioManager->m_lpc_coeffs[i])];
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
