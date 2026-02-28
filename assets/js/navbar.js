document.addEventListener("DOMContentLoaded", function() {
    // Detect current city from URL
    const urlParams = new URLSearchParams(window.location.search);
    const city = urlParams.get('city') || 'vns';
    const cityName = city === 'amd' ? 'Ahmedabad' : 'Varanasi';

    const navHtml = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
        <div class="container">
            <a class="navbar-brand fw-bold" href="index.html">🕌 Jantari 2026</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <span class="nav-link text-info d-none d-lg-block">Currently viewing: ${cityName}</span>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="index.html">Home</a>
                    </li>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">Quick Views</a>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item" href="jantari.html?city=${city}">Live Schedule</a></li>
                            <li><a class="dropdown-item" href="vns-ramadan.html">Ramadan Special (VNS)</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="amd-image.html">Original Image (AMD)</a></li>
                            <li><a class="dropdown-item" href="vns-image.html">Original Image (VNS)</a></li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </nav>`;

    document.body.insertAdjacentHTML('afterbegin', navHtml);
});