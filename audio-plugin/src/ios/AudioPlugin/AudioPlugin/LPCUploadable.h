//
//  LPCUploadable.h
//  lpc_app
//
//  Created by Sam Tarakajian on 2/3/16.
//
//

#import <Foundation/Foundation.h>

@protocol LPCUploadable <NSObject>

- (NSString *) title;
- (NSUInteger) numberOfAttachments;
- (NSString *) nameForAttachmentAtIndex:(NSUInteger)index;
- (NSString *) mimeTypeForAttachmentAtIndex:(NSUInteger)index;
- (NSData *) dataForAttachmentAtIndex:(NSUInteger)index;

@end
