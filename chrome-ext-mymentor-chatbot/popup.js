const apiKey = "YOURAPIKEY"; // Replace with your actual API key

document.addEventListener("DOMContentLoaded", function () {
    const chatboxMessages = document.getElementById("chatbox-messages");
    const inputField = document.getElementById("mentor-input");
    const sendButton = document.getElementById("send-btn");

    function addMessage(text, sender) {
        const message = document.createElement("p");
        message.textContent = text;
        message.classList.add(sender); 
        chatboxMessages.appendChild(message);
        chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
    }

    sendButton.addEventListener("click", function () {
        const userMessage = inputField.value.trim();
        if (userMessage === "") return;

        addMessage("You: " + userMessage, "user");
        inputField.value = ""; 

        chrome.runtime.sendMessage({ action: "chat", message: userMessage }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Error:", chrome.runtime.lastError);
                addMessage("Bot: Error sending message.", "ai");
                return;
            }

            console.log("Received response from background.js:", response);
            addMessage("Bot: " + response.response, "ai");
        });
    });

    inputField.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            sendButton.click();
        }
    });
});
