//
//  LPCProfileDescription.h
//  AudioPlugin
//
//  Created by Sam Tarakajian on 5/25/16.
//  Copyright © 2016 Girlfriends Labs. All rights reserved.
//

#import <Foundation/Foundation.h>

FOUNDATION_EXPORT NSString *const LPCProfileDescriptionKeyName;
FOUNDATION_EXPORT NSString *const LPCProfileDescriptionKeyEmail;
FOUNDATION_EXPORT NSString *const LPCProfileDescriptionKeyUUID;
FOUNDATION_EXPORT NSString *const LPCProfileDescriptionKeyAge;
FOUNDATION_EXPORT NSString *const LPCProfileDescriptionKeyGender;
FOUNDATION_EXPORT NSString *const LPCProfileDescriptionKeyHeightFeet;
FOUNDATION_EXPORT NSString *const LPCProfileDescriptionKeyHeightInches;
FOUNDATION_EXPORT NSString *const LPCProfileDescriptionKeyTargetF3;
FOUNDATION_EXPORT NSString *const LPCProfileDescriptionKeyStdevF3;
FOUNDATION_EXPORT NSString *const LPCProfileDescriptionKeyTargetLPCOrder;

@interface LPCProfileDescription : NSObject
@property (nonatomic, readonly) NSString *uuid;
@property (nonatomic, readonly) NSDictionary *metadata;
@property (nonatomic, readonly) double targetF3;
@property (nonatomic, readonly) double stdevF3;
@property (nonatomic, readonly) NSInteger targetLPCOrder;

+ (instancetype) accountDescriptionWithDictionary:(NSDictionary *)dictionary;
+ (instancetype) accountDescriptionWithRecordingMetadataURL:(NSURL *)url;

@end
