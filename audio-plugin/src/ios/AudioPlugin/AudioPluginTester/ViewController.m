//
//  ViewController.m
//  AudioPluginTester
//
//  Created by Sam Tarakajian on 5/19/16.
//  Copyright © 2016 Girlfriends Labs. All rights reserved.
//

#import "ViewController.h"
#import "APAudioManager.h"

@interface ViewController ()
@property (nonatomic, strong) APAudioManager *audioManager;
@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    
    self.audioManager = [[APAudioManager alloc] init];
    [self.audioManager start];
    
    CADisplayLink *lnk = [CADisplayLink displayLinkWithTarget:self selector:@selector(printCurrentCoefficients)];
    [lnk addToRunLoop:[NSRunLoop currentRunLoop]
              forMode:NSRunLoopCommonModes];
}

- (void) printCurrentCoefficients
{
    NSArray *coeffs = [self.audioManager lpcCoefficients];
    NSLog(@"Coefficients: %@", coeffs);
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

@end
