chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Background received message:", message);

    if (message.action === "processTranscript") {
        console.log("Processing transcript:", message.transcript);

        // Here, you could send the transcript to OpenAI API or store it
        sendResponse({ status: "success", message: "Transcript received" });
    }

    return true; // Required for async responses
});
