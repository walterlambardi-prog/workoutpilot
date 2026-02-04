package com.anonymous.workoutpilot

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.location.Location
import android.os.Build
import android.os.Looper
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import org.json.JSONArray
import org.json.JSONObject

class StepTrackerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), SensorEventListener {

    companion object {
        private const val MODULE_NAME = "StepTracker"
        private const val CHANNEL_ID = "step_tracker_channel"
        private const val NOTIFICATION_ID = 1001
        private const val PREFS_NAME = "StepTrackerPrefs"
        private const val KEY_POSITIONS = "pending_positions"
        private const val MAX_STORED_POSITIONS = 750
    }

    private val sensorManager: SensorManager = reactContext.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    private val stepSensor: Sensor? = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER)
    private val fusedLocationClient: FusedLocationProviderClient = LocationServices.getFusedLocationProviderClient(reactContext)
    private val notificationManager: NotificationManager = reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    private val sharedPrefs: SharedPreferences = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    private var isTracking = false
    private var initialStepCount = 0
    private var currentSteps = 0
    private var sessionStartTime = 0L

    private val locationCallback = object : LocationCallback() {
        override fun onLocationResult(locationResult: LocationResult) {
            if (!isTracking) return

            locationResult.locations.forEach { location ->
                // Try to send event to JavaScript
                val eventSent = try {
                    if (reactApplicationContext.hasActiveReactInstance()) {
                        sendLocationUpdate(location)
                        true
                    } else {
                        false
                    }
                } catch (e: Exception) {
                    false
                }
                
                // If event wasn't sent (app in background), save to SharedPreferences
                if (!eventSent) {
                    saveLocationToPrefs(location)
                    android.util.Log.d("StepTracker", "App in background, saved position to SharedPreferences")
                }
            }
        }
    }

    init {
        createNotificationChannel()
    }

    override fun getName() = MODULE_NAME

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Step Tracking",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Tracks your step-based activities in background"
            }
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun saveLocationToPrefs(location: Location) {
        try {
            val positionsJson = sharedPrefs.getString(KEY_POSITIONS, "[]") ?: "[]"
            val positions = JSONArray(positionsJson)
            
            val newPosition = JSONObject().apply {
                put("latitude", location.latitude)
                put("longitude", location.longitude)
                put("accuracy", location.accuracy)
                put("altitude", location.altitude)
                put("speed", location.speed)
                put("timestamp", System.currentTimeMillis())
            }
            
            positions.put(newPosition)
            
            // Keep only last MAX_STORED_POSITIONS
            val trimmedPositions = JSONArray()
            val startIndex = maxOf(0, positions.length() - MAX_STORED_POSITIONS)
            for (i in startIndex until positions.length()) {
                trimmedPositions.put(positions.get(i))
            }
            
            sharedPrefs.edit().putString(KEY_POSITIONS, trimmedPositions.toString()).apply()
            android.util.Log.d("StepTracker", "Saved position ${positions.length()}: ${location.latitude}, ${location.longitude}")
        } catch (e: Exception) {
            android.util.Log.e("StepTracker", "Error saving position", e)
            // Silently fail - don't crash the tracking
        }
    }

    private fun sendEvent(eventName: String, params: WritableMap) {
        if (reactApplicationContext.hasActiveReactInstance()) {
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        }
    }

    private fun sendLocationUpdate(location: Location) {
        val params = Arguments.createMap().apply {
            putDouble("latitude", location.latitude)
            putDouble("longitude", location.longitude)
            putDouble("accuracy", location.accuracy.toDouble())
            putDouble("altitude", location.altitude)
            putDouble("speed", location.speed.toDouble())
            putDouble("timestamp", System.currentTimeMillis().toDouble())
        }
        sendEvent("onLocationUpdate", params)
    }

    private fun createNotification(steps: Int, distanceKm: Double, durationMs: Long): Notification {
        val notificationIntent = Intent(reactApplicationContext, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            reactApplicationContext,
            0,
            notificationIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val hours = durationMs / 3600000
        val minutes = (durationMs % 3600000) / 60000
        val seconds = (durationMs % 60000) / 1000

        val durationText = if (hours > 0) {
            String.format("%d:%02d:%02d", hours, minutes, seconds)
        } else {
            String.format("%d:%02d", minutes, seconds)
        }

        val contentText = String.format(
            "%,d steps • %.2f km • %s",
            steps,
            distanceKm,
            durationText
        )

        return NotificationCompat.Builder(reactApplicationContext, CHANNEL_ID)
            .setContentTitle("Step tracking in progress")
            .setContentText(contentText)
            .setSmallIcon(android.R.drawable.ic_menu_compass)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun updateNotification() {
        if (!isTracking) return

        val durationMs = System.currentTimeMillis() - sessionStartTime
        // Calculate distance from steps (rough estimate: 0.762 meters per step)
        val distanceKm = (currentSteps * 0.762) / 1000.0

        val notification = createNotification(currentSteps, distanceKm, durationMs)
        notificationManager.notify(NOTIFICATION_ID, notification)
    }

    @ReactMethod
    fun requestPermissions(promise: Promise) {
        android.util.Log.d("StepTracker", "📋 Requesting permissions...")
        
        val result = Arguments.createMap()

        // Check step counter availability
        val motionStatus = when {
            stepSensor == null -> {
                android.util.Log.w("StepTracker", "❌ Step sensor not available on this device")
                "unavailable"
            }
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q -> {
                val permission = ContextCompat.checkSelfPermission(
                    reactApplicationContext,
                    android.Manifest.permission.ACTIVITY_RECOGNITION
                )
                if (permission == PackageManager.PERMISSION_GRANTED) {
                    android.util.Log.d("StepTracker", "✅ ACTIVITY_RECOGNITION permission already granted")
                    "granted"
                } else {
                    android.util.Log.d("StepTracker", "⚠️ ACTIVITY_RECOGNITION permission not granted, will be requested by Expo")
                    "denied"
                }
            }
            else -> {
                android.util.Log.d("StepTracker", "✅ ACTIVITY_RECOGNITION not required (API < 29)")
                "granted"
            }
        }
        result.putString("motion", motionStatus)

        // Check location permission
        val fineLocation = ContextCompat.checkSelfPermission(
            reactApplicationContext,
            android.Manifest.permission.ACCESS_FINE_LOCATION
        )
        val backgroundLocation = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ContextCompat.checkSelfPermission(
                reactApplicationContext,
                android.Manifest.permission.ACCESS_BACKGROUND_LOCATION
            )
        } else {
            PackageManager.PERMISSION_GRANTED
        }

        val locationStatus = if (fineLocation == PackageManager.PERMISSION_GRANTED &&
            backgroundLocation == PackageManager.PERMISSION_GRANTED) "granted" else "denied"
        
        result.putString("location", locationStatus)
        
        android.util.Log.d("StepTracker", "📋 Permissions status - Motion: $motionStatus, Location: $locationStatus")

        promise.resolve(result)
    }

    @ReactMethod
    fun startTracking(promise: Promise) {
        if (isTracking) {
            promise.resolve(Arguments.createMap().apply {
                putBoolean("success", true)
                putString("message", "Already tracking")
            })
            return
        }

        isTracking = true
        sessionStartTime = System.currentTimeMillis()
        initialStepCount = 0
        currentSteps = 0
        
        // Clear previous positions when starting new session
        sharedPrefs.edit().remove(KEY_POSITIONS).apply()

        // Start step counting
        stepSensor?.let {
            android.util.Log.d("StepTracker", "📱 Registering step sensor listener")
            sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_UI)
            android.util.Log.d("StepTracker", "✅ Step sensor listener registered")
        } ?: run {
            android.util.Log.e("StepTracker", "❌ Step sensor is NULL - device doesn't support step counting")
        }

        // Start location updates
        try {
            val locationRequest = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 3000)
                .setMinUpdateDistanceMeters(5f)
                .setMinUpdateIntervalMillis(3000)
                .setMaxUpdateDelayMillis(5000)
                .build()

            if (ActivityCompat.checkSelfPermission(
                    reactApplicationContext,
                    android.Manifest.permission.ACCESS_FINE_LOCATION
                ) == PackageManager.PERMISSION_GRANTED
            ) {
                fusedLocationClient.requestLocationUpdates(
                    locationRequest,
                    locationCallback,
                    Looper.getMainLooper()
                )
            }
        } catch (e: Exception) {
            sendEvent("onError", Arguments.createMap().apply {
                putString("message", e.message)
            })
        }

        // Start foreground notification
        val notification = createNotification(0, 0.0, 0)
        notificationManager.notify(NOTIFICATION_ID, notification)

        promise.resolve(Arguments.createMap().apply {
            putBoolean("success", true)
            putString("message", "Tracking started")
        })
    }

    @ReactMethod
    fun stopTracking(promise: Promise) {
        if (!isTracking) {
            promise.resolve(Arguments.createMap().apply {
                putBoolean("success", true)
                putString("message", "Not tracking")
            })
            return
        }

        isTracking = false

        // Stop step counting
        sensorManager.unregisterListener(this)

        // Stop location updates
        fusedLocationClient.removeLocationUpdates(locationCallback)

        // Remove notification
        notificationManager.cancel(NOTIFICATION_ID)
        
        // Clear stored positions after stop
        sharedPrefs.edit().remove(KEY_POSITIONS).apply()

        promise.resolve(Arguments.createMap().apply {
            putBoolean("success", true)
            putString("message", "Tracking stopped")
        })
    }

    @ReactMethod
    fun isTracking(promise: Promise) {
        promise.resolve(Arguments.createMap().apply {
            putBoolean("isTracking", isTracking)
        })
    }

    @ReactMethod
    fun getPendingPositions(promise: Promise) {
        try {
            val positionsJson = sharedPrefs.getString(KEY_POSITIONS, "[]") ?: "[]"
            val positions = JSONArray(positionsJson)
            
            android.util.Log.d("StepTracker", "getPendingPositions called, found ${positions.length()} positions")
            
            val result = Arguments.createArray()
            for (i in 0 until positions.length()) {
                val pos = positions.getJSONObject(i)
                val posMap = Arguments.createMap().apply {
                    putDouble("latitude", pos.getDouble("latitude"))
                    putDouble("longitude", pos.getDouble("longitude"))
                    putDouble("accuracy", pos.getDouble("accuracy"))
                    putDouble("altitude", pos.optDouble("altitude", 0.0))
                    putDouble("speed", pos.optDouble("speed", 0.0))
                    putDouble("timestamp", pos.getLong("timestamp").toDouble())
                }
                result.pushMap(posMap)
            }
            
            // Clear after reading
            sharedPrefs.edit().remove(KEY_POSITIONS).apply()
            android.util.Log.d("StepTracker", "Cleared pending positions after reading")
            
            promise.resolve(result)
        } catch (e: Exception) {
            android.util.Log.e("StepTracker", "Error getting pending positions", e)
            promise.reject("GET_POSITIONS_ERROR", e.message)
        }
    }

    // SensorEventListener methods
    override fun onSensorChanged(event: SensorEvent) {
        android.util.Log.d("StepTracker", "🔔 onSensorChanged: sensor=${event.sensor.type}, isTracking=$isTracking")
        
        if (!isTracking || event.sensor.type != Sensor.TYPE_STEP_COUNTER) {
            android.util.Log.d("StepTracker", "⏭️ Skipping sensor event")
            return
        }

        val totalSteps = event.values[0].toInt()
        android.util.Log.d("StepTracker", "📊 Total steps from sensor: $totalSteps")

        if (initialStepCount == 0) {
            initialStepCount = totalSteps
            android.util.Log.d("StepTracker", "🔢 Initial step count set to: $initialStepCount")
        }

        currentSteps = totalSteps - initialStepCount
        val distanceKm = (currentSteps * 0.762) / 1000.0
        
        android.util.Log.d("StepTracker", "✅ Current steps: $currentSteps, distance: $distanceKm km")

        val params = Arguments.createMap().apply {
            putInt("steps", currentSteps)
            putDouble("distance", distanceKm) // Rough estimate
            putDouble("timestamp", System.currentTimeMillis().toDouble())
        }
        
        android.util.Log.d("StepTracker", "📤 Sending onStepUpdate event: steps=$currentSteps, distance=$distanceKm")
        sendEvent("onStepUpdate", params)
        android.util.Log.d("StepTracker", "✅ onStepUpdate event sent successfully")

        // Update notification every 10 steps
        if (currentSteps % 10 == 0) {
            updateNotification()
        }
    }

    override fun onAccuracyChanged(sensor: Sensor, accuracy: Int) {
        // Not needed
    }
}
