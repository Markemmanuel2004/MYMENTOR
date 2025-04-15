chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "chat") {
        console.log("Received message:", request.message);

        fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=yourapikey",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: request.message }] }]
                })
            }
        )
        .then(response => response.json())
        .then(data => {
            console.log("Gemini API Response:", data);

            const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't understand.";
            sendResponse({ response: botReply });
        })
        .catch(error => {
            console.error("Error fetching from Gemini:", error);
            sendResponse({ response: "Error fetching response." });
        });

        return true; // Required for async sendResponse
    }
});
