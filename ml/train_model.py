import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import joblib
import os

DATASET_PATH = 'ml/dataset.csv'
MODEL_PATH = 'ml/model/gesture_model.h5'
LABEL_PATH = 'ml/model/label_encoder.pkl'

def train_gesture_model():
    if not os.path.exists(DATASET_PATH):
        print("Dataset not found!")
        return False, "Dataset not found"

    try:
        # Load dataset
        df = pd.read_csv(DATASET_PATH, header=None)
        
        # Check if dataset is empty or malformed
        if df.empty or df.shape[1] < 64: # Label + 63 features
            print("Dataset invalid or empty.")
            return False, "Dataset invalid"

        X = df.iloc[:, 1:].values.astype(np.float32)
        y = df.iloc[:, 0].values

        # Encode labels
        label_encoder = LabelEncoder()
        y_encoded = label_encoder.fit_transform(y)
        num_classes = len(label_encoder.classes_)

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)

        # Build Model (MLP)
        model = tf.keras.models.Sequential([
            tf.keras.layers.Dense(128, activation='relu', input_shape=(63,)),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(num_classes, activation='softmax')
        ])

        model.compile(optimizer='adam',
                      loss='sparse_categorical_crossentropy',
                      metrics=['accuracy'])

        # Train
        model.fit(X_train, y_train, epochs=20, batch_size=32, validation_data=(X_test, y_test), verbose=1)

        # Evaluate
        loss, accuracy = model.evaluate(X_test, y_test)
        print(f"Test Accuracy: {accuracy*100:.2f}%")

        # Save artifacts
        model.save(MODEL_PATH)
        joblib.dump(label_encoder, LABEL_PATH)
        
        return True, f"Accuracy: {accuracy*100:.2f}%"

    except Exception as e:
        print(f"Training failed: {e}")
        return False, str(e)

if __name__ == "__main__":
    train_gesture_model()
