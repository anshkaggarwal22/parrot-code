(function() {
    if (window.hasRun) return;
    window.hasRun = true;

    let recognition = null;
    let transcript = "";
    let isRecording = false;
    let mediaStream = null;
    let recordingStartTime = null;
    let recordingTimer = null;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    function createInterviewPanel() {
        const shadowHost = document.createElement('div');
        shadowHost.id = "leetcode-interview-shadow-host";
        document.body.appendChild(shadowHost);

        const shadowRoot = shadowHost.attachShadow({mode:'open'});
        const panel = document.createElement('div');
        panel.innerHTML = `
            <style>
                #interview-panel {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 350px;
                    height: 450px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0px 4px 20px rgba(0,0,0,0.15);
                    padding: 15px;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    z-index: 9999;
                    display: flex;
                    flex-direction: column;
                    color: #2d3748;
                    border: 1px solid #e2e8f0;
                }
                .panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #edf2f7;
                }
                .panel-header h3 {
                    margin: 0;
                    font-weight: 600;
                    color: #1a365d;
                }
                #status {
                    font-size: 13px;
                    color: #718096;
                    display: flex;
                    align-items: center;
                }
                #recording-indicator {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: #e53e3e;
                    margin-right: 8px;
                    display: none;
                }
                #recording-indicator.active {
                    display: inline-block;
                    animation: pulse 1.5s infinite;
                }
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.3; }
                    100% { opacity: 1; }
                }
                #timer {
                    display: none;
                    margin-left: 5px;
                    font-family: monospace;
                }
                #transcription {
                    flex: 1;
                    overflow-y: auto;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    padding: 12px;
                    margin: 10px 0;
                    background: #f8fafc;
                    font-size: 14px;
                    line-height: 1.6;
                    max-height: 300px;
                }
                .button-group {
                    display: flex;
                    gap: 10px;
                    margin-top: 10px;
                }
                button {
                    background: #4299e1;
                    color: white;
                    padding: 8px 16px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-weight: 500;
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                button:hover {
                    background: #3182ce;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                button:disabled {
                    background: #cbd5e0;
                    cursor: not-allowed;
                }
                #start-btn {
                    background: #48bb78;
                }
                #start-btn:hover {
                    background: #38a169;
                }
                #end-btn {
                    background: #f56565;
                }
                #end-btn:hover {
                    background: #e53e3e;
                }
                .feedback-section {
                    border-top: 1px solid #edf2f7;
                    padding-top: 10px;
                    margin-top: 10px;
                }
                .feedback-section h4 {
                    margin: 5px 0;
                    font-size: 15px;
                    color: #2d3748;
                }
                .analysis-metrics {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                    margin: 8px 0;
                    font-size: 13px;
                }
                .filler-word-analysis ul {
                    margin: 5px 0;
                    padding-left: 20px;
                    font-size: 13px;
                }
                .panel-footer {
                    font-size: 11px;
                    color: #a0aec0;
                    text-align: center;
                    margin-top: 8px;
                }
            </style>
            <div id="interview-panel">
                <div class="panel-header">
                    <h3>LeetCode Mock Interview</h3>
                    <div id="status">
                        <span id="recording-indicator"></span>
                        <span id="status-text">Ready to record</span>
                        <span id="timer">00:00</span>
                    </div>
                </div>
                <div id="transcription"></div>
                <div class="button-group">
                    <button id="start-btn">Start Recording</button>
                    <button id="end-btn" style="display:none;">Stop Recording</button>
                </div>
                <div class="panel-footer">Explain your solution as if in a real interview</div>
            </div>
        `;
        shadowRoot.appendChild(panel);

        const startBtn = shadowRoot.querySelector("#start-btn");
        const endBtn = shadowRoot.querySelector("#end-btn");
        const statusText = shadowRoot.querySelector("#status-text");
        const transcriptText = shadowRoot.querySelector("#transcription");
        const recordingIndicator = shadowRoot.querySelector("#recording-indicator");
        const timer = shadowRoot.querySelector("#timer");

        startBtn.addEventListener("click", () => startInterview(statusText, endBtn, startBtn, transcriptText, recordingIndicator, timer));
        endBtn.addEventListener("click", () => endInterview(statusText, endBtn, startBtn, timer));
        
        // Listen for messages from the background script
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === "transcriptProcessed" && message.analysis) {
                displayTranscriptAnalysis(message.analysis, transcriptText);
                sendResponse({status: "received"});
            }
            return true; // Keep the message channel open for async response
        });
    }

    function startInterview(statusText, endBtn, startBtn, transcriptText, recordingIndicator, timer) {
        console.log("Start button clicked! Starting recognition...");
        statusText.innerText = "Requesting microphone access...";
        
        navigator.mediaDevices.getUserMedia({audio: true})
            .then(stream => {
                mediaStream = stream;
                statusText.innerText = "Recording";
                startBtn.style.display = "none";
                endBtn.style.display = "inline";
                recordingIndicator.classList.add("active");
                timer.style.display = "inline";
                
                transcript = ""; // Reset transcript on new recording
                transcriptText.innerText = ""; // Clear displayed transcript
                
                // Start timer
                recordingStartTime = Date.now();
                startTimer(timer);
                
                startSpeechRecognition(transcriptText, statusText);
            })
            .catch(error => {
                console.error("Microphone error:", error);
                statusText.innerText = "Microphone access denied. Please allow microphone access and try again.";
            });
    }

    function startTimer(timerElement) {
        if (recordingTimer) clearInterval(recordingTimer);
        
        recordingTimer = setInterval(() => {
            const elapsedTime = Date.now() - recordingStartTime;
            const minutes = Math.floor(elapsedTime / 60000);
            const seconds = Math.floor((elapsedTime % 60000) / 1000);
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    function endInterview(statusText, endBtn, startBtn, timer) {
        console.log("End button clicked! Stopping recognition...");
        
        if (mediaStream) {
            mediaStream.getAudioTracks().forEach(track => {
                track.stop();
            });
            mediaStream = null;
        }
        
        if (recordingTimer) {
            clearInterval(recordingTimer);
            recordingTimer = null;
        }

        statusText.innerText = "Processing...";
        endBtn.style.display = "none";
        startBtn.style.display = "inline";
        
        const recordingIndicator = document.querySelector("#recording-indicator");
        if (recordingIndicator) recordingIndicator.classList.remove("active");
        
        timer.style.display = "none";

        stopSpeechRecognition();
        
        // Immediately analyze the transcript
        setTimeout(() => {
            if (transcript.trim()) {
                statusText.innerText = "Analyzing your response...";
                analyzeTranscript(statusText);
            } else {
                statusText.innerText = "No speech detected. Try again.";
            }
        }, 500);
    }

    function startSpeechRecognition(transcriptText, statusText) {
        if (!SpeechRecognition) {
            alert("Your browser doesn't support speech recognition. Please try Chrome, Edge, or Safari.");
            return;
        }
        
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        isRecording = true;

        recognition.onstart = () => {
            console.log("Speech recognition started.");
        };
        
        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event);
            
            // Handle different types of errors
            switch(event.error) {
                case 'network':
                    // Don't immediately restart on network errors to prevent loops
                    console.log("Network error detected in speech recognition");
                    if (isRecording) {
                        statusText.innerText = "Network issue. Reconnecting...";
                        // Wait longer before retrying to avoid rapid cycling
                        setTimeout(() => {
                            if (isRecording) {
                                statusText.innerText = "Recording";
                                startSpeechRecognition(transcriptText, statusText);
                            }
                        }, 2000);
                    }
                    break;
                    
                case 'no-speech':
                    // If no speech detected but we're still recording, restart recognition
                    if (isRecording) {
                        setTimeout(() => {
                            if (isRecording) startSpeechRecognition(transcriptText, statusText);
                        }, 1000);
                    }
                    break;
                    
                case 'aborted':
                case 'audio-capture':
                case 'not-allowed':
                case 'service-not-allowed':
                    // For permission and critical errors, stop recording
                    isRecording = false;
                    statusText.innerText = "Recording failed: " + event.error;
                    break;
                    
                default:
                    // For other errors, try to restart if still recording
                    if (isRecording) {
                        console.log("Attempting to restart speech recognition after error:", event.error);
                        setTimeout(() => {
                            if (isRecording) startSpeechRecognition(transcriptText, statusText);
                        }, 1000);
                    }
                    break;
            }
        };
        
        recognition.onend = () => {
            console.log("Speech recognition ended.");
            // Restart recognition if it ended unexpectedly and we're still recording
            if (isRecording) {
                console.log("Restarting speech recognition...");
                startSpeechRecognition(transcriptText, statusText);
            }
        };
        
        recognition.onresult = (event) => {
            transcribe(event, transcriptText);
        };
        
        // Start recognition
        try {
            recognition.start();
        } catch (error) {
            console.error("Failed to start speech recognition:", error);
            statusText.innerText = "Failed to start recording. Please refresh and try again.";
        }
    }

    function transcribe(event, transcriptText) {
        let interimTranscript = '';
        let finalTranscript = '';
        
        // Get interim results
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            const result = event.results[i];
            if (result.isFinal) {
                finalTranscript += result[0].transcript;
            } else {
                interimTranscript += result[0].transcript;
            }
        }
        
        // Add to overall transcript
        if (finalTranscript) {
            transcript += " " + finalTranscript;
        }
        
        // Display in UI
        transcriptText.innerHTML = transcript + '<span style="color:#a0aec0;">' + interimTranscript + '</span>';
        transcriptText.scrollTop = transcriptText.scrollHeight; // Auto-scroll to bottom
    }

    function stopSpeechRecognition() {
        isRecording = false;
        
        if (recognition) {
            try {
                recognition.stop();
                console.log("Speech recognition stopped.");
            } catch (error) {
                console.error("Error stopping speech recognition:", error);
            } finally {
                recognition = null;
            }
        }
        
        // Save transcript if not empty
        if (transcript.trim()) {
            const leetcodeData = extractLeetCodeData();
            
            chrome.runtime.sendMessage({
                action: "processTranscript",
                transcript: transcript,
                url: window.location.href,
                timestamp: new Date().toISOString(),
                problemData: leetcodeData
            }, response => {
                console.log("Background script response:", response);
            });
        }
    }

    function extractLeetCodeData() {
        // Extract LeetCode problem data
        const data = {
            title: document.title,
            problemName: "",
            difficulty: ""
        };
        
        // Try to extract problem name and difficulty
        try {
            // Different selectors to try for problem title
            const possibleTitleSelectors = [
                'div[data-cy="question-title"]',
                '.css-v3d350',
                'title'
            ];
            
            for (const selector of possibleTitleSelectors) {
                const element = document.querySelector(selector);
                if (element) {
                    data.problemName = element.textContent.trim();
                    break;
                }
            }
            
            // Try to extract difficulty
            const difficultyElement = document.querySelector('.css-10o4wqw');
            if (difficultyElement) {
                data.difficulty = difficultyElement.textContent.trim();
            }
        } catch (error) {
            console.error("Error extracting LeetCode data:", error);
        }
        
        return data;
    }

    function analyzeTranscript(statusText) {
        console.log("Analyzing transcript:", transcript);
        statusText.innerText = "Analyzing with AI...";
        
        chrome.runtime.sendMessage({
            action: "analyzeTranscript",
            transcript: transcript
        }, response => {
            console.log("Background script response for analysis request:", response);
            if (response && response.status === "analyzing") {
                // Analysis in progress, handled by message listener
            } else {
                statusText.innerText = "Analysis failed. Please try again.";
            }
        });
    }

    function displayTranscriptAnalysis(analysis, transcriptText) {
        // Create feedback container if it doesn't exist
        let feedbackSection = document.querySelector(".feedback-section");
        if (!feedbackSection) {
            feedbackSection = document.createElement("div");
            feedbackSection.className = "feedback-section";
            feedbackSection.innerHTML = `<h4>Interview Feedback</h4>`;
            transcriptText.insertAdjacentElement("afterend", feedbackSection);
        }
        
        // Update with new analysis
        feedbackSection.innerHTML = `<h4>Interview Feedback</h4>${analysis}`;
        
        // Update status
        const statusText = document.querySelector("#status-text");
        if (statusText) {
            statusText.innerText = "Feedback ready";
        }
        
        // Reset timer
        const timer = document.querySelector("#timer");
        if (timer) {
            timer.style.display = "none";
        }
    }

    // Initialize the panel when content script runs
    createInterviewPanel();
    
    // Check for problem context
    const problemData = extractLeetCodeData();
    console.log("LeetCode Problem Data:", problemData);
})();