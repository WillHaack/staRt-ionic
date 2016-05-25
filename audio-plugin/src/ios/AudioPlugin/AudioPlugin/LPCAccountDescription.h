//
//  LPCAccountDescription.h
//  AudioPlugin
//
//  Created by Sam Tarakajian on 5/25/16.
//  Copyright © 2016 Girlfriends Labs. All rights reserved.
//

#import <Foundation/Foundation.h>

FOUNDATION_EXPORT NSString *const LPCAccountDescriptionKeyName;
FOUNDATION_EXPORT NSString *const LPCAccountDescriptionKeyUUID;
FOUNDATION_EXPORT NSString *const LPCAccountDescriptionKeyAge;
FOUNDATION_EXPORT NSString *const LPCAccountDescriptionKeyGender;
FOUNDATION_EXPORT NSString *const LPCAccountDescriptionKeyHeightFeet;
FOUNDATION_EXPORT NSString *const LPCAccountDescriptionKeyHeightInches;
FOUNDATION_EXPORT NSString *const LPCAccountDescriptionKeyTargetF3;
FOUNDATION_EXPORT NSString *const LPCAccountDescriptionKeyStdevF3;
FOUNDATION_EXPORT NSString *const LPCAccountDescriptionKeyTargetLPCOrder;

@interface LPCAccountDescription : NSObject
@property (nonatomic, readonly) NSString *uuid;
@property (nonatomic, readonly) NSString *name;
@property (nonatomic, readonly) NSDictionary *metadata;
@property (nonatomic, readonly) NSInteger targetF3;
@property (nonatomic, readonly) NSInteger stdevF3;
@property (nonatomic, readonly) NSInteger targetLPCOrder;

+ (instancetype) accountDescriptionWithDictionary:(NSDictionary *)dictionary;

@end
