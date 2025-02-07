async function analyzeToken() {
    const contractAddress = document.getElementById("contractAddress").value.trim();
    if (!contractAddress) {
        alert("Masukkan Contract Address!");
        return;
    }

    const apiUrl = `https://micinscore.vercel.app/api/audit/${contractAddress}`;
    try {
        console.log("Fetching API:", apiUrl); // DEBUG: Lihat apakah URL API benar

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
        console.log("Data API:", data); // DEBUG: Lihat apakah API mengembalikan data

        if (!data || data.score === undefined) {
            document.getElementById("result").innerHTML = "❌ Token tidak ditemukan! (Invalid API response)";
            return;
        }

        let rotation = 0;
        let category = "";
        let color = "";

        if (data.score >= 76) {
            rotation = 0;
            category = "BUY 🟢";
            color = "#28a745";
        } else if (data.score >= 51) {
            rotation = -90;
            category = "POTENTIAL 🟠";
            color = "#fd7e14";
        } else if (data.score >= 26) {
            rotation = -180;
            category = "SELL 🔴";
            color = "#dc3545";
        } else {
            rotation = -270;
            category = "LOOKING 🟡";
            color = "#ffc107";
        }

        document.querySelector(".spinner").style.transform = `rotate(${rotation}deg)`;
        document.getElementById("result").innerHTML = `<strong style="color:${color};">${category}</strong> (Score: ${data.score})`;

    } catch (error) {
        document.getElementById("result").innerHTML = `❌ Error: ${error.message}`;
        console.error("Error fetching API:", error);
    }
}
