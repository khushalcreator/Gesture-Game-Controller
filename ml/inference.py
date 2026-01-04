import numpy as np
try:
    import tensorflow as tf
except ImportError:
    tf = None
    print("Warning: TensorFlow not found. ML features disabled.")
import joblib
import os

class GestureClassifier:
    def __init__(self, model_path='ml/model/gesture_model.h5', label_path='ml/model/label_encoder.pkl'):
        self.model_path = model_path
        self.label_path = label_path
        self.model = None
        self.label_encoder = None
        self.load_model()

    def load_model(self):
        """Loads the trained model and label encoder if they exist."""
        if tf is None:
             print("TensorFlow not available.")
             self.model = None
             return

        if os.path.exists(self.model_path) and os.path.exists(self.label_path):
            try:
                self.model = tf.keras.models.load_model(self.model_path)
                self.label_encoder = joblib.load(self.label_path)
                print("ML Model loaded successfully.")
            except Exception as e:
                print(f"Error loading model: {e}")
                self.model = None
        else:
            print("No trained model found. Using rule-based fallback.")
            self.model = None

    def predict(self, features, threshold=0.85):
        """
        Predicts gesture from features.
        features: List or array of 63 normalized landmark coordinates (x, y, z).
        Returns: (gesture_name, confidence)
        """
        if self.model is None or self.label_encoder is None:
            return None, 0.0

        input_data = np.array([features], dtype=np.float32)
        
        try:
            prediction = self.model.predict(input_data, verbose=0)
            class_id = np.argmax(prediction)
            confidence = prediction[0][class_id]
            
            if confidence >= threshold:
                gesture_name = self.label_encoder.inverse_transform([class_id])[0]
                return gesture_name, float(confidence)
            else:
                return "Unknown", float(confidence)
        except Exception as e:
            print(f"Prediction error: {e}")
            return None, 0.0
