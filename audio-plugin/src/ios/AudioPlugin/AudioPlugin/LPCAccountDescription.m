//
//  LPCAccountDescription.m
//  AudioPlugin
//
//  Created by Sam Tarakajian on 5/25/16.
//  Copyright © 2016 Girlfriends Labs. All rights reserved.
//

#import "LPCAccountDescription.h"
#import "CHCSVParser.h"

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
@property (nonatomic, assign) double targetF3;
@property (nonatomic, assign) double stdevF3;
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

+ (instancetype) accountDescriptionWithRecordingMetadataURL:(NSURL *)url
{
    NSArray<CHCSVOrderedDictionary *> *rows = [NSArray arrayWithContentsOfCSVURL:url options:CHCSVParserOptionsUsesFirstLineAsKeys];
    if (!rows)
        return nil;
    LPCAccountDescription *desc = [[LPCAccountDescription alloc] init];
    desc.mutableMetadata = [NSMutableDictionary dictionary];
    desc.uuid = [rows[0] objectForKey:@"uuid"];
    [desc.mutableMetadata setObject:[rows[0] objectForKey:@"username"] forKey:LPCAccountDescriptionKeyName];
    [desc.mutableMetadata setObject:[rows[0] objectForKey:@"age"] forKey:LPCAccountDescriptionKeyAge];
    [desc.mutableMetadata setObject:[rows[0] objectForKey:@"gender"] forKey:LPCAccountDescriptionKeyGender];
    [desc.mutableMetadata setObject:[rows[0] objectForKey:@"heightFeet"] forKey:LPCAccountDescriptionKeyHeightFeet];
    [desc.mutableMetadata setObject:[rows[0] objectForKey:@"heightInches"] forKey:LPCAccountDescriptionKeyHeightInches];
    desc.targetF3 = [[rows[0] objectForKey:@"targetF3"] doubleValue];
    desc.stdevF3 = [[rows[0] objectForKey:@"stdevF3"] doubleValue];
    desc.targetLPCOrder = [[rows[0] objectForKey:@"targetLPCOrder"] integerValue];
    return desc;
}

-  (NSDictionary *) metadata
{
    return self.mutableMetadata;
}

@end
