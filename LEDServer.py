from flask import Flask, render_template, request
import socket

devices = []
UDP_PORT = 4210

class LightTube:
    def __init__(self, ip):
        self.ip = ip
        self.group = ''
        self.status = True

# Setup Flask app
app = Flask(__name__)

@app.route('/')
def handle_root():
    return render_template("index.html"), 200

@app.route('/devices/setGroup')
def handle_set_group():
    ip = request.args.get('ip')
    group = request.args.get('group')

    for d in devices:
        if d.ip == ip:
            d.group = group
            return {'message': f"{ip} group set to: {group}"}, 200
    return {"error": "Could not that find device"}, 400

@app.route('/devices/ping', methods=['GET'])
def ping_devices():
    # Setup and broadcast a ping
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
    sock.settimeout(1)
    # Broadcast happens here
    sock.sendto("LEDPing:;".encode(), ('192.168.0.255', UDP_PORT))

    # Turn all device status's off to start
    for d in devices:
        d.status = False

    try:
        while True:
            data, addr = sock.recvfrom(1024) # Retrieves response from device
            ip = addr[0]
            msg = data.decode('ascii')

            found = False
            if msg == 'PONG:;':
                for d in devices:
                    if d.ip == ip:
                        d.status = True
                        found = True
                        break

            if not found:
                devices.append(LightTube(ip))

    except socket.timeout:
        pass  # Stop listening after timeout
    return {'devices': [{'ip': d.ip, 'status': d.status, 'group': d.group} for d in devices]}, 200

@app.route('/udp')
def handle_udp():
    command = request.args.get('command', '')

    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
        for device in devices:
            s.sendto(command.encode(), (device.ip, UDP_PORT))

    return {'status': 'sent', 'command': command}, 200

@app.route('/udp/combo')
def handle_combo():
    foreground = request.args.get('FG', '')
    background = request.args.get('BG', '')

    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
        for device in devices:
            if device.group == 'FG':
                s.sendto(foreground.encode(), (device.ip, UDP_PORT))
            elif device.group == 'BG':
                s.sendto(background.encode(), (device.ip, UDP_PORT))

    return {'status': 'sent'}, 200


if __name__ == "__main__":
    app.run('0.0.0.0', 5000, debug=True)