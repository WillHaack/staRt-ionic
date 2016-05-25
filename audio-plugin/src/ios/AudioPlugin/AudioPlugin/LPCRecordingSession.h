//
//  LPCRecordingSession.h
//  lpc_app
//
//  Created by Sam Tarakajian on 12/2/15.
//
//

#import <Foundation/Foundation.h>
#include "LPCRecordingSessionData.h"
#include "LPCUploadable.h"
#include "LPCAccountDescription.h"

@interface LPCRecordingSession : NSObject <NSCoding, LPCUploadable>
@property (nonatomic, readonly) NSString *metadataFilename;
@property (nonatomic, readonly) NSString *lpcFilename;
@property (nonatomic, readonly) NSString *audioFilename;

+ (instancetype) sessionWithAccountDescription:(LPCAccountDescription *)account;
- (LPCRecordingSessionData) dataWithLpcOrder:(uint16_t)lpcOrder;

@end
