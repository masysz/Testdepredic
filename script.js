document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ Script loaded...");

    const scanButton = document.getElementById("scanButton");
    const tokenInput = document.getElementById("tokenInput");
    const spinnerIndicator = document.querySelector(".indicator");
    const earlyRadarButton = document.getElementById("loadEarlyRadar");

    if (!scanButton || !tokenInput || !spinnerIndicator) {
        console.error("❌ Missing elements in DOM!");
        return;
    }

    // ✅ Animasi idle: Spinner berputar perlahan sebelum scanning
    spinnerIndicator.classList.add("idle-spin");

    // ✅ Event listener tombol Scan
    scanButton.addEventListener("click", () => {
        console.log("📌 Scan button clicked!");
        scanToken();
    });

    // ✅ Event listener tombol Early Radar
    if (earlyRadarButton) {
        earlyRadarButton.addEventListener("click", () => {
            console.log("🚀 Show Tokens button clicked!");
            fetchEarlyRadar(true); // Memaksa refresh
        });
    } else {
        console.error("❌ Early Radar button not found in DOM!");
    }

    // ✅ Auto-refresh data setiap 5 menit
    setInterval(() => {
        console.log("🔄 Auto-refreshing Early Radar data...");
        fetchEarlyRadar(true); // Paksa refresh setiap 5 menit
    }, 300000); // 5 menit dalam milidetik
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
    let spinSpeed = 150;

    function animateFastSpin() {
        if (fastSpins > 0) {
            rotation += 360;
            spinnerIndicator.style.transform = `rotate(${rotation}deg)`;
            fastSpins--;
            setTimeout(animateFastSpin, spinSpeed);
        } else {
            fetch(`https://micinscore.vercel.app/api/audit/${tokenAddress}`)
                .then(response => response.json())
                .then(data => {
    console.log("📊 API Response:", data);
    console.log("🔥 Buy/Sell Ratio dari BE:", data.audit?.buySellRatio);

                    if (!data || !data.audit) {
                        resultDiv.innerHTML = "<p>❌ Error: No audit data found.</p>";
                        return;
                    }

                    let score = data.audit.score;
                    let riskLevel = data.audit.risk;
                    let resultSymbol = "";
                    let finalRotation = 0;

                    if (score >= 76) {
                        finalRotation = 315;
                        resultSymbol = "🟢 Buy";
                    } else if (score >= 51) {
                        finalRotation = 225;
                        resultSymbol = "🟡 Potential";
                    } else if (score >= 26) {
                        finalRotation = 135;
                        resultSymbol = "🔴 Sell";
                    } else {
                        finalRotation = 45;
                        resultSymbol = "❌️ Toxic Asset";
                    }

                    let detailsHTML = `
    <p>Use this analysis as a reference only</p>
    <p><strong>Score:</strong> ${score} - <strong>${resultSymbol}</strong></p>
    <p><strong>Risk Level:</strong> ${riskLevel}</p>
    <table class="audit-table">
        <thead>
            <tr>
                <th>🛡️ Factor</th>
                <th>Description</th>
                <th>Score</th>
            </tr>
        </thead>
        <tbody>
`;

data.audit.details.forEach((detail) => {
    const icon = detail.deduction > 0 ? "❌" : "✅";
    const scoreText = detail.deduction > 0 ? `-${detail.deduction}` : "✅";

    detailsHTML += `
        <tr>
            <td>${icon} ${detail.factor}</td>
            <td>${detail.status}</td>
            <td class="score-column">${scoreText}</td>
        </tr>
    `;
});

detailsHTML += `
        </tbody>
    </table>
`;

resultDiv.innerHTML = detailsHTML;

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

    animateFastSpin();
}

// ✅ Fungsi untuk mengambil data Early Radar dengan Auto-Refresh
async function fetchEarlyRadar(forceRefresh = false) {
    const radarContainer = document.getElementById("early-radar-list");

    // 🔍 Hanya pakai cache jika tidak ada permintaan refresh paksa
    if (!forceRefresh) {
        const savedTokens = localStorage.getItem("earlyRadarData");
        if (savedTokens) {
            console.log("🔄 Using cached early radar data.");
            displayEarlyRadar(JSON.parse(savedTokens));
            return;
        }
    }

    // ✅ Hapus data lama sebelum mengambil yang baru
    localStorage.removeItem("earlyRadarData");
    radarContainer.innerHTML = `<p>🔄 Loading latest early tokens...</p>`;

    try {
        console.log("📡 Fetching Early Radar data...");
        const response = await fetch(`https://micinscore.vercel.app/api/early-radar?t=${Date.now()}`, {
            method: "GET",
            headers: {
                "Cache-Control": "no-store"
            }
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log("📊 Early Radar API Response:", data);

        if (!data.tokens || data.tokens.length === 0) {
            console.warn("⚠️ No tokens found in API response.");
            radarContainer.innerHTML = `<p>🚫 No early tokens found at the moment.</p>`;
            return;
        }

        // ✅ Simpan data baru agar bisa digunakan lagi sebelum refresh berikutnya
        localStorage.setItem("earlyRadarData", JSON.stringify(data.tokens));

        displayEarlyRadar(data.tokens);

    } catch (error) {
        console.error("❌ Error fetching early radar data:", error);
        radarContainer.innerHTML = `<p>⚠️ Failed to load early tokens. Please try again later.</p>`;
    }
}

// ✅ Fungsi menampilkan hasil tanpa menghapus data lama sembarangan
function displayEarlyRadar(tokens) {
    const radarContainer = document.getElementById("early-radar-list");
    radarContainer.innerHTML = "";

    tokens.forEach(token => {
        const tokenId = `copy-${token.token}`;

        radarContainer.innerHTML += `
            <div class="early-radar-token">
                <img src="${token.icon}" alt="${token.token}" class="token-icon">
                <div class="token-info">
                    <a href="${token.url}" target="_blank"><strong>${token.token.slice(0, 4)}...${token.token.slice(-4)}</strong></a>
                    <button class="copy-btn" id="${tokenId}">📋</button>
                    <p>🛡️ Score: <strong>${token.score}</strong> | 💰 Liquidity: <strong>$${token.liquidity.toLocaleString()}</strong></p>
                    <p>📊 Volume: <strong>$${token.volume.toLocaleString()}</strong> | ⚠️ Risk: <strong>${token.risk}</strong></p>
                    <div class="token-links">
                        ${token.socialLinks.map(link => `<a href="${link.url}" target="_blank">🔗 ${link.label || link.type}</a>`).join(" ")}
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => {
            document.getElementById(tokenId)?.addEventListener("click", () => copyToClipboard(token.token));
        }, 100);
    });
}

// ✅ Fungsi Copy ke Clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("✅ Contract Address Copied!");
    }).catch(err => {
        console.error("❌ Failed to copy:", err);
    });
}
