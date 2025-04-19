const apiKey = "AIzaSyCBalvaT8iNQDYX9eROmOvftMKMIZOZFnI";
let policyChunks = []; // This will store the loaded policy chunks

// Load policy chunks from extension directory
async function loadPolicyChunks() {
  try {
    const response = await fetch(chrome.runtime.getURL("policy_chunks.json"));
    policyChunks = await response.json();
    console.log("✅ Policy chunks loaded:", policyChunks.length);
    return { status: "Policy chunks loaded successfully" };
  } catch (error) {
    console.error("❌ Error loading policy chunks:", error);
    return { status: "Error loading policy chunks" };
  }
}

// Simple keyword matching for relevant chunks
function findRelevantChunks(question, chunks) {
  const keywords = question.toLowerCase().split(/\s+/);
  return chunks.filter(chunk => {
    if (!chunk || typeof chunk.content !== "string") {
      console.warn("Skipping invalid chunk:", chunk);
      return false;
    }

    const content = chunk.content.toLowerCase();
    return keywords.some(keyword => content.includes(keyword));
  }).slice(0, 5);
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("📩 Received message:", request);

  if (request.action === "loadPolicy") {
    loadPolicyChunks().then(response => {
      sendResponse(response);
    });
    return true; // Indicates async response
  }

  if (request.action === "chat") {
    console.log("💬 Chat message received:", request.message);

    if (policyChunks.length === 0) {
      console.warn("⚠️ Policy chunks not loaded yet.");
      sendResponse({ response: "Please load the college policy first." });
      return true;
    }

    const relevantChunks = findRelevantChunks(request.message, policyChunks);
    console.log("🔎 Relevant chunks found:", relevantChunks.length);

    if (relevantChunks.length === 0) {
      sendResponse({ response: "This information is not covered in the college policy documents." });
      return true;
    }

    const context = relevantChunks.map(chunk =>
      `From "${chunk.title || 'Policy Document'}" (Page ${chunk.start_page}):\n${chunk.content}`
    ).join("\n\n");

    const prompt = `
You are an assistant that ONLY answers questions about Manav Rachna University policies.
Use ONLY the following policy excerpts to answer the question. 
If the question can't be answered from these excerpts, say "This information is not covered in the college policy documents."

Policy Context:
${context}

Question: ${request.message}

Answer:
- Be precise and factual
- Only use information from the provided policy excerpts
- Cite which document/section your answer comes from
- If multiple policies apply, mention all relevant ones
`;

    fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    )
      .then(response => response.json())
      .then(data => {
        console.log("🤖 Gemini API response:", data);
        const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
          "I couldn't generate a response. Please try again.";
        sendResponse({ response: botReply });
      })
      .catch(error => {
        console.error("❌ Error calling Gemini API:", error);
        sendResponse({ response: "Error processing your question." });
      });

    return true; // Indicates async sendResponse
  }
});
