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
#import "CHCSVParser.h"

#define kMetadataKey            @"Metadata"
#define kLPCKey                 @"LPC"
#define kAudioKey               @"Audio"
#define kAccountUUIDKey         @"AccountUUID"
#define kAccountMetadataKey     @"AccountMetadata"
#define kDateKey                @"Date"

@interface LPCRecordingSession ()
@property (nonatomic, strong) NSDate *date;
@property (nonatomic, strong) NSString *dateString;
@property (nonatomic, strong) NSString *metadataFilename, *lpcFilename, *audioFilename;
@property (nonatomic, strong) LPCAccountDescription *accountDescription;
@end

@implementation LPCRecordingSession

+ (NSDateFormatter *) recordingSessionDateFormatter
{
    NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
    NSLocale *enUSPOSIXLocale = [NSLocale localeWithLocaleIdentifier:@"en_US_POSIX"];
    [dateFormatter setLocale:enUSPOSIXLocale];
    [dateFormatter setDateFormat:@"yyyy-MM-dd'T'HH-mm-ss"];
    return dateFormatter;
}

+ (instancetype) sessionWithAccountDescription:(LPCAccountDescription *)account
{
    LPCRecordingSession *session = [[LPCRecordingSession alloc] init];
    session.accountDescription = account;
    session.date = [NSDate date];
    
    NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
    NSLocale *enUSPOSIXLocale = [NSLocale localeWithLocaleIdentifier:@"en_US_POSIX"];
    [dateFormatter setLocale:enUSPOSIXLocale];
    [dateFormatter setDateFormat:@"yyyy-MM-dd'T'HH-mm-ss"];
    
    session.dateString = [dateFormatter stringFromDate:session.date];
    session.metadataFilename = [NSString stringWithFormat:@"%@-%@-meta.csv", session.accountDescription.uuid, session.dateString];
    session.lpcFilename = [NSString stringWithFormat:@"%@-%@-lpc.csv", session.accountDescription.uuid, session.dateString];
    session.audioFilename = [NSString stringWithFormat:@"%@-%@-audio.caf", session.accountDescription.uuid, session.dateString];
    
    return session;
}

+ (NSDictionary *) metadataDictionaryFromMetadataCSVDictionary:(NSDictionary *)metadataFileDict
{
    NSMutableDictionary *retDict = [NSMutableDictionary dictionary];
    [retDict setObject:[metadataFileDict objectForKey:@"username"] forKey:LPCAccountDescriptionKeyName];
    [retDict setObject:[metadataFileDict objectForKey:@"gender"] forKey:LPCAccountDescriptionKeyGender];
    [retDict setObject:[metadataFileDict objectForKey:@"age"] forKey:LPCAccountDescriptionKeyAge];
    [retDict setObject:[metadataFileDict objectForKey:@"heightFeet"] forKey:LPCAccountDescriptionKeyHeightFeet];
    [retDict setObject:[metadataFileDict objectForKey:@"heightInches"] forKey:LPCAccountDescriptionKeyHeightInches];
    [retDict setObject:[metadataFileDict objectForKey:@"gender"] forKey:LPCAccountDescriptionKeyGender];
    return [NSDictionary dictionaryWithDictionary:retDict];
}

+ (instancetype) sessionWithMetadataFile:(NSString *)metadata
{
    LPCRecordingSession *session = [[LPCRecordingSession alloc] init];
    NSDateFormatter *dateFormatter = [LPCRecordingSession recordingSessionDateFormatter];
    session.metadataFilename = metadata;
    NSString *applicationSupportDirectory = [APAudioManager applicationAppSupportDirectory];
    NSString *urlSafeString = [applicationSupportDirectory stringByAppendingPathComponent:metadata];
    NSURL *metadataURL = [NSURL fileURLWithPath:urlSafeString];
    NSError *error = nil;
    NSArray<CHCSVOrderedDictionary *> *rows = [NSArray arrayWithContentsOfCSVURL:metadataURL options:CHCSVParserOptionsUsesFirstLineAsKeys|CHCSVParserOptionsSanitizesFields|CHCSVParserOptionsTrimsWhitespace];
    if (error) {
        NSLog(@"%@", [error localizedDescription]);
    }
    
    session.dateString = [rows[0] objectForKey:@"start_date"];
    session.lpcFilename = [[rows[0] objectForKey:@"lpc_file"] lastPathComponent];
    session.audioFilename = [[rows[0] objectForKey:@"audio_file"] lastPathComponent];
    session.accountDescription = [LPCAccountDescription accountDescriptionWithRecordingMetadataURL:metadataURL];
    session.date = [dateFormatter dateFromString:session.dateString];
    return session;
}

+ (NSArray<LPCRecordingSession *> *) recordingsForAccount:(LPCAccountDescription *)account
{
    NSMutableArray *retArray = [NSMutableArray array];
    NSString *applicationSupportDirectory = [APAudioManager applicationAppSupportDirectory];
    
    NSFileManager *manager = [NSFileManager defaultManager];
    NSArray *fileList = [manager directoryContentsAtPath:applicationSupportDirectory];
    for (NSString *s in fileList){
        if ([s hasSuffix:@"-meta.csv"]) {
            LPCRecordingSession *session = [LPCRecordingSession sessionWithMetadataFile:s];
            if (session && [session.accountDescription.uuid isEqualToString:account.uuid]) {
                [retArray addObject:[session recordingFilesDictionary]];
            }
        }
    }
    
    return [NSArray arrayWithArray:retArray];
}

- (LPCRecordingSessionData) dataWithLpcOrder:(uint16_t)lpcOrder
{
    NSString *applicationSupportDirectory = [APAudioManager applicationAppSupportDirectory];
    NSString *escapedSupportDir = [applicationSupportDirectory stringByAddingPercentEncodingWithAllowedCharacters:[NSCharacterSet URLPathAllowedCharacterSet]];
    NSURL *audioFileURL = [[NSURL URLWithString:escapedSupportDir] URLByAppendingPathComponent:self.audioFilename];
    NSURL *lpcFileURL = [[NSURL URLWithString:escapedSupportDir] URLByAppendingPathComponent:self.lpcFilename];
    NSURL *metadataFileURL = [[NSURL URLWithString:escapedSupportDir] URLByAppendingPathComponent:self.metadataFilename];
    
    LPCRecordingSessionData data;
    data.accountUUID = [self.accountDescription.uuid cStringUsingEncoding:NSUTF8StringEncoding];
    
    if ([self.accountDescription.metadata objectForKey:LPCAccountDescriptionKeyName]) {
        data.username = [[self.accountDescription.metadata objectForKey:LPCAccountDescriptionKeyName] cStringUsingEncoding:NSUTF8StringEncoding];
    } else {
        data.username = nil;
    }
    if ([self.accountDescription.metadata objectForKey:LPCAccountDescriptionKeyGender]) {
        data.gender = [[self.accountDescription.metadata objectForKey:LPCAccountDescriptionKeyGender] cStringUsingEncoding:NSUTF8StringEncoding];
    } else {
        data.gender = nil;
    }
    if ([self.accountDescription.metadata objectForKey:LPCAccountDescriptionKeyAge]) {
        data.ageInYears = [[self.accountDescription.metadata objectForKey:LPCAccountDescriptionKeyAge] integerValue];
    } else {
        data.ageInYears = -1;
    }
    if ([self.accountDescription.metadata objectForKey:LPCAccountDescriptionKeyHeightFeet]) {
        data.heightFeet = [[self.accountDescription.metadata objectForKey:LPCAccountDescriptionKeyHeightFeet] integerValue];
    } else {
        data.ageInYears = -1;
    }
    if ([self.accountDescription.metadata objectForKey:LPCAccountDescriptionKeyHeightInches]) {
        data.heightInches = [[self.accountDescription.metadata objectForKey:LPCAccountDescriptionKeyHeightInches] integerValue];
    } else {
        data.ageInYears = -1;
    }
    
    data.targetF3 = self.accountDescription.targetF3;
    data.stdevF3 = self.accountDescription.stdevF3;
    data.targetLPCOrder = self.accountDescription.targetLPCOrder;
    data.audio_path = [[[audioFileURL absoluteString] stringByRemovingPercentEncoding] cStringUsingEncoding:NSUTF8StringEncoding];
    data.lpc_path = [[[lpcFileURL absoluteString] stringByRemovingPercentEncoding] cStringUsingEncoding:NSUTF8StringEncoding];
    data.metadata_path = [[[metadataFileURL absoluteString] stringByRemovingPercentEncoding] cStringUsingEncoding:NSUTF8StringEncoding];
    data.date_string = [self.dateString cStringUsingEncoding:NSUTF8StringEncoding];
    data.identifier = [[[[UIDevice currentDevice] identifierForVendor] UUIDString] cStringUsingEncoding:NSUTF8StringEncoding];
    data.lpc_order = lpcOrder;
    
    return data;
}

- (NSDictionary *)recordingFilesDictionary
{
    NSString *applicationSupportDirectory = [APAudioManager applicationAppSupportDirectory];
    NSMutableDictionary *mutRep = [NSMutableDictionary dictionary];
    [mutRep setObject:[applicationSupportDirectory stringByAppendingPathComponent:self.metadataFilename] forKey:kMetadataKey];
    [mutRep setObject:[applicationSupportDirectory stringByAppendingPathComponent:self.lpcFilename] forKey:kLPCKey];
    [mutRep setObject:[applicationSupportDirectory stringByAppendingPathComponent:self.audioFilename] forKey:kAudioKey];
    return mutRep;
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
