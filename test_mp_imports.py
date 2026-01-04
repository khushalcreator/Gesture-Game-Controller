import mediapipe
import os
print(f"File: {mediapipe.__file__}")
print(f"Path: {mediapipe.__path__}")
try:
    import mediapipe.python
    print("Imported mediapipe.python")
except ImportError as e:
    print(f"Failed mediapipe.python: {e}")

try:
    import mediapipe.tasks
    print("Imported mediapipe.tasks")
except ImportError as e:
    print(f"Failed mediapipe.tasks: {e}")
