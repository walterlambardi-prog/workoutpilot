#import "WalkingTrackingModule.h"
#import <CoreMotion/CoreMotion.h>
#import <CoreLocation/CoreLocation.h>

@interface WalkingTrackingModule () <CLLocationManagerDelegate>
@property (nonatomic, strong) CMPedometer *pedometer;
@property (nonatomic, strong) CLLocationManager *locationManager;
@property (nonatomic, strong) NSDate *sessionStartDate;
@property (nonatomic, assign) NSInteger initialStepCount;
@property (nonatomic, assign) BOOL isTracking;
@property (nonatomic, assign) BOOL hasListeners;
@property (nonatomic, strong) NSMutableArray *pendingPositions;
@end

@implementation WalkingTrackingModule

RCT_EXPORT_MODULE(WalkingTracking);

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        _pedometer = [[CMPedometer alloc] init];
        _locationManager = [[CLLocationManager alloc] init];
        _locationManager.delegate = self;
        _locationManager.desiredAccuracy = kCLLocationAccuracyBest;
        _locationManager.distanceFilter = 5.0; // Update every 5 meters
        _locationManager.allowsBackgroundLocationUpdates = YES;
        _locationManager.pausesLocationUpdatesAutomatically = NO;
        _isTracking = NO;
        _hasListeners = NO;
        _pendingPositions = [[NSMutableArray alloc] init];
        [self loadPendingPositions];
    }
    return self;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[@"onStepUpdate", @"onLocationUpdate", @"onError", @"onPermissionStatus"];
}

- (void)startObserving {
    _hasListeners = YES;
}


- (void)loadPendingPositions {
    NSArray *savedPositions = [[NSUserDefaults standardUserDefaults] arrayForKey:@"WalkingPendingPositions"];
    if (savedPositions) {
        _pendingPositions = [savedPositions mutableCopy];
    } else {
        _pendingPositions = [[NSMutableArray alloc] init];
    }
}

- (void)savePendingPositions {
    // Keep only last 750 positions
    if (_pendingPositions.count > 750) {
        NSRange range = NSMakeRange(_pendingPositions.count - 750, 750);
        _pendingPositions = [[_pendingPositions subarrayWithRange:range] mutableCopy];
    }
    [[NSUserDefaults standardUserDefaults] setObject:_pendingPositions forKey:@"WalkingPendingPositions"];
    [[NSUserDefaults standardUserDefaults] synchronize];
}

- (void)saveLocationToStorage:(CLLocation *)location {
    NSDictionary *positionDict = @{
        @"latitude": @(location.coordinate.latitude),
        @"longitude": @(location.coordinate.longitude),
        @"accuracy": @(location.horizontalAccuracy),
        @"altitude": @(location.altitude),
        @"speed": @(location.speed),
        @"timestamp": @([location.timestamp timeIntervalSince1970] * 1000)
    };
    
    [_pendingPositions addObject:positionDict];
    [self savePendingPositions];
}

- (void)clearPendingPositions {
    _pendingPositions = [[NSMutableArray alloc] init];
    [[NSUserDefaults standardUserDefaults] removeObjectForKey:@"WalkingPendingPositions"];
    [[NSUserDefaults standardUserDefaults] synchronize];
}
- (void)stopObserving {
    _hasListeners = NO;
}

RCT_EXPORT_METHOD(requestPermissions:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    // Request Motion permission
    if (![CMPedometer isStepCountingAvailable]) {
        [self sendEventIfHasListeners:@"onError" body:@{@"message": @"Step counting not available"}];
        resolve(@{@"motion": @"unavailable", @"location": @"unknown"});
        return;
    }
    
    // Request Location permission
    CLAuthorizationStatus locationStatus = [CLLocationManager authorizationStatus];
    
    if (locationStatus == kCLAuthorizationStatusNotDetermined) {
        [_locationManager requestAlwaysAuthorization];
    }
    
    // Check motion authorization (iOS 11+)
    if (@available(iOS 11.0, *)) {
        CMAuthorizationStatus motionStatus = [CMPedometer authorizationStatus];
        NSString *motionPermission = @"unknown";
        
        switch (motionStatus) {
            case CMAuthorizationStatusAuthorized:
                motionPermission = @"granted";
                break;
            case CMAuthorizationStatusDenied:
            case CMAuthorizationStatusRestricted:
                motionPermission = @"denied";
                break;
            case CMAuthorizationStatusNotDetermined:
                motionPermission = @"unknown";
                break;
        }
        
        NSString *locationPermission = [self locationPermissionString:locationStatus];
        
        resolve(@{
            @"motion": motionPermission,
            @"location": locationPermission
        });
    } else {
        NSString *locationPermission = [self locationPermissionString:locationStatus];
        resolve(@{
            @"motion": @"granted", // Assume granted on older iOS
            @"location": locationPermission
        });
    }
}

- (NSString *)locationPermissionString:(CLAuthorizationStatus)status {
    switch (status) {
        case kCLAuthorizationStatusAuthorizedAlways:
        case kCLAuthorizationStatusAuthorizedWhenInUse:
            return @"granted";
        case kCLAuthorizationStatusDenied:
        case kCLAuthorizationStatusRestricted:
            return @"denied";
        case kCLAuthorizationStatusNotDetermined:
            return @"unknown";
        default:
            return @"unknown";
    }
}

RCT_EXPORT_METHOD(startTracking:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (_isTracking) {
        resolve(@{@"success": @YES, @"message": @"Already tracking"});
        return;
    }
    
    _isTracking = YES;
    _sessionStartDate = [NSDate date];
    _initialStepCount = 0;
    
    // Clear previous pending positions when starting new session
    [self clearPendingPositions];
    
    // Start pedometer updates
    if ([CMPedometer isStepCountingAvailable]) {
        [_pedometer startPedometerUpdatesFromDate:_sessionStartDate
                                      withHandler:^(CMPedometerData * _Nullable pedometerData, NSError * _Nullable error) {
            if (error) {
                [self sendEventIfHasListeners:@"onError" body:@{@"message": error.localizedDescription}];
                return;
            }
            
            if (pedometerData) {
                NSInteger steps = [pedometerData.numberOfSteps integerValue];
                double distance = [pedometerData.distance doubleValue] / 1000.0; // Convert to km
                
                [self sendEventIfHasListeners:@"onStepUpdate" body:@{
                    @"steps": @(steps),
                    @"distance": @(distance),
                    @"timestamp": @([[NSDate date] timeIntervalSince1970] * 1000)
                }];
            }
        }];
    }
    
    // Start location updates
    [_locationManager startUpdatingLocation];
    
    resolve(@{@"success": @YES, @"message": @"Tracking started"});
}

RCT_EXPORT_METHOD(stopTracking:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (!_isTracking) {
        resolve(@{@"success": @YES, @"message": @"Not tracking"});
        return;
    }
    
    _isTracking = NO;
    
    // Stop pedometer
    [_pedometer stopPedometerUpdates];
    
    // Stop location updates
    [_locationManager stopUpdatingLocation];
    
    // Clear pending positions after stop
    [self clearPendingPositions];
    
    _sessionStartDate = nil;
    
    resolve(@{@"success": @YES, @"message": @"Tracking stopped"});
}

RCT_EXPORT_METHOD(isTracking:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    resolve(@{@"isTracking": @(_isTracking)});
}

RCT_EXPORT_METHOD(getPendingPositions:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSArray *positions = [_pendingPositions copy];
    
    // Clear after reading
    [self clearPendingPositions];
    
    resolve(positions);
}

// CLLocationManagerDelegate methods
- (void)locationManager:(CLLocationManager *)manager didUpdateLocations:(NSArray<CLLocation *> *)locations {
    if (!_isTracking || locations.count == 0) {
        return;
    }
    
    CLLocation *location = [locations lastObject];
    
    // Try to send event if listeners are active (app in foreground)
    if (_hasListeners) {
        [self sendEventWithName:@"onLocationUpdate" body:@{
            @"latitude": @(location.coordinate.latitude),
            @"longitude": @(location.coordinate.longitude),
            @"accuracy": @(location.horizontalAccuracy),
            @"altitude": @(location.altitude),
            @"speed": @(location.speed),
            @"timestamp": @([location.timestamp timeIntervalSince1970] * 1000)
        }];
    } else {
        // App in background, save to UserDefaults for later retrieval
        [self saveLocationToStorage:location];
        NSLog(@"[WalkingTracking] App in background, saved position to UserDefaults");
    }
}

- (void)locationManager:(CLLocationManager *)manager didFailWithError:(NSError *)error {
    [self sendEventIfHasListeners:@"onError" body:@{
        @"message": error.localizedDescription,
        @"code": @(error.code)
    }];
}

- (void)locationManager:(CLLocationManager *)manager didChangeAuthorizationStatus:(CLAuthorizationStatus)status {
    NSString *permissionString = [self locationPermissionString:status];
    [self sendEventIfHasListeners:@"onPermissionStatus" body:@{
        @"location": permissionString
    }];
}

- (void)sendEventIfHasListeners:(NSString *)eventName body:(id)body {
    if (_hasListeners) {
        [self sendEventWithName:eventName body:body];
    }
}

@end
