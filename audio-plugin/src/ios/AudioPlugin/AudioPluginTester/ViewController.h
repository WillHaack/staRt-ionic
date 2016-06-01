//
//  ViewController.h
//  AudioPluginTester
//
//  Created by Sam Tarakajian on 5/19/16.
//  Copyright © 2016 Girlfriends Labs. All rights reserved.
//

#import <UIKit/UIKit.h>

@class LPCDisplayView;

@interface ViewController : UIViewController
@property (nonatomic, strong) IBOutlet LPCDisplayView *lpcDisplayView;

- (IBAction)startRecording:(id)sender;
- (IBAction)stopRecording:(id)sender;
- (IBAction)listRecordings:(id)sender;

@end

