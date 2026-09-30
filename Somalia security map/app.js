
const map = L.map('map').setView([2.0421, 45.3289], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

const locations = [
    { 
        id: 1, 
        name: "Mogadishu National Command (KM4)", 
        lat: 2.0421, 
        lng: 45.3289, 
        status: "Secure Zone", 
        type: "Government HQ / Main Checkpoint", 
        threatLevel: "low",
        category: "secure",
        intel: "Fully fortified military and police checkpoint. High screening efficiency; biometric scanning active."
    },
    { 
        id: 2, 
        name: "Mogadishu Port Security Gate", 
        lat: 2.0330, 
        lng: 45.3900, 
        status: "Secured Perimeter", 
        type: "Strategic Economic Hub", 
        threatLevel: "low",
        category: "secure",
        intel: "Coast Guard and Customs joint patrol active. Container scanning and naval surveillance operational."
    },
    { 
        id: 3, 
        name: "Afgooye Junction Control Post", 
        lat: 2.1441, 
        lng: 45.1256, 
        status: "High Alert / Contested Corridor", 
        type: "Tactical Highway Checkpoint", 
        threatLevel: "high",
        category: "alert",
        intel: "Frequent transit route. Elevated risk of IEDs and ambushes linked to Al-Shabaab cells operating in Lower Shabelle."
    },
    { 
        id: 4, 
        name: "Jowhar Northern Gateway", 
        lat: 2.7797, 
        lng: 45.5039, 
        status: "Reinforced Defense", 
        type: "Regional Capital Gate", 
        threatLevel: "medium",
        category: "alert",
        intel: "Hirshabelle state security forces manning perimeter. Sporadic rural skirmishes reported in adjacent districts."
    },
    { 
        id: 5, 
        name: "Baidoa Sector 3 Command", 
        lat: 3.1136, 
        lng: 43.6456, 
        status: "Active Surveillance", 
        type: "Military Base & Checkpoint", 
        threatLevel: "medium",
        category: "alert",
        intel: "South West State forces coordinate defensive operations against active Al-Shabaab infiltration routes."
    },
    { 
        id: 6, 
        name: "Kismayo Port & Coastal Gate", 
        lat: -0.3582, 
        lng: 42.5454, 
        status: "Secure Maritime Zone", 
        type: "Jubaland Security Outpost", 
        threatLevel: "low",
        category: "secure",
        intel: "Strict entry protocols enforced by Jubaland security forces. Port traffic monitored against smuggling."
    },
    { 
        id: 7, 
        name: "Bulo Marer Rural Sector", 
        lat: 1.9500, 
        lng: 44.7500, 
        status: "Active Threat Zone", 
        type: "High-Risk Insurgent Hotspot", 
        threatLevel: "high",
        category: "hostile",
        intel: "Intelligence reports confirm active Al-Shabaab sleeper cells and transit hideouts. Special forces clearance sweeps active."
    },
    { 
        id: 8, 
        name: "Cal Miskaat Mountain Range (Puntland)", 
        lat: 10.8500, 
        lng: 49.5000, 
        status: "IS-Somalia Encampment Vector", 
        type: "Mountainous Hideout Zone", 
        threatLevel: "high",
        category: "hostile",
        intel: "Puntland Maritime Police Force (PMPF) target militant cave networks associated with IS-Somalia faction elements."
    }
];

let markers = [];
const cpListEl = document.getElementById('cpList');

function renderDashboard(filter = 'all') {
    markers.forEach(m => map.removeLayer(m.marker));
    markers = [];
    cpListEl.innerHTML = '';

    const filteredLocations = locations.filter(loc => {
        if (filter === 'all') return true;
        return loc.category === filter;
    });

    filteredLocations.forEach(loc => {
        let color = '#10b981';
        if (loc.category === 'alert') color = '#f59e0b';
        if (loc.category === 'hostile') color = '#ef4444';

        const circleMarker = L.circleMarker([loc.lat, loc.lng], {
            radius: 9,
            fillColor: color,
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
        }).addTo(map);

        const popupContent = `
            <div style="font-family:sans-serif; min-width: 200px;">
                <b style="font-size:0.9rem; color:#0f172a;">${loc.name}</b><br>
                <span style="font-size:0.75rem; color:#475569; font-weight:bold;">${loc.type}</span><hr style="margin:5px 0; border:0; border-top:1px solid #cbd5e1;">
                <p style="font-size:0.75rem; margin-bottom:5px;"><b>Status:</b> ${loc.status}</p>
                <p style="font-size:0.75rem; color:#b91c1c;"><b>Intel:</b> ${loc.intel}</p>
            </div>
        `;
        circleMarker.bindPopup(popupContent);
        markers.push({ id: loc.id, marker: circleMarker, category: loc.category });

        const li = document.createElement('li');
        li.className = `checkpoint-item ${loc.category}`;
        li.innerHTML = `
            <div class="cp-header">
                <span class="cp-title">${loc.name}</span>
                <span class="threat-tag ${loc.threatLevel}">${loc.threatLevel.toUpperCase()} RISK</span>
            </div>
            <div class="cp-details">
                ${loc.type} — <strong>${loc.status}</strong>
            </div>
        `;

        li.addEventListener('click', () => {
            map.setView([loc.lat, loc.lng], 11);
            circleMarker.openPopup();
        });

        cpListEl.appendChild(li);
    });
}

function filterMarkers(category) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    renderDashboard(category);
}

renderDashboard('all');
// Create a live tracking marker
let liveMarker = L.marker([2.0421, 45.3289]).addTo(map)
    .bindPopup("<b>Live Tracker Feed</b><br>Awaiting signal...");

// Firebase Realtime Listener Configuration
const firebaseConfig = {
  apiKey: "AIzaSyD-YourRealKeyExample12345",
  authDomain: "somalia-security-monitor.firebaseapp.com",
  databaseURL: "https://somalia-security-monitor-default-rtdb.firebaseio.com",
  projectId: "somalia-security-monitor"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

database.ref('tracker/location').on('value', function(snapshot) {
    let data = snapshot.val();
    if (data && data.lat && data.lng) {
        liveMarker.setLatLng([data.lat, data.lng]);
        map.panTo([data.lat, data.lng]);
        liveMarker.getPopup().setContent(`<b>Live Tracker Feed</b><br>Lat: ${data.lat}, Lng: ${data.lng}`);
    }
    // Live GPS Tracker Listener
let liveMarker = L.marker([2.0421, 45.3289]).addTo(map)
    .bindPopup("<b>Live Tracker Feed</b><br>Awaiting signal...");

firebase.database().ref('tracker/location').on('value', function(snapshot) {
    let data = snapshot.val();
    if (data && data.lat && data.lng) {
        liveMarker.setLatLng([data.lat, data.lng]);
        map.panTo([data.lat, data.lng]);
        liveMarker.getPopup().setContent(`<b>Live Tracker Feed</b><br>Lat: ${data.lat}, Lng: ${data.lng}`);
    }
    // Handle saving real hazard points to Firebase safely
const saveHazardBtn = document.getElementById('saveHazardBtn');
if (saveHazardBtn) {
    saveHazardBtn.addEventListener('click', () => {
        const title = document.getElementById('hazardTitle').value;
        const lat = parseFloat(document.getElementById('hazardLat').value);
        const lng = parseFloat(document.getElementById('hazardLng').value);
        const risk = document.getElementById('hazardRisk').value;

        if (!title || isNaN(lat) || isNaN(lng)) {
            alert('Please fill in a valid title, latitude, and longitude.');
            return;
        }

        // Push new hazard to Firebase database under a 'hazards' node
        database.ref('hazards').push({
            title: title,
            lat: lat,
            lng: lng,
            risk: risk
        });
    });
}
const firebaseConfig = {
  databaseURL: "https://somaliasecuritymap-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Listen to your checkpoints node in Firebase
onValue(ref(db, 'checkpoints'), (snapshot) => {
    const data = snapshot.val();
    if (data) {
        console.log("Connected to Firebase! Data received:", data);
        
        // Check if the risk level is high or low
        if (data.risk === 'high' || data.level === 'high') {
            console.log("HIGH RISK DETECTED - Setting Red Alert");
            // Add your code here to turn the marker/UI red
        } else {
            console.log("Safe/Low Risk - Setting Green Status");
            // Add your code here to turn the marker/UI green
        }
    }
    function playAlertTone() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
    } catch(e) {
        console.log("Web Audio not allowed yet");
    }
}
    
});
});
});
// Tactical multi-tone startup sequence
function playStartupBeepPattern() {
    let count = 0;
    if (typeof playAlertBeep === 'function') {
        playAlertBeep();
        pLayAlertTone();
    }
    count++;

    let patternInterval = setInterval(() => {
        if (count >= 10) {
            clearInterval(patternInterval);
            return;
        }
        if (typeof playAlertBeep === 'function') {
            playAlertBeep();
        }
        count++;
    }, 180);
}

// Click to initialize audio and run the loader sequence
window.addEventListener('click', () => {
    let loaderElem = document.getElementById('cyber-loader');
    if (!loaderElem || loaderElem.dataset.started === 'true') return;
    loaderElem.dataset.started = 'true';

    let percentElem = document.getElementById('load-percentage');
    let currentPercent = 0;

    // Trigger sound pattern
    playStartupBeepPattern();

    let loadInterval = setInterval(() => {
        currentPercent += 1;
        if (currentPercent <= 100 && percentElem) {
            percentElem.innerText = currentPercent + '%';
        }

        if (currentPercent >= 100) {
            clearInterval(loadInterval);
            
            setTimeout(() => {
                loaderElem.style.opacity = '0';
                setTimeout(() => {
                    loaderElem.style.display = 'none';
                }, 500);
            }, 300);
        }
    }, 135);
}, { once: true });
// Tactical multi-tone startup sequence with guaranteed Web Audio beeps
function playStartupBeepPattern() {
    let count = 0;

    function triggerTone() {
        try {
            let AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            let ctx = new AudioContext();
            
            // Resume context if suspended (common browser policy requirement)
            if (ctx.state === 'suspended') {
                ctx.resume();
            }

            let osc = ctx.createOscillator();
            let gain = ctx.createGain();
            
            osc.type = 'sawtooth'; // Gives a nice tactical sci-fi tone
            osc.frequency.setValueAtTime(900, ctx.currentTime);
            
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.12);
        } catch (e) {
            // Fallback to any existing alert function if available
            if (typeof playAlertBeep === 'function') {
                playAlertBeep();
            }
        }
    }

    triggerTone();
    count++;

    let patternInterval = setInterval(() => {
        if (count >= 10) {
            clearInterval(patternInterval);
            return;
        }
        triggerTone();
        count++;
    }, 1500);
}
// Dynamic Matrix Binary Rain Effect
function startMatrixRain() {
    const container = document.querySelector('.matrix-rain');
    if (!container) return;
    
    const chars = "01010101010111001001";
    
    setInterval(() => {
        let drop = document.createElement('div');
        drop.innerText = chars[Math.floor(Math.random() * chars.length)];
        drop.style.position = 'absolute';
        drop.style.left = Math.random() * 100 + '%';
        drop.style.top = '-20px';
        drop.style.color = '#00ff41';
        drop.style.fontFamily = 'monospace';
        drop.style.fontSize = '14px';
        drop.style.opacity = Math.random();
        drop.style.transition = 'top 2.5s linear, opacity 2.5s linear';
        drop.style.zIndex = '1';
        container.appendChild(drop);
        
        // Trigger fall animation
        setTimeout(() => {
            drop.style.top = '100vh';
            drop.style.opacity = '0';
        }, 50);
        
        // Clean up DOM element after it falls
        setTimeout(() => {
            drop.remove();
        }, 2600);
    }, 80);
}

// Run it when script loads
startMatrixRain();