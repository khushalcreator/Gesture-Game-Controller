import pyautogui
import pynput
from pynput.keyboard import Controller, Key
from config import KEY_BINDINGS
import time

class InputController:
    def __init__(self):
        self.keyboard = Controller()
        self.current_action = None
        self.active_keys = set()
        
        # Safety: Fail-safe if mouse goes to corner
        pyautogui.FAILSAFE = True
        
    def execute_action(self, action_name):
        """Executes the key/mouse action associated with the gesture."""
        
        # If the action is the same as current, do nothing (hold key)
        if action_name == self.current_action:
            return

        # Release previous keys if action changed
        self.release_all()
        
        if action_name is None or action_name == 'stop':
            self.current_action = None
            return

        self.current_action = action_name
        key_map = KEY_BINDINGS.get(action_name)

        if key_map:
            if key_map == 'click':
                pyautogui.click() # One-time click, or hold? sticking to simple click for now or we can use mouseDown
                # For continuous fire, we might want mouseDown. Let's stick to click for simplicity or handle logic.
                # If 'fire' is continuous, we should use mouseDown.
                # Let's assume 'fire' is a trigger.
            else:
                self.press_key(key_map)
                
    def press_key(self, key_str):
        """Presses a key securely."""
        try:
            key = self._get_key_object(key_str)
            self.keyboard.press(key)
            self.active_keys.add(key)
            print(f"Pressed: {key_str}")
        except Exception as e:
            print(f"Error pressing key {key_str}: {e}")

    def release_all(self):
        """Releases all currently held keys."""
        for key in list(self.active_keys):
            try:
                self.keyboard.release(key)
            except Exception as e:
                print(f"Error releasing key: {e}")
        self.active_keys.clear()
        self.current_action = None

    def _get_key_object(self, key_str):
        """Helper to convert string to pynput Key object."""
        if hasattr(Key, key_str):
            return getattr(Key, key_str)
        return key_str # Return character directly

if __name__ == "__main__":
    # Test
    ic = InputController()
    time.sleep(1)
    ic.execute_action('jump')
    time.sleep(0.5)
    ic.execute_action('stop')
