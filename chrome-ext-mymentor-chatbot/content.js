// Function to check if the chatbot button already exists
function isChatbotAlreadyInjected() {
    return document.getElementById("mentor-btn") !== null;
}

// Function to create the chatbot UI
function createMentorChat() {
    if (isChatbotAlreadyInjected()) {
        return; // Prevent duplicate buttons
    }

    // Create mentor button
    let mentorBtn = document.createElement("button");
    mentorBtn.innerText = "My Mentor";
    mentorBtn.id = "mentor-btn";
    
    // Create chatbox container
    let chatbox = document.createElement("div");
    chatbox.id = "chatbox";
    chatbox.classList.add("hidden");

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
    chatbox.appendChild(inputField);
    chatbox.appendChild(sendBtn);
    document.body.appendChild(mentorBtn);
    document.body.appendChild(chatbox);

    // Toggle chatbox visibility on button click
    mentorBtn.addEventListener("click", function () {
        chatbox.classList.toggle("hidden");
    });

    // Send message to Gemini API when clicking send button
    sendBtn.addEventListener("click", async function () {
        let userInput = inputField.value.trim();
        if (!userInput) return;

        // Display user message
        chatbox.innerHTML += `<p><b>You:</b> ${userInput}</p>`;
        inputField.value = "";

        console.log("Sending message to Gemini:", userInput);

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
            console.log("Gemini API Response:", data);

            // Extract bot response
            const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't understand.";

            // Display bot response
            chatbox.innerHTML += `<p><b>Bot:</b> ${botReply}</p>`;
        } catch (error) {
            console.error("Error fetching from Gemini:", error);
            chatbox.innerHTML += `<p><b>Bot:</b> Error fetching response.</p>`;
        }
    });
}

// Inject chatbot UI only if the page is loaded
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createMentorChat);
} else {
    createMentorChat();
}
