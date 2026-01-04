import mediapipe as mp
try:
    print(f"Solutions: {mp.solutions}")
    print(f"Hands: {mp.solutions.hands}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
