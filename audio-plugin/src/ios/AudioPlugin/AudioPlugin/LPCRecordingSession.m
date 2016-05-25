//
//  LPCRecordingSession.m
//  lpc_app
//
//  Created by Sam Tarakajian on 12/2/15.
//
//

#import <UIKit/UIKit.h>
#import "LPCRecordingSession.h"
#import "APAudioManager.h"

#define kMetadataKey            @"Metadata"
#define kLPCKey                 @"LPC"
#define kAudioKey               @"Audio"
#define kAccountUUIDKey         @"AccountUUID"
#define kAccountMetadataKey     @"AccountMetadata"
#define kDateKey                @"Date"

@interface LPCRecordingSession ()
@property (nonatomic, strong) NSDate *date;
@property (nonatomic, strong) NSString *dateString;
@property (nonatomic, strong) NSString *accountUUID, *metadataFilename, *lpcFilename, *audioFilename;
@property (nonatomic, strong) NSDictionary *accountMetadata;
@end

@implementation LPCRecordingSession

+ (instancetype) sessionWithAccountDescription:(LPCAccountDescription *)account
{
    LPCRecordingSession *session = [[LPCRecordingSession alloc] init];
    session.accountUUID = account.uuid;
    session.accountMetadata = account.metadata;
    session.date = [NSDate date];
    
    NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
    NSLocale *enUSPOSIXLocale = [NSLocale localeWithLocaleIdentifier:@"en_US_POSIX"];
    [dateFormatter setLocale:enUSPOSIXLocale];
    [dateFormatter setDateFormat:@"yyyy-MM-dd'T'HH-mm-ss"];
    
    session.dateString = [dateFormatter stringFromDate:session.date];
    session.metadataFilename = [NSString stringWithFormat:@"%@-%@-meta.csv", session.accountUUID, session.dateString];
    session.lpcFilename = [NSString stringWithFormat:@"%@-%@-lpc.csv", session.accountUUID, session.dateString];
    session.audioFilename = [NSString stringWithFormat:@"%@-%@-audio.caf", session.accountUUID, session.dateString];
    
    return session;
}

+ (instancetype) sessionWithMetadataFile:(NSString *)metadata lpcFile:(NSString *)lpcFile audioFile:(NSString *)audioFile
{
    LPCRecordingSession *session = [[LPCRecordingSession alloc] init];
    session.metadataFilename = metadata;
    session.lpcFilename = lpcFile;
    session.audioFilename = audioFile;
    return session;
}

- (LPCRecordingSessionData) dataWithLpcOrder:(uint16_t)lpcOrder
{
    NSString *applicationSupportDirectory = [APAudioManager applicationAppSupportDirectory];
    NSString *escapedSupportDir = [applicationSupportDirectory stringByAddingPercentEncodingWithAllowedCharacters:[NSCharacterSet URLPathAllowedCharacterSet]];
    NSURL *audioFileURL = [[NSURL URLWithString:escapedSupportDir] URLByAppendingPathComponent:self.audioFilename];
    NSURL *lpcFileURL = [[NSURL URLWithString:escapedSupportDir] URLByAppendingPathComponent:self.lpcFilename];
    NSURL *metadataFileURL = [[NSURL URLWithString:escapedSupportDir] URLByAppendingPathComponent:self.metadataFilename];
    
    LPCRecordingSessionData data;
    data.accountUUID = [self.accountUUID cStringUsingEncoding:NSUTF8StringEncoding];
    
    if ([self.accountMetadata objectForKey:LPCAccountDescriptionKeyName]) {
        data.username = [[self.accountMetadata objectForKey:LPCAccountDescriptionKeyName] cStringUsingEncoding:NSUTF8StringEncoding];
    } else {
        data.username = nil;
    }
    if ([self.accountMetadata objectForKey:LPCAccountDescriptionKeyGender]) {
        data.gender = [[self.accountMetadata objectForKey:LPCAccountDescriptionKeyGender] cStringUsingEncoding:NSUTF8StringEncoding];
    } else {
        data.gender = nil;
    }
    if ([self.accountMetadata objectForKey:LPCAccountDescriptionKeyAge]) {
        data.ageInYears = [[self.accountMetadata objectForKey:LPCAccountDescriptionKeyAge] integerValue];
    } else {
        data.ageInYears = -1;
    }
    if ([self.accountMetadata objectForKey:LPCAccountDescriptionKeyHeightFeet]) {
        data.heightFeet = [[self.accountMetadata objectForKey:LPCAccountDescriptionKeyHeightFeet] integerValue];
    } else {
        data.ageInYears = -1;
    }
    if ([self.accountMetadata objectForKey:LPCAccountDescriptionKeyHeightInches]) {
        data.heightInches = [[self.accountMetadata objectForKey:LPCAccountDescriptionKeyHeightInches] integerValue];
    } else {
        data.ageInYears = -1;
    }
    
    data.audio_path = [[[audioFileURL absoluteString] stringByRemovingPercentEncoding] cStringUsingEncoding:NSUTF8StringEncoding];
    data.lpc_path = [[[lpcFileURL absoluteString] stringByRemovingPercentEncoding] cStringUsingEncoding:NSUTF8StringEncoding];
    data.metadata_path = [[[metadataFileURL absoluteString] stringByRemovingPercentEncoding] cStringUsingEncoding:NSUTF8StringEncoding];
    data.date_string = [self.dateString cStringUsingEncoding:NSUTF8StringEncoding];
    data.identifier = [[[[UIDevice currentDevice] identifierForVendor] UUIDString] cStringUsingEncoding:NSUTF8StringEncoding];
    data.lpc_order = lpcOrder;
    
    return data;
}

#pragma mark - NSCoding

- (id) initWithCoder:(NSCoder *)aDecoder
{
    self = [super init];
    if (self) {
        self.date = [[NSDate alloc] initWithCoder:aDecoder];
        self.metadataFilename = [aDecoder decodeObjectForKey:kMetadataKey];
        self.lpcFilename = [aDecoder decodeObjectForKey:kLPCKey];
        self.audioFilename = [aDecoder decodeObjectForKey:kAudioKey];
        self.accountUUID = [aDecoder decodeObjectForKey:kAccountUUIDKey];
        self.accountMetadata = [aDecoder decodeObjectForKey:kAccountMetadataKey];
        self.dateString = [aDecoder decodeObjectForKey:kDateKey];
    } return self;
}

- (void) encodeWithCoder:(NSCoder *)aCoder
{
    [aCoder encodeObject:self.metadataFilename forKey:kMetadataKey];
    [aCoder encodeObject:self.lpcFilename forKey:kLPCKey];
    [aCoder encodeObject:self.audioFilename forKey:kAudioKey];
    [aCoder encodeObject:self.accountUUID forKey:kAccountUUIDKey];
    [aCoder encodeObject:self.accountMetadata forKey:kAccountMetadataKey];
    [aCoder encodeObject:self.dateString forKey:kDateKey];
    [self.date encodeWithCoder:aCoder];
}

#pragma mark - LPCUploadable
- (NSString *) title
{
    return [NSString stringWithFormat:@"Recording Session:%@", self.metadataFilename];
}

- (NSUInteger) numberOfAttachments {return 3;}

- (NSString *) nameForAttachmentAtIndex:(NSUInteger)index
{
    NSString *name = nil;
    switch (index) {
        case 0:
            name = self.audioFilename;
            break;
        case 1:
            name = self.lpcFilename;
            break;
        case 2:
            name = self.metadataFilename;
            break;
            
        default:
            break;
    }
    return name;
}

- (NSString *) mimeTypeForAttachmentAtIndex:(NSUInteger)index
{
    NSString *mimetype = nil;
    switch (index) {
        case 0:
            mimetype = @"audio/wav";
            break;
        case 1:
        case 2:
            mimetype = @"text/csv";
            break;
            
        default:
            break;
    }
    return mimetype;
}

- (NSData *) dataForAttachmentAtIndex:(NSUInteger)index
{
    NSData *data = nil;
    NSString *applicationSupportDirectory = [APAudioManager applicationAppSupportDirectory];
    NSURL *dd = [NSURL URLWithString:applicationSupportDirectory];
    NSString *filename = [self nameForAttachmentAtIndex:index];
    if (filename) {
        NSURL *fileURL = [NSURL fileURLWithPath:[dd.absoluteString stringByAppendingPathComponent:filename]];
        data = [NSData dataWithContentsOfURL:fileURL];
    }
    return data;
}

@end
