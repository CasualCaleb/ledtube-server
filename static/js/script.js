let default_bpm = 120;


function createLabels(devices) {
  const container = document.getElementById("container");
  container.innerHTML = '';
  devices.forEach(device => {
    const entry = document.createElement('div');
    entry.className = 'device';

    // Create and append the status dot
    const dot = document.createElement('span');
    dot.className = 'status ' + (device.status ? 'online' : 'offline');
    entry.appendChild(dot);

    // Create and append the IP
    const ipLabel = document.createElement('span');
    ipLabel.textContent = device.ip;
    entry.appendChild(ipLabel);

    // SETUP FG RADIO BUTTON
    const fgLabel = document.createElement('label');
    fgLabel.textContent = 'FG';
    const fgRadio = document.createElement('input');
    fgRadio.type = 'radio';
    fgRadio.name = device.ip;
    fgRadio.value = 'FG';
    fgRadio.checked = device.group === 'FG'

    fgRadio.onclick = () => {
      fetch(`/devices/setGroup?ip=${device.ip}&group=FG`)
          .then(res => res.json())
          .then(data => console.log(data.message || data.error))
          .catch(err => console.error('Request failed:', err));
    };
    fgLabel.prepend(fgRadio);

    // SETUP BG RADIO BUTTON
    const bgLabel = document.createElement('label');
    bgLabel.textContent = 'BG';
    const bgRadio = document.createElement('input');
    bgRadio.type = 'radio';
    bgRadio.name = device.ip;
    bgRadio.value = 'BG';
    bgRadio.checked = device.group === 'BG'
    bgRadio.onclick = () => {
      fetch(`/devices/setGroup?ip=${device.ip}&group=BG`)
          .then(res => res.json())
          .then(data => console.log(data.message || data.error))
          .catch(err => console.error('Request failed:', err));
    };
    bgLabel.prepend(bgRadio);

    // Append FG button
    fgLabel.prepend(fgRadio);
    entry.appendChild(fgLabel);
    entry.appendChild(fgLabel);
    // Append BG button
    bgLabel.prepend(bgRadio);
    entry.appendChild(bgLabel);
    entry.appendChild(bgLabel);

    // Append entry to the container
    container.appendChild(entry);
  });
}

function ping() {
  fetch('/devices/ping')
      .then(res => {
        if (!res.ok) throw new Error('Network response not OK');
        return res.json();
      })
      .then(data => createLabels(data.devices || []))
      .catch(err => console.error('Ping error:', err));
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

function sendBPM() {
  const bpmValue = document.getElementById('bpmInput').value;
  if (bpmValue && !isNaN(bpmValue)) {
    sendCommand(`bpm:${bpmValue};`);
  } else {
    alert('Oi, enter a proper number for BPM!');
  }
}

function setDefaultBPM() {
  const bpmValue = document.getElementById('bpmInput').value;
  if (bpmValue && !isNaN(bpmValue)) {
    default_bpm = bpmValue;
    sendBPM();
  } else {
    alert('Oi, enter a proper number for BPM!');
  }
}

function doubleBPM() {
  const input = document.getElementById('bpmInput');
  let bpm = parseFloat(input.value);
  if (!isNaN(bpm)) {
    bpm *= 2;
    input.value = bpm;
    sendCommand(`bpm:${bpm};`); // Optional: send new BPM to server
  } else {
    alert('Oi! Enter a valid number for BPM, ya muppet.');
  }
}

function halfBPM() {
  const input = document.getElementById('bpmInput');
  let bpm = parseFloat(input.value);
  if (!isNaN(bpm)) {
    bpm /= 2;
    input.value = bpm;
    sendCommand(`bpm:${bpm};`); // Optional: send new BPM to server
  } else {
    alert('Crikey! That ain’t a number. Check your BPM input.');
  }
}

function defaultTime() {
  const input = document.getElementById('bpmInput');
  let bpm = parseFloat(input.value);
  if (!isNaN(bpm)) {
    input.value = default_bpm;

    bpm = parseFloat(input.value);
    sendCommand(`bpm:${bpm};`);
  }
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

// Auto-ping every 1 seconds
setInterval(ping, 2000);
ping();