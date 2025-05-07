# LED Control Server

A lightweight Flask server that serves a simple web interface for controlling LED animations and settings over a local network. Built for quick prototyping and syncing LED behavior via HTTP + JavaScript.

## 🚀 Getting Started

1. Clone the Repo

git clone https://github.com/CasualCaleb/ledtube-server.git
cd LEDServer

2. Set Up the Environment

python -m venv .venv
source .venv/bin/activate   # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

3. Run the Server

python LEDServer.py

Then open your browser and navigate to:

http://127.0.0.1:5000

## 🛠 Tech Stack

- Python 3.x
- Flask 3.1
- HTML5 + JavaScript (vanilla)
- Local network communication (extendable with UDP, serial, etc.)

## 📦 Dependencies

See requirements.txt. Core dependency:

- Flask

## 📄 License

MIT — do what you want, just don’t sue me.

## 🧠 Author

Made by Caleb McMullin fueled by house beats, LED strips, and a mild obsession with overengineering lighting systems.
