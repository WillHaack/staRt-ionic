//
//  LPCDisplayView.m
//  AudioPlugin
//
//  Created by Sam Tarakajian on 5/30/16.
//  Copyright © 2016 Girlfriends Labs. All rights reserved.
//

#import "LPCDisplayView.h"

@interface LPCDisplayView ()
@property (nonatomic, strong) NSArray *lpcCoefficients;
@property (nonatomic, strong) NSArray *peakPointsPairs;
@end

@implementation LPCDisplayView

- (id) initWithCoder:(NSCoder *)aDecoder
{
    self = [super initWithCoder:aDecoder];
    if (self) {
        self.frequencyScaling = 1.0;
    }
    return self;
}

- (void) setLPCCoefficients:(NSArray *)coefficients
{
    self.lpcCoefficients = coefficients;
    [self setNeedsDisplay];
}

- (void) setPeakPoints:(NSArray *)peakPoints
{
    self.peakPointsPairs = peakPoints;
}

- (void) drawRect:(CGRect)rect
{
    CGContextRef ctx =  UIGraphicsGetCurrentContext();
    CGContextSetFillColorWithColor(ctx, [UIColor blueColor].CGColor);
    CGContextFillRect(ctx, rect);
    
    CGContextSetStrokeColorWithColor(ctx, [UIColor blackColor].CGColor);
    CGContextSetLineWidth(ctx, 3);
    for (int i=0; i<self.lpcCoefficients.count; i++) {
        CGFloat py = [[self.lpcCoefficients objectAtIndex:i] doubleValue];
        py = (py * -1.0) * self.frame.size.height;
        CGFloat px = i * self.frame.size.width / (self.lpcCoefficients.count - 1);
        px = px * self.frequencyScaling;
        if (px > self.frame.size.width)
            continue;
        if (i==0)
            CGContextMoveToPoint(ctx, px, py);
        else
            CGContextAddLineToPoint(ctx, px, py);
    }
    CGContextStrokePath(ctx);
    
    for (int i=0; i<self.peakPointsPairs.count; i+=2) {
        CGPoint p1, p2;
        CGPointMakeWithDictionaryRepresentation((__bridge CFDictionaryRef) self.peakPointsPairs[i], &p1);
        CGPointMakeWithDictionaryRepresentation((__bridge CFDictionaryRef) self.peakPointsPairs[i+1], &p2);
        p1.x = (p1.x/2.0 + 0.5) * self.frequencyScaling * self.frame.size.width;
        p2.x = (p2.x/2.0 + 0.5) * self.frequencyScaling * self.frame.size.width;
        p1.y *= (-1.0 * self.frame.size.height);
        p2.y *= (-1.0 * self.frame.size.height);
        CGContextMoveToPoint(ctx, p1.x, p1.y);
        CGContextAddLineToPoint(ctx, p2.x, p2.y);
    }
    CGContextSetStrokeColorWithColor(ctx, [UIColor greenColor].CGColor);
    CGContextStrokePath(ctx);
}

@end
