async function analyzeToken() {
    const contractAddress = document.getElementById("contractAddress").value.trim();
    if (!contractAddress) {
        alert("Masukkan Contract Address!");
        return;
    }

    const apiUrl = `https://micinscore.vercel.app/api/audit/${contractAddress}`;
    try {
        console.log("Fetching API:", apiUrl);

        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Parsed API Data:", data);

        // **PERBAIKAN UTAMA: AMBIL SCORE DARI `audit.score`**
        if (!data || !data.audit || typeof data.audit.score === "undefined") {
            document.getElementById("result").innerHTML = "❌ Token tidak ditemukan! (Invalid API response)";
            return;
        }

        const score = data.audit.score;

        let rotation = 0;
        let category = "";
        let color = "";

        if (score >= 76) {
            rotation = 0;
            category = "BUY 🟢";
            color = "#28a745";
        } else if (score >= 51) {
            rotation = -90;
            category = "POTENTIAL 🟠";
            color = "#fd7e14";
        } else if (score >= 26) {
            rotation = -180;
            category = "SELL 🔴";
            color = "#dc3545";
        } else {
            rotation = -270;
            category = "LOOKING 🟡";
            color = "#ffc107";
        }

        document.querySelector(".spinner").style.transform = `rotate(${rotation}deg)`;
        document.getElementById("result").innerHTML = `<strong style="color:${color};">${category}</strong> (Score: ${score})`;

    } catch (error) {
        document.getElementById("result").innerHTML = `❌ Error: ${error.message}`;
        console.error("Error fetching API:", error);
    }
}
