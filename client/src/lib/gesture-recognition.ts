/**
 * Simple heuristic-based gesture recognition
 * 
 * MediaPipe HandLandmarker landmarks structure:
 * 0: Wrist
 * 1-4: Thumb (1: cmc, 2: mcp, 3: ip, 4: tip)
 * 5-8: Index (5: mcp, 6: pip, 7: dip, 8: tip)
 * 9-12: Middle
 * 13-16: Ring
 * 17-20: Pinky
 */

export type GestureType = 
  | "None" 
  | "Closed_Fist" 
  | "Open_Palm" 
  | "Pointing_Up" 
  | "Victory" 
  | "Thumb_Up" 
  | "Thumb_Down"
  | "Rock_Sign";

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export function recognizeGesture(landmarks: Landmark[]): GestureType {
  if (!landmarks || landmarks.length === 0) return "None";

  // Helper to check if a finger is extended (Tip Y < PIP Y)
  // Note: Y coordinates are normalized (0 = top, 1 = bottom), so smaller Y means higher up
  const isFingerExtended = (tipIdx: number, pipIdx: number) => {
    return landmarks[tipIdx].y < landmarks[pipIdx].y;
  };
  
  // Specifically for thumb: compare X distance for horizontal movement or Y for vertical
  // Simplified: Thumb is extended if tip is far from pinky base (MCP)
  const isThumbExtended = () => {
    // Simple heuristic: distance from thumb tip to pinky mcp
    const dx = landmarks[4].x - landmarks[17].x;
    const dy = landmarks[4].y - landmarks[17].y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    return dist > 0.2; // Threshold needs tuning
  };

  const thumb = isThumbExtended();
  const index = isFingerExtended(8, 6);
  const middle = isFingerExtended(12, 10);
  const ring = isFingerExtended(16, 14);
  const pinky = isFingerExtended(20, 18);

  // Recognition Logic
  
  // 1. Open Palm: All fingers extended
  if (index && middle && ring && pinky && thumb) {
    return "Open_Palm";
  }

  // 2. Closed Fist: No fingers extended (except maybe thumb depending on grip)
  if (!index && !middle && !ring && !pinky) {
    // Check thumb orientation for Thumb Up/Down
    // If thumb is clearly above wrist and other fingers are curled
    if (landmarks[4].y < landmarks[3].y && landmarks[4].y < landmarks[0].y) {
       return "Thumb_Up";
    }
    // If thumb is clearly below wrist
    if (landmarks[4].y > landmarks[3].y && landmarks[4].y > landmarks[0].y) {
       return "Thumb_Down";
    }
    return "Closed_Fist";
  }

  // 3. Pointing Up: Only Index extended
  if (index && !middle && !ring && !pinky) {
    return "Pointing_Up";
  }

  // 4. Victory / Peace: Index + Middle extended
  if (index && middle && !ring && !pinky) {
    return "Victory";
  }

  // 5. Rock Sign: Index + Pinky extended
  if (index && !middle && !ring && pinky) {
    return "Rock_Sign";
  }

  return "None";
}
