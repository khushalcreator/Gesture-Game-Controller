import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION'] = 'python'

from flask import Flask, render_template, Response
from flask_sock import Sock
import cv2
import json
import threading
import time
from gesture_engine import GestureEngine
from input_controller import InputController
from config import KEY_BINDINGS, GAME_PROFILES

app = Flask(__name__)
sock = Sock(app)

gesture_engine = GestureEngine()
input_controller = InputController()

# Global state
current_gesture = "None"
is_active = False
camera = None
active_profile_name = 'Racing' # Default

def get_camera():
    global camera
    if camera is None:
        camera = cv2.VideoCapture(0)
    return camera

def generate_frames():
    global current_gesture, is_active, active_profile_name
    cam = get_camera()
    while True:
        success, frame = cam.read()
        if not success:
            break
        
        # Mirror frame
        frame = cv2.flip(frame, 1)
        
        detected = "None"
        if is_active:
            frame, detected = gesture_engine.process_frame(frame)
            current_gesture = detected
            
            # Map gesture to action based on Active Profile
            current_mapping = GAME_PROFILES.get(active_profile_name, {})
            action = current_mapping.get(detected)
            
            input_controller.execute_action(action)

        else:
            # Just show feed, no processing
            pass

        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@sock.route('/ws')
def ws_connect(ws):
    global is_active, active_profile_name
    while True:
        data = ws.receive()
        if data:
            msg = json.loads(data)
            if 'command' in msg:
                cmd = msg['command']
                if cmd == 'start':
                    is_active = True
                elif cmd == 'stop':
                    is_active = False
                    input_controller.release_all()
                elif cmd == 'set_profile':
                    new_profile = msg.get('profile')
                    if new_profile in GAME_PROFILES:
                        active_profile_name = new_profile
                        # Send back the new mapping for UI update
                        ws.send(json.dumps({
                            'status': 'profile_updated', 
                            'profile': active_profile_name,
                            'mapping': GAME_PROFILES[active_profile_name]
                        }))

                elif cmd == 'start_recording':
                     label = msg.get('label', 'unknown')
                     gesture_engine.start_recording(label)
                elif cmd == 'stop_recording':
                     count = gesture_engine.stop_recording()
                     ws.send(json.dumps({'status': 'recording_stop', 'count': count}))
                elif cmd == 'train_model':
                     try:
                         from ml.train_model import train_gesture_model
                         success, message = train_gesture_model()
                         if success:
                             gesture_engine.reload_model()
                         ws.send(json.dumps({'status': 'training_complete', 'success': success, 'message': message}))
                     except ImportError as e:
                         ws.send(json.dumps({'status': 'training_complete', 'success': False, 'message': f"Training failed: {e}. TensorFlow might be missing."}))
                     except Exception as e:
                         ws.send(json.dumps({'status': 'training_complete', 'success': False, 'message': f"Training error: {e}"}))

            
        # Send status update
        ws.send(json.dumps({
            'gesture': current_gesture,
            'active': is_active,
            'profile': active_profile_name
        }))

if __name__ == '__main__':
    # Run in threaded mode to support WebSocket and Video Feed concurrently
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
