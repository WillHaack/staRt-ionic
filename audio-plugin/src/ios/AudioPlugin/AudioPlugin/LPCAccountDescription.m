//
//  LPCAccountDescription.m
//  AudioPlugin
//
//  Created by Sam Tarakajian on 5/25/16.
//  Copyright © 2016 Girlfriends Labs. All rights reserved.
//

#import "LPCAccountDescription.h"

NSString *const LPCAccountDescriptionKeyName = @"name";
NSString *const LPCAccountDescriptionKeyUUID = @"uuid";
NSString *const LPCAccountDescriptionKeyAge = @"age";
NSString *const LPCAccountDescriptionKeyGender = @"gender";
NSString *const LPCAccountDescriptionKeyHeightFeet = @"heightFeet";
NSString *const LPCAccountDescriptionKeyHeightInches = @"heightInches";
NSString *const LPCAccountDescriptionKeyTargetF3 = @"targetF3";
NSString *const LPCAccountDescriptionKeyStdevF3 = @"stdevF3";
NSString *const LPCAccountDescriptionKeyTargetLPCOrder = @"targetLPCOrder";

static NSArray *metadataParams;

@interface LPCAccountDescription ()
@property (nonatomic, strong) NSString *uuid;
@property (nonatomic, strong) NSDictionary *metadata;
@property (nonatomic, assign) NSInteger targetF3;
@property (nonatomic, assign) NSInteger stdevF3;
@property (nonatomic, assign) NSInteger targetLPCOrder;
@property (nonatomic, strong) NSMutableDictionary *mutableMetadata;
@end

@implementation LPCAccountDescription

+ (void) initialize
{
    metadataParams = @[
                       LPCAccountDescriptionKeyName,
                       LPCAccountDescriptionKeyAge,
                       LPCAccountDescriptionKeyGender,
                       LPCAccountDescriptionKeyHeightFeet,
                       LPCAccountDescriptionKeyHeightInches
                       ];
}

+ (instancetype) accountDescriptionWithDictionary:(NSDictionary *)dictionary
{
    LPCAccountDescription *desc = [[LPCAccountDescription alloc] init];
    desc.mutableMetadata = [NSMutableDictionary dictionary];
    for (NSString *key in dictionary.keyEnumerator) {
        if ([metadataParams containsObject:key]) {
            [desc.mutableMetadata setObject:[dictionary objectForKey:key]
                                     forKey:key];
        } else {
            [desc setValue:[dictionary objectForKey:key] forKeyPath:key];
        }
    }
    return desc;
}

-  (NSDictionary *) metadata
{
    return self.mutableMetadata;
}

@end
