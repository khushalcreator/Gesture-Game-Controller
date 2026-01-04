print("Importing cv2...")
import cv2
print("Importing mediapipe...")
import mediapipe as mp
print("Importing numpy...")
import numpy as np

print("Initializing Hands...")
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(max_num_hands=1)
print("Hands initialized.")

print("Opening Camera...")
cap = cv2.VideoCapture(0)
if cap.isOpened():
    print("Camera opened successfully.")
    ret, frame = cap.read()
    if ret:
        print("Frame capture successful.")
    else:
        print("Frame capture failed.")
    cap.release()
else:
    print("Camera failed to open.")

print("Done.")
