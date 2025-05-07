function ping() {
      fetch('/ping')
        .then(response => response.json())
        .then(data => {
          console.log("Devices:", data.devices);

          const ipList = data.devices || [];
          const output = ipList.join('\n');
          document.getElementById('device-ips').textContent = output;
        })
        .catch(error => {
          console.error("Ping failed:", error);
          alert("Ping failed! Check console for details.");
        });
    }

function sendCommand(command) {
  fetch(`/udp?command=${encodeURIComponent(command)}`)
    .then(response => response.json())
    .then(data => console.log(`Sent:`, data))
    .catch(err => alert(`Error: ${err}`));
}

function sendComboCommand(command1, command2) {
  fetch(`/udp/combo?FG=${encodeURIComponent(command1)}&BG=${encodeURIComponent(command2)}`)
    .then(response => response.json())
    .then(data => console.log(`Sent:`, data))
    .catch(err => alert(`Error: ${err}`));
}

function handleColorPick(hex) {
  const hue = hexToHue(hex);
  sendCommand(`hue:${hue}`);
}

// Helper to convert HEX -> HUE (0–360)
function hexToHue(hex) {
  const r = parseInt(hex.substr(1, 2), 16) / 255;
  const g = parseInt(hex.substr(3, 2), 16) / 255;
  const b = parseInt(hex.substr(5, 2), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h;

  if (max === min) {
    h = 0;
  } else if (max === r) {
    h = (60 * ((g - b) / (max - min)) + 360) % 360;
  } else if (max === g) {
    h = (60 * ((b - r) / (max - min)) + 120) % 360;
  } else {
    h = (60 * ((r - g) / (max - min)) + 240) % 360;
  }

  return Math.round((h / 360) * 255); // Scale to 0–255 for FastLED-style hue
}

// Every refresh this code gets ran
window.onload = function () {
  ping();
};