// popup.js
document.addEventListener("DOMContentLoaded", function () {
    const chatboxMessages = document.getElementById("chatbox-messages");
    const inputField = document.getElementById("mentor-input");
    const sendButton = document.getElementById("send-btn");
    const statusIndicator = document.createElement("div");
    
    statusIndicator.id = "policy-status";
    statusIndicator.textContent = "Loading college policies...";
    document.getElementById("chatbox").prepend(statusIndicator);

    function addMessage(text, sender) {
        const message = document.createElement("p");
        message.textContent = `${sender}: ${text}`;
        message.classList.add(sender); 
        chatboxMessages.appendChild(message);
        chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
    }

    // Load policies when popup opens
    chrome.runtime.sendMessage(
        { action: "loadPolicy" },
        (response) => {
            statusIndicator.textContent = "College policies ready";
            addMessage("I can now answer questions about Manav Rachna University policies.", "system");
        }
    );

    sendButton.addEventListener("click", function () {
        const userMessage = inputField.value.trim();
        if (userMessage === "") return;

        addMessage(userMessage, "user");
        inputField.value = ""; 

        chrome.runtime.sendMessage(
            { action: "chat", message: userMessage },
            (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Error:", chrome.runtime.lastError);
                    addMessage("Error sending message.", "ai");
                    return;
                }
                addMessage(response.response, "ai");
            }
        );
    });

    inputField.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            sendButton.click();
        }
    });
});
