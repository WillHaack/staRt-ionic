//
//  LPCRecordingSessionData.h
//  lpc_app
//
//  Created by Sam Tarakajian on 12/2/15.
//
//

#ifndef LPCRecordingSessionData_h
#define LPCRecordingSessionData_h

typedef struct {
    const char  *accountUUID;
    const char  *username;
    const char  *gender; // Probably 'male' or 'female', but could in principle be whatever
    int16_t     ageInYears; // -1 if undefined
    int16_t     heightFeet; // -1 if undefined
    int16_t     heightInches; // -1 if undefined
    const char  *date_string;
    const char  *metadata_path;
    const char  *lpc_path;
    const char  *audio_path;
    const char  *identifier;
    uint16_t lpc_order;
} LPCRecordingSessionData;

#endif /* LPCRecordingSessionData_h */
