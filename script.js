document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ Script loaded...");

    const scanButton = document.getElementById("scanButton");
    const tokenInput = document.getElementById("tokenInput");
    const spinnerIndicator = document.querySelector(".indicator");

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

    // ✅ Animasi spinner berputar kencang sebelum berhenti di indikator
    let rotation = 0;
    let fastSpins = 5; // Jumlah putaran cepat
    let spinSpeed = 100; // Kecepatan awal (ms)

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
                        spinnerIndicator.style.transition = "transform 1s ease-out";
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
