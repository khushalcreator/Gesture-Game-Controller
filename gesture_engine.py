import cv2
import mediapipe as mp
import numpy as np
import csv
import os
import time
from ml.inference import GestureClassifier
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

class GestureEngine:
    def __init__(self):
        base_options = python.BaseOptions(model_asset_path='ml/hand_landmarker_new.task')
        options = vision.HandLandmarkerOptions(base_options=base_options,
                                               num_hands=1,
                                               min_hand_detection_confidence=0.7,
                                               min_hand_presence_confidence=0.5,
                                               min_tracking_confidence=0.5)
        self.detector = vision.HandLandmarker.create_from_options(options)
        
        # Drawing utils might still be in solutions, or we implement simple drawing
        try:
            self.mp_draw = mp.solutions.drawing_utils
            self.mp_hands_style = mp.solutions.hands
        except:
            self.mp_draw = None # Fallback to manual drawing if needed

        # ML Components
        self.classifier = GestureClassifier()
        self.is_recording = False
        self.recording_label = ""
        self.dataset_path = 'ml/dataset.csv'
        self.sample_count = 0

    def process_frame(self, frame, use_ml=True):
        """Processes a frame. use_ml toggles between ML and Heuristic."""
        # MediaPipe Tasks requires RGB image
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)
        
        # Detect
        results = self.detector.detect(mp_image)
        
        detected_gesture = "None"
        confidence = 0.0
        
        if results.hand_landmarks:
            for hand_landmarks in results.hand_landmarks:
                # Normalize landmarks for drawing/logic (Tasks API returns list of NormalizedLandmark objects)
                
                # Draw landmarks (Manual implementation if mp_draw fails or using legacy style)
                if self.mp_draw:
                    # Need to convert to proto-like object for mp_draw or draw manually
                    # mp_draw expects protobuf. It's tricky with Tasks API objects.
                    # Let's draw manually to be safe and dependency-free.
                    self._draw_landmarks(frame, hand_landmarks)
                else:
                     self._draw_landmarks(frame, hand_landmarks)
                
                # Feature Extraction
                features = self._extract_features(hand_landmarks)
                
                # Recording Mode
                if self.is_recording:
                    self._save_sample(self.recording_label, features)
                    detected_gesture = f"RECORDING: {self.recording_label} ({self.sample_count})"
                    cv2.putText(frame, detected_gesture, (10, 80), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                
                # Inference Mode
                elif use_ml and self.classifier.model is not None:
                    detected_gesture, confidence = self.classifier.predict(features)
                else:
                    # Fallback to Heuristic
                    detected_gesture = self._classify_gesture_heuristic(hand_landmarks)
                
                # Visual Feedback
                if not self.is_recording:
                    display_text = f"Gesture: {detected_gesture} ({confidence:.2f})" if use_ml and self.classifier.model else f"Gesture: {detected_gesture} (Rule)"
                    cv2.putText(frame, display_text, (10, 50), 
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)

        return frame, detected_gesture

    def _draw_landmarks(self, image, landmarks):
        """Draws landmarks manually."""
        h, w, _ = image.shape
        # Connections for hand
        CONNECTIONS = [
            (0,1), (1,2), (2,3), (3,4), # Thumb
            (0,5), (5,6), (6,7), (7,8), # Index
            (9,10), (10,11), (11,12),   # Middle (Correction: 9 connects to where? 5-9, 9-13, 13-17 are palm)
            (13,14), (14,15), (15,16),  # Ring
            (0,17), (17,18), (18,19), (19,20), # Pinky
            (5,9), (9,13), (13,17) # Palm
        ]
        
        # Draw points
        points = []
        for lm in landmarks:
            cx, cy = int(lm.x * w), int(lm.y * h)
            points.append((cx, cy))
            cv2.circle(image, (cx, cy), 5, (0, 255, 0), -1)
            
        # Draw lines
        for start_idx, end_idx in CONNECTIONS:
             if start_idx < len(points) and end_idx < len(points):
                 cv2.line(image, points[start_idx], points[end_idx], (255, 255, 255), 2)

    def _extract_features(self, landmarks):
        """Converts landmarks to a flattened normalized feature vector (relative to wrist)."""
        # Wrist is point 0
        # Tasks API landmarks have .x, .y, .z attributes
        base_x, base_y, base_z = landmarks[0].x, landmarks[0].y, landmarks[0].z
        
        features = []
        for lm in landmarks:
            features.extend([lm.x - base_x, lm.y - base_y, lm.z - base_z])
            
        return features

    def _save_sample(self, label, features):
        """Appends a sample to the CSV dataset."""
        row = [label] + features
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(self.dataset_path), exist_ok=True)
        
        with open(self.dataset_path, 'a', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(row)
        
        self.sample_count += 1

    def start_recording(self, label):
        self.is_recording = True
        self.recording_label = label
        self.sample_count = 0
        
    def stop_recording(self):
        self.is_recording = False
        self.recording_label = ""
        return self.sample_count

    def reload_model(self):
        self.classifier.load_model()

    def _classify_gesture_heuristic(self, landmarks):
        """Original heuristic logic (renamed)."""
        # Note: landmarks is a list of NormalizedLandmark objects in Tasks API
        lms = landmarks 
        fingers = []
        
        # Thumb
        if lms[4].x < lms[3].x: fingers.append(1)
        else: fingers.append(0)
             
        # 4 Fingers
        if lms[8].y < lms[6].y: fingers.append(1)
        else: fingers.append(0)
        
        if lms[12].y < lms[10].y: fingers.append(1)
        else: fingers.append(0)
        
        if lms[16].y < lms[14].y: fingers.append(1)
        else: fingers.append(0)
        
        if lms[20].y < lms[18].y: fingers.append(1)
        else: fingers.append(0)
        
        total_fingers = fingers.count(1)
        
        if total_fingers == 0 or (total_fingers == 1 and fingers[0] == 1):
            return "fist"
        if total_fingers == 5:
            return "open_palm"
        if fingers[1] == 1 and fingers[2] == 1 and fingers[3] == 0 and fingers[4] == 0:
            return "two_fingers"
        if fingers[1] == 1 and fingers[2] == 0 and fingers[3] == 0 and fingers[4] == 0:
            return "index_finger" 
        if fingers[1] == 1 and fingers[2] == 0 and fingers[3] == 0 and fingers[4] == 0:
            return "index_finger" 
        
        # Thumbs Up/Down Logic (Refined)
        # Check if other fingers are curled
        if fingers[1] == 0 and fingers[2] == 0 and fingers[3] == 0 and fingers[4] == 0:
            # Check Thumb Orientation (Y-axis)
            # Tip (4) < IP (3) means UP (y decreases upwards)
            if lms[4].y < lms[3].y:
                return "thumb_up"
            # Tip (4) > IP (3) means DOWN
            elif lms[4].y > lms[3].y:
                return "thumb_down"

        if fingers[0] == 1 and fingers[1] == 0 and fingers[2] == 0 and fingers[3] == 0 and fingers[4] == 0:
             # Fallback to original if Y-check fails but X-check passed (maybe side orientation?)
             return "thumb_up"
        if fingers[1] == 1 and fingers[4] == 1 and fingers[2] == 0 and fingers[3] == 0:
            return "left_swipe"

        return "None"

    def release(self):
        # Detector clean up
        self.detector.close()
