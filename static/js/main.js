const socket = new WebSocket('ws://' + location.host + '/ws');
const statusIndicator = document.getElementById('status-indicator');
const gestureValue = document.getElementById('gesture-value');
const btnStart = document.getElementById('btn-start');
const btnStop = document.getElementById('btn-stop');
const profileSelect = document.getElementById('profile-select');
const mappingsGrid = document.querySelector('.mappings-grid');

socket.onopen = () => {
    console.log('WebSocket Connected');
    setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ command: 'heartbeat' }));
        }
    }, 100);
};

profileSelect.addEventListener('change', (e) => {
    const profile = e.target.value;
    socket.send(JSON.stringify({ command: 'set_profile', profile: profile }));
});

function updateMappingsList(mapping) {
    mappingsGrid.innerHTML = '';

    // Icon map for common gestures
    const icons = {
        'open_palm': '✋',
        'fist': '✊',
        'index_finger': '👉',
        'thumb_up': '👍',
        'two_fingers': '✌️',
        'left_swipe': '🤟',
        'ok_sign': '👌',
        'thumb_down': '👎'
    };

    for (const [gesture, action] of Object.entries(mapping)) {
        const item = document.createElement('div');
        item.className = 'mapping-item';

        const icon = icons[gesture] || '❓';
        // Format action name nicely (e.g. move_forward -> Forward)
        const label = action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        item.innerHTML = `
            <span class="mapping-icon">${icon}</span>
            <span class="mapping-label">${label}</span>
            <span class="mapping-key">${gesture}</span>
        `;
        mappingsGrid.appendChild(item);
    }
}

socket.onmessage = (event) => { }; // Placeholder to avoid replacement error, actual content follows

btnStart.addEventListener('click', () => {
    socket.send(JSON.stringify({ command: 'start' }));
});

btnStop.addEventListener('click', () => {
    socket.send(JSON.stringify({ command: 'stop' }));
});

// Training Logic
const btnRecord = document.getElementById('btn-record');
const btnTrain = document.getElementById('btn-train');
const gestureNameInput = document.getElementById('gesture-name');
const trainingStatus = document.getElementById('training-status');

btnRecord.addEventListener('mousedown', () => {
    const label = gestureNameInput.value.trim();
    if (!label) {
        alert("Please enter a gesture name!");
        return;
    }
    socket.send(JSON.stringify({ command: 'start_recording', label: label }));
    btnRecord.innerText = "RECORDING...";
});

btnRecord.addEventListener('mouseup', () => {
    socket.send(JSON.stringify({ command: 'stop_recording' }));
    btnRecord.innerText = "RECORD (Hold)";
});

btnTrain.addEventListener('click', () => {
    trainingStatus.innerText = "Status: Training...";
    socket.send(JSON.stringify({ command: 'train_model' }));
});

// Original socket.onmessage needs to be updated to handle non-status messages or we parse carefully
const originalOnMessage = socket.onmessage;
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.status === 'recording_stop') {
        trainingStatus.innerText = `Status: Captured ${data.count} samples.`;
    } else if (data.status === 'training_complete') {
        trainingStatus.innerText = `Status: ${data.message}`;
        if (data.success) alert("Training Complete!");
    } else if (data.status === 'profile_updated') {
        // Update Mappings
        updateMappingsList(data.mapping);
    } else {
        // Standard status update
        gestureValue.innerText = data.gesture;

        if (data.active) {
            statusIndicator.innerText = 'ACTIVE';
            statusIndicator.classList.add('active');
        } else {
            statusIndicator.innerText = 'OFFLINE';
            statusIndicator.classList.remove('active');
        }

        // Sync select if needed (optional)
        if (data.profile && profileSelect.value !== data.profile) {
            profileSelect.value = data.profile;
        }
    }
};
