$(document).ready(function () {
	console.log("Step 1: Document Ready. Checking URL...");
	const urlParams = new URLSearchParams(window.location.search);
	const city = urlParams.get('city') || 'amd';

	$('#location-switcher').val(city);

	const dataPath = `assets/js/${city}.js`;
	console.log(`Step 2: Attempting to load data from: ${dataPath}`);

	// Dynamic Data Loading
	$.getScript(dataPath)
		.done(function () {
			console.log("Step 3: Script file physically loaded.");

			// Check if 'data' variable exists in the global window object
			if (typeof data !== 'undefined') {
				console.log("Step 4: 'data' variable found! Initializing UI...");
				window.cityData = data; // Assign to a safe global name
				if (city === 'vns') $('.clock-section').addClass('vns-theme');
				initApp();
			} else {
				console.error("Step 4 Error: Script loaded but 'data' variable is undefined. Check your vns.js/amd.js format.");
			}
		})
		.fail(function (jqxhr, settings, exception) {
			console.error("Step 3 Error: Could not find or load the JS file.", exception);
		});

	$('#location-switcher').change(function () {
		window.location.href = `jantari.html?city=${$(this).val()}`;
	});

	function initApp() {
		console.log("Step 5: App Initialized. Running first UI draw...");
		updateUI();
		renderYearlyTable('all');
		setInterval(updateUI, 1000);
	}
});

/* --- HELPER FUNCTIONS --- */

function getFormattedDateTime() {
	const now = new Date();
	const month = now.toLocaleString('default', { month: 'long' });
	const date = String(now.getDate()).padStart(2, '0');
	let hours = now.getHours();
	const minutes = String(now.getMinutes()).padStart(2, '0');
	const seconds = String(now.getSeconds()).padStart(2, '0');
	const ampm = hours >= 12 ? 'PM' : 'AM';
	hours = hours % 12 || 12;
	return { month, date, hours: String(hours).padStart(2, '0'), minutes, seconds, ampm };
}

function parseTime(timeStr) {
	if (!timeStr || typeof timeStr !== 'string') return { hours: 0, minutes: 0 };
	const parts = timeStr.split(' ');
	const time = parts[0];
	const modifier = parts[1];
	let [hours, minutes] = time.split(':').map(Number);
	if (modifier === 'PM' && hours !== 12) hours += 12;
	if (modifier === 'AM' && hours === 12) hours = 0;
	return { hours, minutes };
}

function isLater(time1, time2) {
	return (time1.hours > time2.hours) || (time1.hours === time2.hours && time1.minutes > time2.minutes);
}

function isToday(m, d) {
	const now = new Date();
	return m === now.toLocaleString('default', { month: 'long' }) && d == String(now.getDate()).padStart(2, '0');
}

/* --- UI DRAWING --- */
function getEmoji(name) {
	const n = name.toLowerCase();
	// Morning / Start
	if (n.includes('fajr') || n.includes('sehri')) return '🌃';
	if (n.includes('sunrise') || n.includes('tuloo')) return '🌄';

	// Mid Day
	if (n.includes('zawal') || n.includes('dahwa')) return '☀️';
	if (n.includes('dhuhr')) return '🌤️';
	if (n.includes('asr')) return '🌞';

	// Evening / End
	if (n.includes('maghrib') || n.includes('iftar')) return '🌇';
	if (n.includes('isha')) return '🌙';
	if (n.includes('midnight')) return '✨';

	return '📍'; // Default for Date or unknown fields
}

function updateUI() {
	const dt = getFormattedDateTime();
	$('#live-clock').text(`${dt.hours}:${dt.minutes}:${dt.seconds} ${dt.ampm}`);
	$('#display-date').text(`${dt.date} ${dt.month}, 2026`);

	if (!window.cityData || !window.cityData[dt.month]) return;

	const monthData = window.cityData[dt.month];
	const todayData = monthData.find(e => e.Date == dt.date);

	if (!todayData) return;

	const currT = parseTime(`${dt.hours}:${dt.minutes} ${dt.ampm}`);
	const now = new Date();

	const sorted = Object.entries(todayData)
		.filter(([k]) => k !== 'Date')
		.map(([k, v]) => ({ k, t: parseTime(v), o: v }))
		.sort((a, b) => (a.t.hours - b.t.hours) || (a.t.minutes - b.t.minutes));

	const nextIdx = sorted.findIndex(p => isLater(p.t, currT));

	// --- COUNTDOWN TIMER LOGIC ---
	let nextSalah = sorted[nextIdx];

	if (!nextSalah) {
		// All prayers for today are over
		$('#next-salah-name').text("Next: Fajr (Tomorrow)");
		$('#countdown-timer').text("--h --m --s");
	} else {
		// Calculate difference
		const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), nextSalah.t.hours, nextSalah.t.minutes, 0);
		const diff = target - now;

		const h = Math.floor(diff / 3600000);
		const m = Math.floor((diff % 3600000) / 60000);
		const s = Math.floor((diff % 60000) / 1000);

		$('#next-salah-name').text(`Next: ${nextSalah.k}`);
		$('#countdown-timer').text(`${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`);
	}
	// -----------------------------

	let html = '';
	sorted.forEach((p, i) => {
		let cls = (i === nextIdx - 1) ? 'active-salah' : (i === nextIdx ? 'next-salah' : '');

		html += `
        <div class="list-group-item ${cls} d-flex justify-content-between align-items-center py-3">
            <div class="d-flex align-items-center">
                <div class="emoji-container text-center me-3">
                    ${getEmoji(p.k)}
                </div>
                <div class="salah-name-wrapper">
                    <span class="fw-bold d-block">${p.k}</span>
                </div>
            </div>
            <div class="salah-time-wrapper">
                <span class="badge rounded-pill bg-light text-dark border px-3 fw-bold">${p.o}</span>
            </div>
        </div>`;
	});
	$('#daily-schedule').html(html);
}

const emojiMapping = {
	"Date": "📅",
	"Sehri": "⏳", "Fajr": "🌃",
	"Tuloo": "🌄", "Sunrise": "🌄",
	"Zawal": "☀️", "Dahwa": "☀️",
	"Dhuhr": "🌤️",
	"Asr": "🌞",
	"Iftar": "🌇", "Maghrib": "🌇",
	"Isha": "🌙",
	"Midnight": "✨"
};

// Add a helper to get color classes based on column name
function getHeaderColor(name) {
	const n = name.toLowerCase();
	if (n.includes('fajr') || n.includes('sehri') || n.includes('sunrise')) return 'bg-info-subtle text-info';
	if (n.includes('zawal') || n.includes('dhuhr') || n.includes('asr')) return 'bg-warning-subtle text-warning';
	if (n.includes('maghrib') || n.includes('iftar')) return 'bg-danger-subtle text-danger';
	if (n.includes('isha') || n.includes('midnight')) return 'bg-primary-subtle text-primary';
	return 'bg-light text-secondary';
}

function renderYearlyTable(q) {
	if (!window.cityData) return;

	const quarterMonths = {
		'q1': ['January', 'February', 'March'],
		'q2': ['April', 'May', 'June'],
		'q3': ['July', 'August', 'September'],
		'q4': ['October', 'November', 'December'],
		'all': Object.keys(window.cityData)
	};

	const months = quarterMonths[q] || quarterMonths['all'];
	let finalHtml = '';

	months.forEach(m => {
		if (!window.cityData[m]) return;

		const monthRows = window.cityData[m];
		const columns = Object.keys(monthRows[0]);

		// Build Headers
		let headerHtml = '';
		columns.forEach(col => {
			const colorClass = getHeaderColor(col);
			headerHtml += `
                <th class="text-center border-0">
                    <div class="table-emoji-box ${colorClass}">${emojiMapping[col] || '📍'}</div>
                    <div class="table-label">${col}</div>
                </th>`;
		});

		// Build Rows
		let bodyHtml = '';
		monthRows.forEach(e => {
			const rowClass = isToday(m, e.Date) ? 'table-warning today-row' : '';
			let rowCells = '';
			columns.forEach(col => {
				rowCells += `<td class="text-center align-middle">${e[col] || '—'}</td>`;
			});
			bodyHtml += `<tr class="${rowClass}">${rowCells}</tr>`;
		});

		finalHtml += `
        <div class="card jantari-card mb-5 overflow-hidden shadow-sm">
            <div class="card-header bg-white border-0 py-4 text-center">
                <h4 class="mb-0 fw-bold">✨ ${m}</h4>
            </div>
            <div class="table-responsive">
                <table class="table table-hover mb-0 jantari-table">
                    <thead><tr>${headerHtml}</tr></thead>
                    <tbody>${bodyHtml}</tbody>
                </table>
            </div>
        </div>`;
	});

	$('#table-output').html(finalHtml);
}

// Helper to assign specific colors to column categories
function getHeaderColor(name) {
	const n = name.toLowerCase();
	if (n.includes('fajr') || n.includes('sehri') || n.includes('sunrise')) return 'accent-blue';
	if (n.includes('zawal') || n.includes('dhuhr') || n.includes('asr')) return 'accent-gold';
	if (n.includes('maghrib') || n.includes('iftar')) return 'accent-orange';
	if (n.includes('isha') || n.includes('midnight')) return 'accent-purple';
	return 'accent-gray';
}

// Event listener for Quarter buttons
$(document).on('click', '#quarter-filters .btn', function () {
	$('#quarter-filters .btn').removeClass('active');
	$(this).addClass('active');
	renderYearlyTable($(this).data('q'));
});