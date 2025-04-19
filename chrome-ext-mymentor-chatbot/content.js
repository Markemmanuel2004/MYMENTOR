// Function to check if the chatbot button already exists
function isChatbotAlreadyInjected() {
    return document.getElementById("mentor-btn") !== null;
}

// ... (previous code remains the same until the createMentorChat function)

function createMentorChat() {
    if (isChatbotAlreadyInjected()) {
        return;
    }

    // Create mentor button
    let mentorBtn = document.createElement("button");
    mentorBtn.innerText = "My Mentor";
    mentorBtn.id = "mentor-btn";
    
    // Create chatbox container
    let chatbox = document.createElement("div");
    chatbox.id = "chatbox";
    chatbox.classList.add("hidden");

    // Create messages container
    let messagesContainer = document.createElement("div");
    messagesContainer.id = "chatbox-messages";

    // Create input container
    let inputContainer = document.createElement("div");
    inputContainer.id = "chatbox-input-container";

    // Create input field
    let inputField = document.createElement("input");
    inputField.id = "mentor-input";
    inputField.type = "text";
    inputField.placeholder = "Ask something...";

    // Create send button
    let sendBtn = document.createElement("button");
    sendBtn.id = "send-btn";
    sendBtn.innerText = "Send";

    // Append elements to chatbox
    inputContainer.appendChild(inputField);
    inputContainer.appendChild(sendBtn);
    chatbox.appendChild(messagesContainer);
    chatbox.appendChild(inputContainer);
    document.body.appendChild(mentorBtn);
    document.body.appendChild(chatbox);

    // Toggle chatbox visibility on button click
    mentorBtn.addEventListener("click", function () {
        chatbox.classList.toggle("hidden");
    });

    function addMessage(text, sender) {
        const message = document.createElement("p");
        message.innerHTML = `<b>${sender}:</b> ${text}`;
        message.classList.add(sender);
        messagesContainer.appendChild(message);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Send message to Gemini API when clicking send button
    sendBtn.addEventListener("click", async function () {
        let userInput = inputField.value.trim();
        if (!userInput) return;

        addMessage(userInput, "You");
        inputField.value = "";

        try {
            const response = await fetch(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCBalvaT8iNQDYX9eROmOvftMKMIZOZFnI",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: userInput }] }]
                    })
                }
            );

            const data = await response.json();
            const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't understand.";
            addMessage(botReply, "Bot");
        } catch (error) {
            console.error("Error fetching from Gemini:", error);
            addMessage("Error fetching response.", "Bot");
        }
    });
}

// ... (rest of the code remains the same)

// Inject chatbot UI only if the page is loaded
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createMentorChat);
} else {
    createMentorChat();
}
