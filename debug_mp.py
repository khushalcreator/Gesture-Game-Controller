import mediapipe as mp
print("MediaPipe imported.")
try:
    print(f"Solutions: {mp.solutions}")
except AttributeError:
    print("mp.solutions missing")
    try:
        import mediapipe.python.solutions as solutions
        print(f"Found via python.solutions: {solutions}")
    except ImportError:
        print("mediapipe.python.solutions not found")
