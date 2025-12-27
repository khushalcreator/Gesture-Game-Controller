# GestureNEO - Gesture-Based Game Controller

A production-ready full-stack application that enables users to control games using hand gestures via their webcam. Powered by MediaPipe hand tracking, TensorFlow.js, and React.

## 🎯 Features

- **Real-time Hand Gesture Recognition**: Uses MediaPipe to detect 7+ hand gestures in real-time
- **Game Profile Management**: Create and customize gesture mappings for different games
- **Replit Auth Integration**: Secure user authentication with Replit OpenID Connect
- **PostgreSQL Database**: Persistent storage for user profiles and custom gestures
- **Responsive UI**: Cyberpunk-themed interface optimized for desktop and mobile
- **Webcam Integration**: Direct browser access to camera for gesture detection

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (automatically provisioned on Replit)
- Modern browser with webcam

### Installation

```bash
# Install dependencies
npm install

# Set up database
npm run db:push

# Start development server
npm run dev
```

The app will be available at `http://localhost:5000`

## 📖 How to Use

### 1. **Login**
Click "INITIALIZE LINK" on the login page to authenticate with Replit Auth

### 2. **Create a Game Profile**
- Click "NEW PROFILE" on the dashboard
- Enter a name (e.g., "Minecraft", "Clash Royale")
- Click "CREATE PROFILE"

### 3. **Map Gestures**
- Click the settings icon on a profile card
- Configure gesture-to-key mappings:
  - **Open_Palm** → Space (jump)
  - **Pointing_Up** → W (move forward)
  - **Closed_Fist** → E (interact)
  - Add more mappings as needed
- Adjust sensitivity and smoothing sliders
- Click "SAVE CONFIGURATION"

### 4. **Play**
- Click "LAUNCH" to enter play mode
- Allow camera access when prompted
- Your hand skeleton will appear on screen
- Move your hand to trigger gestures and control your game

## 🏗️ Architecture

```
├── client/src/
│   ├── pages/              # React pages
│   │   ├── Dashboard.tsx      # Profile listing
│   │   ├── ProfileEditor.tsx  # Gesture mapping UI
│   │   ├── PlayMode.tsx       # Game controller mode
│   │   └── Login.tsx          # Auth page
│   ├── components/
│   │   ├── CameraFrame.tsx    # MediaPipe integration
│   │   └── Layout.tsx         # App shell
│   ├── hooks/
│   │   ├── use-auth.ts        # Auth state management
│   │   └── use-game-profiles.ts # Profile CRUD
│   └── lib/
│       └── gesture-recognition.ts # Gesture logic
│
├── server/
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Database layer
│   ├── db.ts              # Drizzle ORM setup
│   └── replit_integrations/auth/ # Auth setup
│
├── shared/
│   ├── schema.ts          # Drizzle tables + Zod types
│   ├── routes.ts          # API contract definitions
│   └── models/auth.ts     # Auth schema
```

## 🎮 Supported Gestures

- **Open_Palm**: All fingers extended
- **Closed_Fist**: All fingers curled
- **Pointing_Up**: Only index finger extended
- **Victory**: Index + Middle extended
- **Thumb_Up**: Thumb extended upward
- **Thumb_Down**: Thumb extended downward
- **Rock_Sign**: Index + Pinky extended

## 🔧 Environment Variables

```env
DATABASE_URL=postgresql://user:password@host:port/dbname
SESSION_SECRET=your-session-secret-here
REPL_ID=your-replit-id
ISSUER_URL=https://replit.com/oidc
```

All variables are automatically set on Replit.

## 📊 API Endpoints

### Profiles
- `GET /api/profiles` - List user profiles
- `POST /api/profiles` - Create new profile
- `GET /api/profiles/:id` - Get single profile
- `PUT /api/profiles/:id` - Update profile
- `DELETE /api/profiles/:id` - Delete profile

### Gestures
- `GET /api/gestures` - List custom gestures
- `POST /api/gestures` - Save custom gesture
- `DELETE /api/gestures/:id` - Delete gesture

### Auth
- `GET /api/login` - Initiate login
- `GET /api/logout` - Logout
- `GET /api/auth/user` - Get current user
- `POST /api/seed` - Seed demo profiles (for testing)

## 🛠️ Tech Stack

**Frontend:**
- React 18 + TypeScript
- Wouter (routing)
- TanStack Query (data fetching)
- Tailwind CSS (styling)
- shadcn/ui (components)
- MediaPipe Hands (gesture tracking)
- react-webcam (camera access)

**Backend:**
- Express.js
- Drizzle ORM
- PostgreSQL
- Replit Auth (OAuth)

**DevTools:**
- Vite
- TSX
- TypeScript

## 📝 Development Notes

### Gesture Recognition Algorithm
Currently uses simple heuristics based on hand landmark positions:
- Compares finger tip Y-position relative to PIP joint
- Calculates thumb extension using Euclidean distance
- Returns `None` if no clear gesture detected

For production, consider:
- Training custom ML models on labeled gesture data
- Implementing confidence thresholds
- Adding smoothing filters to reduce jitter

### Database Schema
Uses Drizzle ORM with PostgreSQL:
- `users` - Replit Auth users
- `game_profiles` - User gesture mappings
- `custom_gestures` - User-defined gestures
- `sessions` - Express session store

Run `npm run db:push` after schema changes.

### Performance Optimization
- Canvas rendering at 60 FPS via `requestAnimationFrame`
- Lazy loading of MediaPipe models
- Image compression for webcam frames
- Query caching via TanStack Query

## 🚀 Deployment

### Replit Deployment
Simply click the "Publish" button in Replit. The app will be deployed automatically with:
- HTTPS
- Custom domain support
- Zero-downtime deployments
- Built-in database backups

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Verify `DATABASE_URL` is set
- [ ] Configure `SESSION_SECRET` (random 32+ char string)
- [ ] Test auth flow with production domain
- [ ] Enable CORS if needed for external APIs
- [ ] Set up monitoring/alerting
- [ ] Review gesture thresholds for your use case

## 📄 License

MIT - Feel free to fork, modify, and deploy!

## 🤝 Contributing

Issues and pull requests welcome. See CONTRIBUTING.md for guidelines.

## 📧 Support

Questions? Open an issue on GitHub or contact the maintainers.

---

**Built with ❤️ for gesture control enthusiasts**
