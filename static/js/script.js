function ping() {
    fetch('/ping')
        .then(response => response.json())
        .then(data => {
      const ipList = data.devices || [];
      const container = document.getElementById('device-ips');

      container.innerHTML = '';

      ipList.forEach((device, index) => {
        const ip = device.ip;
        const group = device.group;

        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.marginBottom = '8px';
        row.style.gap = '10px';

        // IP label
        const ipText = document.createElement('span');
        ipText.textContent = ip;
        ipText.style.flexGrow = '1';

        // Radio Group Name — must be unique per device
        const groupName = `device-${index}`;

        // FG Radio
        const fgLabel = document.createElement('label');
        fgLabel.textContent = 'FG';
        const fgRadio = document.createElement('input');
        fgRadio.type = 'radio';
        fgRadio.name = groupName;
        fgRadio.onclick = () => changeGroup(ip, 'FG');
        fgLabel.prepend(fgRadio);
        // Pre check if device group is FG
        if (group === 'FG') {
          fgRadio.checked = true;
        }

        // BG Radio
        const bgLabel = document.createElement('label');
        bgLabel.textContent = 'BG';
        const bgRadio = document.createElement('input');
        bgRadio.type = 'radio';
        bgRadio.name = groupName;
        bgRadio.onclick = () => changeGroup(ip, 'BG');
        bgLabel.prepend(bgRadio);
        // Pre check if device group is BG
        if (group === 'BG') {
          bgRadio.checked = true;
        }

        // Assemble
        row.appendChild(ipText);
        row.appendChild(fgLabel);
        row.appendChild(bgLabel);
        container.appendChild(row);
      });
    })
    .catch(error => {
      console.error("Ping failed:", error);
      alert("Ping failed! Check console for details.");
    });
}

function findDevices() {
  fetch('/findDevices')
    .then(response => response.json())
    .then(data => {
        ping();
    })
    .catch(error => {
      console.error("findDevices failed:", error);
      alert("findDevices failed! Check console for details.");
    });
}

function changeGroup(ip, group) {
  fetch(`/setgroup?ip=${encodeURIComponent(ip)}&group=${encodeURIComponent(group)}`)
    .then(response => response.json())
    .then(data => console.log(`Sent:`, data))
    .catch(err => alert(`Error: ${err}`));
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