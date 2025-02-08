// 🔥 Scan Token Function
const scanToken = async () => {
    const tokenAddress = document.getElementById("tokenInput").value.trim();
    if (!tokenAddress) {
        alert("❌ Please enter a valid token address!");
        return;
    }

    // 🔄 Start spinner animation
    const indicator = document.querySelector(".indicator");
    indicator.classList.add("spinning");

    try {
        const response = await fetch(`/api/audit/${tokenAddress}`);
        const data = await response.json();

        // Stop spinner and show result
        indicator.classList.remove("spinning");
        updateSpinner(data.audit.score);

        displayResult(data);
    } catch (error) {
        console.error("❌ Error scanning token:", error);
        document.getElementById("result").innerHTML = "<p>❌ Error scanning token.</p>";
    }
};

// 🔄 Update Spinner based on Score
const updateSpinner = (score) => {
    const indicator = document.querySelector(".indicator");
    let rotation = 0;

    if (score >= 76) rotation = 0; // Buy
    else if (score >= 51) rotation = 90; // Potential
    else if (score >= 26) rotation = 180; // Sell
    else rotation = 270; // Looking

    indicator.style.transform = `rotate(${rotation}deg)`;
};

// 📊 Display Scan Result
const displayResult = (data) => {
    const resultContainer = document.getElementById("result");
    resultContainer.innerHTML = `
        <h3>🔍 Audit Result</h3>
        <p><strong>Token:</strong> ${data.token}</p>
        <p><strong>Status:</strong> ${data.audit.status}</p>
        <p><strong>Score:</strong> ${data.audit.score}</p>
    `;

    // 📊 Display Detailed Parameters
    const detailsContainer = document.getElementById("scan-details");
    detailsContainer.innerHTML = "<h3>📊 Detailed Analysis</h3>";
    
    data.audit.details.forEach(item => {
        const detailItem = document.createElement("p");
        detailItem.innerHTML = `<strong>${item.factor}:</strong> ${item.status} (Deduction: ${item.deduction ?? 0})`;
        detailsContainer.appendChild(detailItem);
    });
};

// 🔥 Fetch Early Radar Tokens
const fetchEarlyRadar = async () => {
    try {
        const response = await fetch('/api/early-radar');
        const tokens = await response.json();

        const radarContainer = document.getElementById('early-radar-list');
        radarContainer.innerHTML = "";

        if (tokens.length === 0) {
            radarContainer.innerHTML = "<p>No new promising tokens detected yet.</p>";
            return;
        }

        tokens.forEach(token => {
            const tokenElement = document.createElement("div");
            tokenElement.classList.add("early-radar-token");
            tokenElement.innerHTML = `
                <p><strong>${token.name}</strong> (${token.address})</p>
                <p>Score: <span class="score-badge">${token.score}</span></p>
            `;
            radarContainer.appendChild(tokenElement);
        });

    } catch (error) {
        console.error("❌ Error fetching Early Radar:", error);
        document.getElementById('early-radar-list').innerHTML = "<p>Error loading Early Radar.</p>";
    }
};

// 🔄 Auto-refresh Early Radar setiap 5 menit
setInterval(fetchEarlyRadar, 300000);
fetchEarlyRadar();
