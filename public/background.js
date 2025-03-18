/**
 * LeetCode Mock Interview - Background Script
 * Handles transcript processing, analysis, and LLM integration
 */

// Store the active tab ID for communication
let activeTabId = null;

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Background received message:", message);
    
    // Store the tab ID for future communication
    if (sender.tab && sender.tab.id) {
        activeTabId = sender.tab.id;
    }

    // Handle transcript processing
    if (message.action === "processTranscript") {
        console.log("Processing transcript:", message.transcript);
        
        // Store the transcript and problem data in local storage
        storeTranscript(message.transcript, message.url, message.timestamp, message.problemData);
        
        // Let the content script know we received the transcript
        sendResponse({ status: "success", message: "Transcript received and stored" });
    }
    
    // Handle transcript analysis request
    if (message.action === "analyzeTranscript") {
        console.log("Analyzing transcript:", message.transcript);
        
        // Begin analysis - this function will handle sending the response back
        analyzeTranscript(message.transcript);
        
        // Send immediate response that analysis is starting
        sendResponse({ status: "analyzing", message: "Starting transcript analysis" });
    }

    return true; // Required for async responses
});

/**
 * Store transcript in local storage with problem data
 */
function storeTranscript(transcriptText, url, timestamp, problemData) {
    chrome.storage.local.get(['transcripts'], result => {
        const savedTranscripts = result.transcripts || [];
        
        // Check if we already have this transcript to avoid duplicates
        const existingIndex = savedTranscripts.findIndex(t => t.text === transcriptText);
        
        if (existingIndex === -1) {
            // Add new transcript
            savedTranscripts.push({
                text: transcriptText,
                url: url || window.location.href,
                timestamp: timestamp || new Date().toISOString(),
                problemData: problemData || {},
                analyzed: false
            });
        }
        
        // Save back to storage
        chrome.storage.local.set({ transcripts: savedTranscripts });
    });
}

/**
 * Analyze transcript and send results back to content script
 * In a production version, this would connect to an actual LLM API
 */
function analyzeTranscript(transcriptText) {
    // Simulate LLM analysis with local functions
    // In a real implementation, this would call an external API
    const mockLLMAnalysis = performMockLLMAnalysis(transcriptText);
    
    // Add a slight delay to simulate API call
    setTimeout(() => {
        // Send analysis results back to the content script
        if (activeTabId) {
            chrome.tabs.sendMessage(activeTabId, {
                action: "transcriptProcessed",
                analysis: mockLLMAnalysis
            });
        }
    }, 1500);
}

/**
 * Perform a simulated LLM analysis of the transcript text
 * This function mimics what an actual LLM might return
 * In a production app, you would replace this with a call to an API endpoint
 */
function performMockLLMAnalysis(text) {
    if (!text || text.trim() === "") {
        return "No speech detected. Please try again with your explanation.";
    }
    
    // Basic metrics
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const sentenceCount = text.split(/[.!?]+/).filter(Boolean).length;
    const averageWordsPerSentence = sentenceCount > 0 ? (wordCount / sentenceCount).toFixed(1) : 0;
    
    // Identify filler words
    const fillerWords = ["um", "uh", "like", "so", "you know", "actually", "basically", "literally"];
    const fillerWordCounts = {};
    let totalFillerWords = 0;
    
    fillerWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = text.match(regex) || [];
        fillerWordCounts[word] = matches.length;
        totalFillerWords += matches.length;
    });
    
    // Calculate speech rate (words per minute)
    // Assuming average reading speed of 150 words per minute
    const estimatedDuration = wordCount / 150;
    const speechRate = estimatedDuration > 0 ? (wordCount / estimatedDuration).toFixed(0) : 0;
    
    // Technical terms - check for presence of algorithmic concepts
    const technicalTerms = [
        "time complexity", "space complexity", "big o", "algorithm", "data structure",
        "array", "list", "tree", "graph", "hash", "recursion", "iteration", "dynamic programming",
        "greedy", "backtracking", "sort", "search", "binary search", "dfs", "bfs", "edge case"
    ];
    
    const technicalTermsFound = technicalTerms.filter(term => 
        new RegExp(`\\b${term.replace(/\s+/g, '\\s+')}\\b`, 'i').test(text)
    );
    
    // Generate content feedback based on analysis
    const generateContentFeedback = () => {
        // Determine content quality based on length, technical terms, etc.
        const contentFeedback = [];
        
        // Feedback based on explanation length
        if (wordCount < 50) {
            contentFeedback.push("Your explanation was quite brief. In a technical interview, interviewers appreciate more detailed explanations that demonstrate your thought process.");
        } else if (wordCount > 300) {
            contentFeedback.push("Your explanation was very detailed. While thoroughness is good, practice being a bit more concise for technical interviews.");
        } else {
            contentFeedback.push("Your explanation length was appropriate for an interview response.");
        }
        
        // Feedback on technical content
        if (technicalTermsFound.length > 5) {
            contentFeedback.push("You effectively used technical terminology to explain your solution, which demonstrates strong technical communication.");
        } else if (technicalTermsFound.length > 2) {
            contentFeedback.push("You incorporated some technical concepts into your explanation. Consider expanding your technical vocabulary.");
        } else {
            contentFeedback.push("Try to incorporate more technical terminology when explaining your approach to demonstrate your understanding of algorithms and data structures.");
        }
        
        // Feedback on time/space complexity
        if (text.includes("time complexity") || text.includes("big o")) {
            contentFeedback.push("Great job discussing the time complexity of your solution. This is key in technical interviews.");
        } else {
            contentFeedback.push("Remember to discuss the time and space complexity of your solution. This is a critical component that interviewers look for.");
        }
        
        // Feedback on structure
        if (sentenceCount > 3 && averageWordsPerSentence < 25) {
            contentFeedback.push("Your explanation had a good structure with clear sentences. This helps interviewers follow your thought process.");
        } else if (averageWordsPerSentence > 30) {
            contentFeedback.push("Your sentences are quite long. Consider breaking down complex ideas into shorter, clearer sentences for better communication.");
        }
        
        return contentFeedback;
    };
    
    // Generate delivery feedback
    const generateDeliveryFeedback = () => {
        const deliveryFeedback = [];
        
        // Filler words feedback
        if (totalFillerWords > 0) {
            const fillerWordPercentage = (totalFillerWords / wordCount * 100).toFixed(1);
            if (fillerWordPercentage > 10) {
                deliveryFeedback.push(`You used a high number of filler words (${fillerWordPercentage}% of your speech). Reducing filler words will make your communication sound more confident and polished.`);
            } else if (fillerWordPercentage > 5) {
                deliveryFeedback.push(`You used some filler words (${fillerWordPercentage}% of your speech). Practice reducing these for clearer communication.`);
            } else {
                deliveryFeedback.push(`You used very few filler words (${fillerWordPercentage}% of your speech). This indicates confident communication.`);
            }
        } else {
            deliveryFeedback.push("Your delivery was clear, with minimal or no filler words. This demonstrates confidence and preparation.");
        }
        
        // Speech rate feedback
        if (speechRate > 180) {
            deliveryFeedback.push(`Your speaking rate was quite fast (approximately ${speechRate} words/minute). Consider slowing down slightly to ensure the interviewer can follow your explanation.`);
        } else if (speechRate < 120) {
            deliveryFeedback.push(`Your speaking rate was somewhat slow (approximately ${speechRate} words/minute). A slightly faster pace might help maintain the interviewer's engagement.`);
        } else {
            deliveryFeedback.push(`Your speaking rate was good (approximately ${speechRate} words/minute), making it easy to follow your explanation.`);
        }
        
        return deliveryFeedback;
    };
    
    // Generate suggestions for improvement
    const generateSuggestions = () => {
        const suggestions = [];
        
        // Suggestion based on technical terms
        if (technicalTermsFound.length < 3) {
            suggestions.push("Use more technical terminology related to algorithms and data structures.");
        }
        
        // Suggestion based on filler words
        if (totalFillerWords > wordCount * 0.08) {
            suggestions.push("Practice reducing filler words by pausing briefly instead of saying 'um' or 'uh'.");
        }
        
        // Suggestion for completeness
        if (!text.toLowerCase().includes("edge case") && !text.toLowerCase().includes("test case")) {
            suggestions.push("Mention edge cases and how your solution handles them.");
        }
        
        if (!text.toLowerCase().includes("complexity") && !text.toLowerCase().includes("big o")) {
            suggestions.push("Always discuss time and space complexity of your solution.");
        }
        
        // Add a couple general interview suggestions
        suggestions.push("Practice explaining your solution to a non-technical friend for clarity.");
        suggestions.push("Ask clarifying questions before diving into your solution.");
        
        return suggestions;
    };
    
    // Generate strengths
    const generateStrengths = () => {
        const strengths = [];
        
        if (wordCount > 100 && sentenceCount > 5) {
            strengths.push("You provided a thorough explanation with good detail.");
        }
        
        if (technicalTermsFound.length > 3) {
            strengths.push("You demonstrated technical knowledge by using appropriate terminology.");
        }
        
        if (totalFillerWords < wordCount * 0.05) {
            strengths.push("Your communication was clear with minimal filler words.");
        }
        
        if (text.toLowerCase().includes("complexity") || text.toLowerCase().includes("big o")) {
            strengths.push("You appropriately addressed algorithm efficiency.");
        }
        
        if (text.toLowerCase().includes("edge case") || text.toLowerCase().includes("test case")) {
            strengths.push("You considered edge cases, which shows thorough problem-solving.");
        }
        
        return strengths;
    };
    
    // Get the feedback components
    const contentFeedback = generateContentFeedback();
    const deliveryFeedback = generateDeliveryFeedback();
    const suggestions = generateSuggestions();
    const strengths = generateStrengths();
    
    // Format the analysis as HTML for display
    let analysisHTML = `
        <div class="analysis-metrics">
            <div><strong>Word count:</strong> ${wordCount}</div>
            <div><strong>Duration:</strong> ~${estimatedDuration.toFixed(1)} min</div>
            <div><strong>Speech rate:</strong> ~${speechRate} wpm</div>
            <div><strong>Technical terms:</strong> ${technicalTermsFound.length}</div>
        </div>
        
        <div class="feedback-content">
            <h4>Content Analysis</h4>
            <ul>
                ${contentFeedback.map(item => `<li>${item}</li>`).join('')}
            </ul>
        </div>
        
        <div class="feedback-delivery">
            <h4>Delivery Analysis</h4>
            <ul>
                ${deliveryFeedback.map(item => `<li>${item}</li>`).join('')}
            </ul>
        </div>
    `;
    
    // Add strengths section if we have any
    if (strengths.length > 0) {
        analysisHTML += `
            <div class="feedback-strengths">
                <h4>Strengths</h4>
                <ul>
                    ${strengths.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    // Add suggestions for improvement
    if (suggestions.length > 0) {
        analysisHTML += `
            <div class="feedback-suggestions">
                <h4>Suggestions for Improvement</h4>
                <ul>
                    ${suggestions.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    // Add a note about LLM integration
    analysisHTML += `
        <div class="panel-footer" style="margin-top:15px; font-style:italic;">
            Analysis powered by AI feedback
        </div>
    `;
    
    return analysisHTML;
}
