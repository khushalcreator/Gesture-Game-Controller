## Packages
@mediapipe/tasks-vision | For hand tracking and landmark detection
react-webcam | specific React component for handling webcam streams
clsx | utility for constructing className strings
tailwind-merge | utility for merging tailwind classes

## Notes
- MediaPipe tasks-vision requires WASM files which are loaded from a CDN by default.
- The app uses simple heuristic gesture recognition (Fist, Open Palm, Pointing, Peace) based on landmark positions.
- Authentication is handled via Replit Auth (/api/login, /api/logout, /api/auth/user).
