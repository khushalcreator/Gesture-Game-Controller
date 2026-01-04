import cv2

# Camera Settings
CAMERA_INDEX = 0
FRAME_WIDTH = 640
FRAME_HEIGHT = 480
FPS = 30

# Gesture Mapping
# Available Actions: 'jump', 'move_forward', 'move_left', 'move_right', 'fire', 'stop', 'crouch', 'sprint'
# Game Profiles and Mappings
GAME_PROFILES = {
    'Racing': {
        'open_palm': 'move_forward',
        'fist': 'reverse',
        'index_finger': 'move_right',
        'thumb_up': 'fire',
        'two_fingers': 'jump',
        'left_swipe': 'move_left',
    },
    'FPS': {
        'open_palm': 'move_forward',
        'fist': 'stop',
        'index_finger': 'move_right',
        'left_swipe': 'move_left',
        'thumb_up': 'fire', # Shoot
        'two_fingers': 'jump',
        'ok_sign': 'crouch', # New gesture for crouching
    },
    'Platformer': {
        'open_palm': 'right', # Run Right
        'fist': 'stop',
        'left_swipe': 'left', # Run Left
        'two_fingers': 'jump',
        'index_finger': 'interact',
    }
}

# Key Bindings (Action -> Key/Mouse)
KEY_BINDINGS = {
    # Movement
    'move_forward': 'w',
    'move_right': 'd',
    'move_left': 'a',
    'reverse': 's',
    'stop': None,
    
    # Actions
    'jump': 'space',
    'fire': 'click',
    'crouch': 'ctrl',
    'sprint': 'shift',
    
    # Platformer Specific
    'right': 'right', # Arrow keys
    'left': 'left',
    'interact': 'e',
}

# Gesture Detection Thresholds
CONFIDENCE_THRESHOLD = 0.7
SMOOTHING_FACTOR = 5 # Number of frames to confirm a gesture

# UI Settings
Colors = {
    'text': (255, 255, 255),
    'box': (0, 255, 0),
    'alert': (0, 0, 255)
}
