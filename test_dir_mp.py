import mediapipe
print(dir(mediapipe))
try:
    import mediapipe.solutions
    print("Found mediapipe.solutions")
except ImportError:
    print("No mediapipe.solutions")
