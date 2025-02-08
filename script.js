document.addEventListener("DOMContentLoaded", () => {
    const spinner = document.querySelector(".indicator");
    const resultDiv = document.getElementById("result");
    const scanButton = document.getElementById("scanButton");
    const tokenInput = document.getElementById("tokenInput");

    // Pastikan spinner selalu berputar saat website dibuka
    spinner.classList.add("spinning");

    // Saat scan dilakukan
    scanButton.addEventListener("click", async () => {
        const tokenAddress = tokenInput.value.trim();
        if (!tokenAddress) {
            resultDiv.innerHTML = "<p>❌ Please enter a token address.</p>";
            return;
        }

        // Reset UI
        resultDiv.innerHTML = "<p>🔍 Scanning...</p>";
        scanButton.disabled = true; // Cegah spam klik
        spinner.classList.add("scanning"); // Tambah animasi scan

        try {
            console.log(`🔎 Fetching data for token: ${tokenAddress}`);
            
            // Ganti URL sesuai dengan backend yang digunakan
            const response = await fetch(`https://micinscore.vercel.app/api/audit/${tokenAddress}`);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("📊 API Response:", data);

            // Pastikan ada data audit
            if (!data || !data.audit) {
                throw new Error("Invalid API response");
            }

            // Ambil skor dari API
            const score = data.audit.score;
            let rotationAngle = 0;

            // Tentukan rotasi berdasarkan skor
            if (score >= 76) {
                rotationAngle = 0; // Buy (atas)
            } else if (score >= 51) {
                rotationAngle = 270; // Potential (kanan)
            } else if (score >= 26) {
                rotationAngle = 180; // Sell (bawah)
            } else {
                rotationAngle = 90; // Looking (kiri)
            }

            // Jalankan animasi spinner
            spinner.classList.remove("spinning"); // Hentikan idle spin
            spinner.style.transition = "transform 2s ease-out";
            spinner.style.transform = `rotate(${rotationAngle}deg)`;

            // Tampilkan hasil scanning
            let detailsHTML = `<h3>🔍 Token Audit Result</h3>`;
            detailsHTML += `<p><strong>Score:</strong> ${score}</p>`;
            detailsHTML += `<p><strong>Risk Level:</strong> ${data.audit.risk}</p>`;
            detailsHTML += `<ul>`;

            data.audit.details.forEach((detail) => {
                const icon = detail.deduction > 0 ? "❌" : "✅";
                detailsHTML += `<li>${icon} <strong>${detail.factor}:</strong> ${detail.status}</li>`;
            });

            detailsHTML += `</ul>`;
            resultDiv.innerHTML = detailsHTML;

        } catch (error) {
            console.error("🚨 Error fetching audit data:", error);
            resultDiv.innerHTML = `<p>❌ Error scanning token: ${error.message}</p>`;
        }

        // Re-enable tombol scan setelah selesai
        scanButton.disabled = false;
    });
});
