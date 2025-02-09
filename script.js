document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ Script loaded...");

    const scanButton = document.getElementById("scanButton");
    const tokenInput = document.getElementById("tokenInput");
    const spinnerIndicator = document.querySelector(".indicator");
    const earlyRadarButton = document.getElementById("loadEarlyRadar"); // ✅ Fix tombol

    if (!scanButton || !tokenInput || !spinnerIndicator) {
        console.error("❌ Missing elements in DOM!");
        return;
    }

    // ✅ Animasi idle: Spinner berputar perlahan sebelum scanning
    spinnerIndicator.classList.add("idle-spin");

    // ✅ Tambahkan event listener tombol scan
    scanButton.addEventListener("click", () => {
        console.log("📌 Scan button clicked!");
        scanToken();
    });

    // ✅ Event listener tombol Early Radar
    if (earlyRadarButton) {
        earlyRadarButton.addEventListener("click", () => {
            console.log("🚀 Show Tokens button clicked!");
            fetchEarlyRadar();
        });
    } else {
        console.error("❌ Early Radar button not found in DOM!");
    }
});

// ✅ Fungsi untuk melakukan scanning token
function scanToken() {
    console.log("🔍 Starting token scan...");

    const tokenInput = document.getElementById("tokenInput");
    const resultDiv = document.getElementById("result");
    const spinnerIndicator = document.querySelector(".indicator");

    const tokenAddress = tokenInput.value.trim();
    if (!tokenAddress) {
        resultDiv.innerHTML = "<p>❌ Please enter a token address.</p>";
        console.warn("⚠️ No token address entered.");
        return;
    }

    console.log(`🔎 Fetching data for token: ${tokenAddress}`);
    resultDiv.innerHTML = "<p>🔍 Scanning...</p>";

    // ✅ Hentikan animasi idle sebelum scanning
    spinnerIndicator.classList.remove("idle-spin");

    // ✅ Animasi spinner berputar cepat sebelum berhenti di indikator
    let rotation = 0;
    let fastSpins = 5; // Jumlah putaran cepat
    let spinSpeed = 150; // Kecepatan awal (ms)

    function animateFastSpin() {
        if (fastSpins > 0) {
            rotation += 360; // Putar penuh setiap iterasi
            spinnerIndicator.style.transform = `rotate(${rotation}deg)`;
            fastSpins--;
            setTimeout(animateFastSpin, spinSpeed);
        } else {
            // Setelah putaran cepat selesai, ambil data dari API
            fetch(`https://micinscore.vercel.app/api/audit/${tokenAddress}`)
                .then(response => response.json())
                .then(data => {
                    console.log("📊 API Response:", data);

                    if (!data || !data.audit) {
                        resultDiv.innerHTML = "<p>❌ Error: No audit data found.</p>";
                        return;
                    }

                    let score = data.audit.score;
                    let riskLevel = data.audit.risk;
                    let resultSymbol = "";
                    let finalRotation = 0;

                    // ✅ Tentukan posisi akhir jarum berdasarkan skor & tambahkan simbol
                    if (score >= 76) {
                        finalRotation = 0; // Buy (Atas)
                        resultSymbol = "🟢 Buy";
                    } else if (score >= 51) {
                        finalRotation = 270; // Potential (Kanan)
                        resultSymbol = "🟡 Potential";
                    } else if (score >= 26) {
                        finalRotation = 180; // Sell (Bawah)
                        resultSymbol = "🔴 Sell";
                    } else {
                        finalRotation = 90; // Looking (Kiri)
                        resultSymbol = "⚠️ Looking";
                    }

                    // ✅ Format tampilan hasil scan
                    let detailsHTML = `<h3>🔍 Token Audit Result</h3>`;
                    detailsHTML += `<p><strong>Score:</strong> ${score} - <strong>${resultSymbol}</strong></p>`;
                    detailsHTML += `<p><strong>Risk Level:</strong> ${riskLevel}</p>`;
                    detailsHTML += `<ul>`;

                    data.audit.details.forEach((detail) => {
                        const icon = detail.deduction > 0 ? "❌" : "✅";
                        detailsHTML += `<li>${icon} <strong>${detail.factor}:</strong> ${detail.status}</li>`;
                    });

                    detailsHTML += `</ul>`;
                    resultDiv.innerHTML = detailsHTML;

                    // ✅ Putar jarum ke posisi akhir dengan efek transisi halus
                    setTimeout(() => {
                        spinnerIndicator.style.transition = "transform 2s ease-out";
                        spinnerIndicator.style.transform = `rotate(${finalRotation}deg)`;
                    }, 500);
                })
                .catch(error => {
                    console.error("🚨 Fetch error:", error);
                    resultDiv.innerHTML = `<p>❌ Error scanning token: ${error.message}</p>`;
                });
        }
    }

    // ✅ Mulai animasi putaran cepat sebelum mengambil data API
    animateFastSpin();
}

// ✅ Fungsi untuk mengambil data Early Radar saat tombol diklik
async function fetchEarlyRadar() {
    const radarContainer = document.getElementById("early-radar-list");
    radarContainer.innerHTML = `<p>🔄 Loading latest early tokens...</p>`;

    try {
        console.log("📡 Fetching Early Radar data...");

        // Gunakan timestamp di URL untuk menghindari cache browser
        const response = await fetch(`https://micinscore.vercel.app/api/early-radar?t=${Date.now()}`, {
            method: "GET",
            headers: {
                "Cache-Control": "no-store"
            }
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log("📊 Early Radar API Response:", data);

        if (data.status !== "success" || !data.tokens || data.tokens.length === 0) {
            console.warn("⚠️ No tokens found in API response.");
            radarContainer.innerHTML = `<p>🚫 No early tokens found at the moment.</p>`;
            return;
        }

        // ✅ Reset isi container sebelum menambahkan token baru
        radarContainer.innerHTML = "";

        data.tokens.forEach(token => {
            radarContainer.innerHTML += `
                <div class="early-radar-token">
                    <img src="${token.icon}" alt="${token.token}" class="token-icon">
                    <div class="token-info">
                        <a href="${token.url}" target="_blank"><strong>${token.token.slice(0, 4)}...${token.token.slice(-4)}</strong></a>
                        <button class="copy-btn" onclick="copyToClipboard('${token.token}')">📋</button>
                        <p>🛡️ Score: <strong>${token.score}</strong> | 💰 Liquidity: <strong>$${token.liquidity.toLocaleString()}</strong></p>
                        <p>📊 Volume: <strong>$${token.volume.toLocaleString()}</strong> | ⚠️ Risk: <strong>${token.risk}</strong></p>
                        <div class="token-links">
                            ${token.socialLinks.map(link => `<a href="${link.url}" target="_blank">🔗 ${link.label || link.type}</a>`).join(" ")}
                        </div>
                    </div>
                </div>
            `;
        });

    } catch (error) {
        console.error("❌ Error fetching early radar data:", error);
        radarContainer.innerHTML = `<p>⚠️ Failed to load early tokens. Please try again later.</p>`;
    }
}

// ✅ Fungsi Copy ke Clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("✅ Contract Address Copied!");
    }).catch(err => {
        console.error("❌ Failed to copy:", err);
    });
}
