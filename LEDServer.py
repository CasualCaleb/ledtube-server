from flask import Flask, render_template, request
import socket

class LightTube:
    def __init__(self, ip, group=""):
        self.ip = ip
        self.group = group

devices = []
UDP_PORT = 4210

# Setup UDP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

# Setup Flask app
app = Flask(__name__)

@app.route('/')
def handle_root():
    return render_template("index.html"), 200

@app.route('/ping')
def handle_ping():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
    sock.settimeout(1.5)

    # Broadcast ping
    sock.sendto("LEDPing:;".encode(), ('192.168.0.255', UDP_PORT))

    devices.clear()
    try:
        while True:
            ip = sock.recvfrom(1024)[1][0]   # Retrieves IP from address
            devices.append(LightTube(ip))
    except socket.timeout:
        pass  # Stop listening after timeout

    sock.close()
    return {'status': 'done', 'devices': list({device.ip for device in devices})}, 200

@app.route('/udp')
def handle_udp():
    command = request.args.get('command', '')
    for device in devices:
        sock.sendto(command.encode(), (device.ip, UDP_PORT))
    return {'status': 'sent', 'command': command}, 200

@app.route('/combo')
def handle_combo():
    foreground = request.args.get('FG', '')
    background = request.args.get('BG', '')

    for device in devices:
        if device.group == 'FG':
            sock.sendto(foreground.encode(), (device.ip, UDP_PORT))
        elif device.group == 'BG':
            sock.sendto(background.encode(), (device.ip, UDP_PORT))
    return {'status': 'sent'}, 200


if __name__ == "__main__":
    app.run('0.0.0.0', 5000, debug=True)