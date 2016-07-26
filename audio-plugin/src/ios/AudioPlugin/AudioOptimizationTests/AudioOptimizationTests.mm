//
//  AudioOptimizationTests.m
//  AudioOptimizationTests
//
//  Created by Sam Tarakajian on 7/25/16.
//  Copyright © 2016 Girlfriends Labs. All rights reserved.
//

#import "AudioManager.h"
#import <XCTest/XCTest.h>
#import <Accelerate/Accelerate.h>
#include <complex>
#include <math.h>

#define TEST_MAT_DIM        40

@interface AudioOptimizationTests : XCTestCase

@end

@implementation AudioOptimizationTests

- (void)setUp {
    [super setUp];
    // Put setup code here. This method is called before the invocation of each test method in the class.
}

- (void)tearDown {
    // Put teardown code here. This method is called after the invocation of each test method in the class.
    [super tearDown];
}

- (void)testMatrixInversion {
    
    // Here's an N by N matrix
    long size = 40;
    double mat[size][MAX_LPC_ORDER];
    double mat1[size+1][MAX_LPC_ORDER];
    double mat2[size][MAX_LPC_ORDER];
    for (int i=0; i<size; i++) {
        for (int j=0; j<size; j++) {
            mat[i][j] = drand48();
        }
    }
    
    // For some reason, builtin minvert ignores the first row+column (?)
    for (int i=0; i<size; i++) {
        for (int j=0; j<size; j++) {
            mat1[i+1][j+1] = mat[i][j];
        }
    }
    memcpy(mat2, mat, sizeof(double) * size * MAX_LPC_ORDER);
    
    for (int i=0; i<size; i++) {
        for (int j=0; j<size; j++) {
            XCTAssertEqual(mat[i][j], mat1[i+1][j+1], "Apparently I didn't copy memory correctly");
            XCTAssertEqual(mat[i][j], mat2[i][j], "Apparently I didn't copy memory correctly");
        }
    }
    
    // Do the inversion in the first matrix, using the old method
    minvert(size, mat1);
    
    // Now do the inversion the vectorized way
    vminvert(size, mat2);
    
    // Make sure the two are equal
    for (int i=0; i<size; i++) {
        for (int j=0; j<size; j++) {
            XCTAssertEqualWithAccuracy(mat1[i+1][j+1], mat2[i][j], 0.001, "Matrices did not calculate the same inverse");
        }
    }
}

- (void)testPerformanceOldInverse {
    const long size = TEST_MAT_DIM;
    double mat[TEST_MAT_DIM][MAX_LPC_ORDER];
//    double **mat1 = (double **) malloc(sizeof(double *) * (TEST_MAT_DIM + 1));
//    for (int i=0; i<(TEST_MAT_DIM+1); i++)
//        mat1[i] = (double *) malloc(sizeof(double) * MAX_LPC_ORDER);
    double mat1[size+1][MAX_LPC_ORDER];
//    double mat2[size][MAX_LPC_ORDER];
    for (int i=0; i<size; i++) {
        for (int j=0; j<size; j++) {
            mat[i][j] = drand48();
        }
    }
    // For some reason, builtin minvert ignores the first row+column (?)
    for (int i=0; i<size; i++) {
        for (int j=0; j<size; j++) {
            mat1[i+1][j+1] = mat[i][j];
        }
    }
    
    NSData *data = [NSData dataWithBytes:mat1 length:(sizeof(double) * (size+1) * MAX_LPC_ORDER)];
    [self measureBlock:^{
        minvert(size, (double (*)[MAX_LPC_ORDER])[data bytes]);
    }];
}

- (void)testPerformanceVectorizedInverse
{
    long size = TEST_MAT_DIM;
    double mat[TEST_MAT_DIM][MAX_LPC_ORDER];
    double mat2[size][MAX_LPC_ORDER];
    for (int i=0; i<size; i++) {
        for (int j=0; j<size; j++) {
            mat[i][j] = drand48();
        }
    }
    memcpy(mat2, mat, sizeof(double) * size * MAX_LPC_ORDER);
    
    NSData *data = [NSData dataWithBytes:mat2 length:(sizeof(double) * (size) * MAX_LPC_ORDER)];
    [self measureBlock:^{
        vminvert(size, (double (*)[MAX_LPC_ORDER])[data bytes]);
    }];
}

static void computeLPCFreqResp(Float32 gain, long m_lpc_magSpecResolution, long m_lpc_order, double *m_lpc_coeffs, double *m_lpc_mag_buffer)
{
    double incr = M_PI / ((double)m_lpc_magSpecResolution - 1.0);
    std::complex<double> I(0.0,1.0);
    std::complex<double> One(1.0,0.0);
    
    for (int k=0; k<m_lpc_magSpecResolution; k++) {
        std::complex<double> tmp_sum(0.0,0.0);
        double angle = ((double)k)*incr;
        for (int j=0; j<m_lpc_order+1; j++) {
            tmp_sum += m_lpc_coeffs[j] * exp(angle*j*I);
        }
        m_lpc_mag_buffer[k] = gain/(abs(tmp_sum) + 1e-20);
    }
}

static void computeLPCFreqRespV(Float32 gain, long m_lpc_magSpecResolution, long m_lpc_order, double *m_lpc_coeffs, double *m_lpc_mag_buffer)
{
    double incr = M_PI / ((double)m_lpc_magSpecResolution - 1.0);
    float vin[m_lpc_magSpecResolution][(m_lpc_order+1)*2];
    float vout[m_lpc_magSpecResolution][(m_lpc_order+1)*2];
    
    for (int k=0; k<m_lpc_magSpecResolution; k++) {
        double angle = ((double)k)*incr;
        for (int j=0; j<m_lpc_order+1; j++) {
            vin[k][2*j] = m_lpc_coeffs[j];
            vin[k][2*j+1] = angle*j;
        }
    }
    vDSP_rect((float *)vin, 2, (float *)vout, 2, (m_lpc_order+1) * m_lpc_magSpecResolution);
    for (int k=0; k<m_lpc_magSpecResolution; k++) {
        std::complex<double> tmp_sum(0.0,0.0);
        for (int j=0; j<m_lpc_order+1; j++) {
            tmp_sum += std::complex<double>(vout[k][2*j], vout[k][2*j+1]);
        }
        m_lpc_mag_buffer[k] = gain/(abs(tmp_sum) + 1e-20);
    }
}

- (void)testAutocorrelation
{
    long size = 5;
    float data[] = {1, 2, 3, 4, 5};
    float result1[size];
    float result2[(size*2-1)];
    
    memset(result1, 0, sizeof(float) * size);
    memset(result2, 0, sizeof(float) * (size*2-1));
    
    autocorr(size, data, result1);
    vautocorr(size, data, result2);
    
    for (int i=0; i<size; i++)
        printf("%f,", result1[i]);
    printf("\n------------------\n");
    for (int i=0; i<(size*2-1); i++)
        printf("%f,", result2[i]);
}

- (void)testFrequencyResponseCalc
{
    Float32 gain = 1.0;
    long m_lpc_magSpecResolution = 256;
    long m_lpc_order = 45;
    double m_lpc_coeffs[m_lpc_order+1];
    double m_lpc_mag_buffer1[m_lpc_magSpecResolution];
    double m_lpc_mag_buffer2[m_lpc_magSpecResolution];
    
    for (int i=0; i<m_lpc_order+1; i++) {
        m_lpc_coeffs[i] = drand48();
    }
    
    computeLPCFreqResp(gain, m_lpc_magSpecResolution, m_lpc_order, m_lpc_coeffs, m_lpc_mag_buffer1);
    computeLPCFreqRespV(gain, m_lpc_magSpecResolution, m_lpc_order, m_lpc_coeffs, m_lpc_mag_buffer2);
    
    for (int i=0; i<m_lpc_magSpecResolution; i++) {
        XCTAssertEqualWithAccuracy(m_lpc_mag_buffer1[i], m_lpc_mag_buffer2[i], 0.01, "Matrices did not calculate the same inverse");
    }
}

- (void)testPerformanceOldFreqResponse
{
    Float32 gain = 1.0;
    long m_lpc_magSpecResolution = 256;
    long m_lpc_order = 45;
    double m_lpc_coeffs[m_lpc_order+1];
    
    for (int i=0; i<m_lpc_order+1; i++) {
        m_lpc_coeffs[i] = drand48();
    }
    
    NSData *data = [NSData dataWithBytes:m_lpc_coeffs length:(sizeof(double) * (m_lpc_order+1))];
    [self measureBlock:^{
        double m_lpc_mag_buffer1[m_lpc_magSpecResolution];
        computeLPCFreqResp(gain, m_lpc_magSpecResolution, m_lpc_order, (double *)[data bytes], m_lpc_mag_buffer1);
    }];
}

- (void)testPerformanceVectorizedFreqResponse
{
    Float32 gain = 1.0;
    long m_lpc_magSpecResolution = 256;
    long m_lpc_order = 45;
    double m_lpc_coeffs[m_lpc_order+1];
    
    for (int i=0; i<m_lpc_order+1; i++) {
        m_lpc_coeffs[i] = drand48();
    }
    
    NSData *data = [NSData dataWithBytes:m_lpc_coeffs length:(sizeof(double) * (m_lpc_order+1))];
    [self measureBlock:^{
        double m_lpc_mag_buffer1[m_lpc_magSpecResolution];
        computeLPCFreqRespV(gain, m_lpc_magSpecResolution, m_lpc_order, (double *)[data bytes], m_lpc_mag_buffer1);
    }];
}

@end
