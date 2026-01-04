
# Gesture NEO 🎮✋

**Play video games without a keyboard. Your hands are the controller.**

![System Active](https://github.com/user-attachments/assets/placeholder-image-link)
*(Replace this link with a screenshot or demo GIF)*

Gesture NEO is a real-time, AI-powered gesture control interface that translates hand movements into keyboard and mouse inputs. Built for gamers who want to experience a new way of playing FPS, Racing, and Platformer games.

## 🚀 Features

- **Real-Time Tracking**: Powered by **Google MediaPipe** for high-fidelity hand landmark detection.
- **Low Latency**: Uses **WebSockets** and **Flask** to stream state changes instantly to the game loop.
- **Game Profiles**: Pre-configured modes for different genres:
  - **FPS (Shooter)**: Crouch (👌), Fire (👍), Move (Index).
  - **Racing (Sim)**: Gas (👍), Brake (👌), Reverse (✊).
  - **Platformer**: Optimized for 2D side-scrollers.
- **Glassmorphic UI**: A modern, dark-themed responsive web interface.
- **Customizable**: Easy to add new gestures and mappings in Python.

## 🛠️ Tech Stack

- **Core**: Python 3.9+
- **Computer Vision**: OpenCV, MediaPipe
- **Web Framework**: Flask, Flask-Sock
- **Input Automation**: Pynput, PyAutoGUI
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)

## 📦 Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/khushalcreator/Gesture-Game-Controller.git
    cd Gesture-Game-Controller
    ```

2.  **Install dependencies**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Run the Application**
    ```bash
    python app.py
    ```

4.  **Open the Controller**
    Navigate to `http://localhost:5000` in your web browser.

## 🎮 Controls

### **FPS Mode**
| Gesture | Action | In-Game Bind |
| :--- | :--- | :--- |
| **Thumbs Up** 👍 | Fire | `Left Click` |
| **OK Sign** 👌 | Crouch | `C` / `Ctrl` |
| **Index Finger** 👉 | Move Right | `D` |
| **Left Swipe** 🤟 | Move Left | `A` |
| **Open Palm** ✋ | Forward | `W` |

### **Racing Mode**
| Gesture | Action | In-Game Bind |
| :--- | :--- | :--- |
| **Thumbs Up** 👍 | Accelerate | `W` |
| **OK Sign** 👌 | Brake | `Space` |
| **Fist** ✊ | Reverse | `S` |

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
*Built with ❤️ by [Your Name]*
