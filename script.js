document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ Script loaded...");

    const scanButton = document.getElementById("scanButton");
    const tokenInput = document.getElementById("tokenInput");
    const resultDiv = document.getElementById("result");
    const spinner = document.querySelector(".indicator");

    if (!scanButton) console.error("❌ Scan button not found!");
    if (!tokenInput) console.error("❌ Token input field not found!");
    if (!resultDiv) console.error("❌ Result container not found!");
    if (!spinner) console.error("❌ Spinner not found!");

    // ✅ Spinner selalu berputar saat halaman pertama dibuka
    spinner.classList.add("spinning");
    console.log("🔄 Spinner is running on idle mode...");

    scanButton.addEventListener("click", async () => {
        console.log("📌 Scan button clicked!");

        const tokenAddress = tokenInput.value.trim();
        if (!tokenAddress) {
            resultDiv.innerHTML = "<p>❌ Please enter a token address.</p>";
            console.warn("⚠️ No token address entered.");
            return;
        }

        console.log(`🔎 Fetching data for token: ${tokenAddress}`);
        resultDiv.innerHTML = "<p>🔍 Scanning...</p>";
        scanButton.disabled = true;
        spinner.classList.add("scanning");

        try {
            const apiUrl = `https://micinscore.vercel.app/api/audit/${tokenAddress}`;
            console.log(`🌍 Sending request to: ${apiUrl}`);

            const response = await fetch(apiUrl, { method: "GET" });

            console.log(`📡 Fetch request sent to API... Waiting for response`);

            if (!response.ok) {
                throw new Error(`HTTP Error ${response.status} - ${response.statusText}`);
            }

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Invalid API response format (Not JSON)");
            }

            const data = await response.json();
            console.log("📊 API Response Data:", data);

            if (!data || !data.audit || typeof data.audit.score === "undefined") {
                throw new Error("Invalid API response or missing audit data.");
            }

            console.log(`✅ Received Score: ${data.audit.score}`);
            let rotationAngle = 0;

            // ✅ Tentukan posisi jarum berdasarkan skor
            if (data.audit.score >= 76) rotationAngle = 0; // Buy (Atas)
            else if (data.audit.score >= 51) rotationAngle = 270; // Potential (Kanan)
            else if (data.audit.score >= 26) rotationAngle = 180; // Hold (Bawah)
            else rotationAngle = 90; // Looking (Kiri)

            // ✅ Animasi Spinner
            spinner.classList.remove("spinning");
            spinner.style.transition = "transform 2s ease-out";
            spinner.style.transform = `rotate(${rotationAngle}deg)`;

            // ✅ Menampilkan hasil audit di UI
            let detailsHTML = `<h3>🔍 Token Audit Result</h3>`;
            detailsHTML += `<p><strong>Score:</strong> ${data.audit.score}</p>`;
            detailsHTML += `<p><strong>Risk Level:</strong> ${data.audit.risk}</p>`;
            detailsHTML += `<ul>`;

            data.audit.details.forEach((detail) => {
                const icon = detail.deduction > 0 ? "❌" : "✅";
                detailsHTML += `<li>${icon} <strong>${detail.factor}:</strong> ${detail.status}</li>`;
            });

            detailsHTML += `</ul>`;
            resultDiv.innerHTML = detailsHTML;

        } catch (error) {
            console.error("🚨 Fetching error:", error);
            resultDiv.innerHTML = `<p>❌ Error scanning token: ${error.message}</p>`;
        }

        scanButton.disabled = false;
    });
});
