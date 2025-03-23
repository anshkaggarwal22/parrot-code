// Self-executing function to avoid polluting global namespace
(function() {
  // Debug logging function
  function debugLog(message) {
    console.log(`[LeetCode Interview Assistant] ${message}`);
  }

  // State for the interview panel
  let interviewState = {
    isRecording: false,
    isSpeaking: false,
    stage: 'idle', // idle, introduction, coding, feedback
    messages: [
      {
        text: "Welcome to your LeetCode interview! I'll be your AI interviewer today. Click \"Start Interview\" when you're ready to begin.",
        sender: "ai"
      }
    ],
    transcript: "",
    problemData: null,
    recognition: null,
    mediaStream: null,
    recordingStartTime: null,
    recordingTimer: null
  };

  // Create and add the floating icon to the page
  function addFloatingIcon() {
    debugLog("Adding floating icon to the page");
    
    // Remove any existing icon
    const existingIcon = document.getElementById('leetcode-interview-icon');
    if (existingIcon) {
      existingIcon.remove();
    }

    // Create the icon container
    const iconContainer = document.createElement('div');
    iconContainer.id = 'leetcode-interview-icon';
    iconContainer.style.position = 'fixed';
    iconContainer.style.bottom = '20px';
    iconContainer.style.right = '20px';
    iconContainer.style.width = '50px';
    iconContainer.style.height = '50px';
    iconContainer.style.borderRadius = '50%';
    iconContainer.style.backgroundColor = '#661AE6'; // DaisyUI primary purple
    iconContainer.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    iconContainer.style.display = 'flex';
    iconContainer.style.alignItems = 'center';
    iconContainer.style.justifyContent = 'center';
    iconContainer.style.cursor = 'pointer';
    iconContainer.style.zIndex = '9999';
    iconContainer.style.transition = 'transform 0.2s';
    
    // Add hover effect
    iconContainer.addEventListener('mouseenter', () => {
      iconContainer.style.transform = 'scale(1.1)';
    });
    
    iconContainer.addEventListener('mouseleave', () => {
      iconContainer.style.transform = 'scale(1)';
    });
    
    // Create the avatar icon
    iconContainer.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" style="width: 24px; height: 24px;">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
      </svg>
    `;
    
    // Add click event to toggle the interview panel
    iconContainer.addEventListener('click', function(event) {
      debugLog("Icon clicked, toggling interview panel");
      toggleInterviewPanel();
      event.stopPropagation(); // Prevent click from propagating
    });
    
    // Add the icon to the page
    document.body.appendChild(iconContainer);
    debugLog("Floating icon added successfully");
  }

  // Toggle the interview panel visibility
  function toggleInterviewPanel() {
    const panel = document.getElementById('leetcode-interview-panel');
    
    if (panel) {
      // If panel exists, remove it
      debugLog("Closing existing panel");
      panel.remove();
    } else {
      // If panel doesn't exist, create it
      debugLog("Creating new panel");
      createInterviewPanel();
    }
  }

  // Create the interview panel with DaisyUI-like styling
  function createInterviewPanel() {
    debugLog("Creating interview panel");
    
    // Remove any existing panel
    const existingPanel = document.getElementById('leetcode-interview-panel');
    if (existingPanel) {
      existingPanel.remove();
    }

    // Create the panel
    const panel = document.createElement('div');
    panel.id = 'leetcode-interview-panel';
    panel.style.position = 'fixed';
    panel.style.bottom = '80px';
    panel.style.right = '20px';
    panel.style.width = '350px';
    panel.style.backgroundColor = '#1D232A'; // DaisyUI base-100 dark
    panel.style.color = '#A6ADBA'; // DaisyUI base-content
    panel.style.borderRadius = '0.5rem';
    panel.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)';
    panel.style.zIndex = '9998';
    panel.style.overflow = 'hidden';
    panel.style.fontFamily = 'Arial, sans-serif';
    panel.style.animation = 'slideIn 0.3s ease-out';

    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      @keyframes soundWave {
        0% { height: 4px; }
        50% { height: 24px; }
        100% { height: 4px; }
      }
      
      .sound-wave-bar {
        width: 4px;
        background-color: #661AE6; /* DaisyUI primary */
        border-radius: 2px;
        margin: 0 2px;
        height: 4px;
        animation: soundWave 1s infinite ease-in-out;
        animation-play-state: paused;
      }
      
      .sound-wave-bar:nth-child(1) { animation-delay: 0s; }
      .sound-wave-bar:nth-child(2) { animation-delay: 0.1s; }
      .sound-wave-bar:nth-child(3) { animation-delay: 0.2s; }
      .sound-wave-bar:nth-child(4) { animation-delay: 0.3s; }
      .sound-wave-bar:nth-child(5) { animation-delay: 0.4s; }
      .sound-wave-bar:nth-child(6) { animation-delay: 0.5s; }
      .sound-wave-bar:nth-child(7) { animation-delay: 0.6s; }
    `;
    document.head.appendChild(style);

    // Add panel content
    panel.innerHTML = `
      <div style="background-color: #661AE6; color: white; padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; font-size: 1.25rem; font-weight: bold;">AI Interview Assistant</h3>
        <button id="close-panel-btn" style="background: none; border: none; color: white; cursor: pointer; padding: 4px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div style="padding: 1.5rem; display: flex; flex-direction: column; align-items: center; border-bottom: 1px solid #2D3748;">
        <div style="width: 5rem; height: 5rem; border-radius: 9999px; background-color: #661AE6; display: flex; align-items: center; justify-content: center; margin-bottom: 0.75rem;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" style="width: 2.5rem; height: 2.5rem;">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
          </svg>
        </div>
        
        <h3 style="font-weight: bold; font-size: 1.125rem; margin-bottom: 0.5rem; color: #E5E7EB;">AI Interviewer</h3>
        
        <div style="display: flex; align-items: center; height: 2rem; gap: 0.25rem;">
          ${Array(7).fill().map(() => `<div class="sound-wave-bar"></div>`).join('')}
        </div>
      </div>
      
      <div id="interview-content" style="height: 16rem; overflow-y: auto; padding: 1rem; background-color: #191E24;">
        <!-- Messages will be added here -->
      </div>
      
      <div style="padding: 1rem; border-top: 1px solid #2D3748;">
        <button id="toggle-interview-btn" style="width: 100%; padding: 0.75rem; border: none; border-radius: 0.375rem; background-color: #661AE6; color: white; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
          Start Interview
        </button>
      </div>
    `;
    
    // Add the panel to the page
    document.body.appendChild(panel);
    
    // Add event listeners
    document.getElementById('close-panel-btn').addEventListener('click', () => {
      panel.remove();
    });
    
    // Add toggle interview button functionality
    document.getElementById('toggle-interview-btn').addEventListener('click', toggleInterview);
    
    // Display existing messages
    const contentArea = document.getElementById('interview-content');
    interviewState.messages.forEach(message => {
      addMessageToUI(message.text, message.sender);
    });
    
    // Update UI based on current state
    updateInterviewUI();
  }

  // Toggle interview state
  function toggleInterview() {
    if (interviewState.isRecording) {
      // End interview
      endInterview();
    } else {
      // Start interview
      startInterview();
    }
  }

  // Start the interview process
  function startInterview() {
    debugLog("Starting interview");
    
    // Extract problem data
    interviewState.problemData = extractLeetCodeData();
    debugLog("Problem data:", interviewState.problemData);
    
    // Update state
    interviewState.isRecording = true;
    interviewState.stage = 'introduction';
    interviewState.transcript = "";
    
    // Update UI
    updateInterviewUI();
    
    // Add message
    addMessage("I'll be your interviewer today. Let me first read the problem to you.", "ai");
    
    // Start the introduction phase - read the problem
    setTimeout(() => {
      readProblemDescription();
    }, 1000);
  }

  // End the interview process
  function endInterview() {
    debugLog("Ending interview");
    
    // Stop speech recognition
    stopSpeechRecognition();
    
    // Stop any ongoing speech
    if (interviewState.isSpeaking) {
      window.speechSynthesis.cancel();
      interviewState.isSpeaking = false;
    }
    
    // Update state
    interviewState.isRecording = false;
    interviewState.stage = 'feedback';
    
    // Update UI
    updateInterviewUI();
    
    // Add message
    addMessage("Interview ended. Let me provide some feedback on your solution.", "ai");
    
    // Generate feedback
    generateFeedback();
  }

  // Extract LeetCode problem data from the page
  function extractLeetCodeData() {
    debugLog("Extracting LeetCode problem data");
    
    const data = {
      title: document.title,
      problemName: "",
      difficulty: "",
      description: "",
      examples: []
    };
    
    try {
      // Extract problem name
      const titleElement = document.querySelector('[data-cy="question-title"]');
      if (titleElement) {
        data.problemName = titleElement.textContent.trim();
      }
      
      // Extract difficulty
      const difficultyElement = document.querySelector('.text-difficulty-easy, .text-difficulty-medium, .text-difficulty-hard');
      if (difficultyElement) {
        data.difficulty = difficultyElement.textContent.trim();
      }
      
      // Extract problem description
      const descriptionElement = document.querySelector('[data-cy="question-content"]');
      if (descriptionElement) {
        data.description = descriptionElement.textContent.trim();
      }
      
      // Extract examples
      const exampleElements = document.querySelectorAll('[data-cy="question-content"] pre');
      if (exampleElements.length > 0) {
        exampleElements.forEach((example, index) => {
          data.examples.push({
            index: index + 1,
            text: example.textContent.trim()
          });
        });
      }
    } catch (error) {
      debugLog("Error extracting LeetCode data:", error);
    }
    
    return data;
  }

  // Read the problem description using text-to-speech
  function readProblemDescription() {
    debugLog("Reading problem description");
    
    if (!interviewState.problemData) {
      addMessage("I couldn't find the problem description. Let's proceed with the interview anyway.", "ai");
      startCodingPhase();
      return;
    }
    
    // Prepare the text to read
    const problemName = interviewState.problemData.problemName || "this problem";
    const difficulty = interviewState.problemData.difficulty || "unknown difficulty";
    const description = interviewState.problemData.description || "No description available.";
    
    const introText = `Let's discuss ${problemName}, which is a ${difficulty} problem. Here's the problem description: ${description}`;
    
    // Add message to UI
    addMessage(introText, "ai");
    
    // Use text-to-speech to read the problem
    speakText(introText, () => {
      // After reading the problem, proceed to the coding phase
      startCodingPhase();
    });
  }

  // Start the coding phase of the interview
  function startCodingPhase() {
    debugLog("Starting coding phase");
    
    interviewState.stage = 'coding';
    updateInterviewUI();
    
    const codingPrompt = "Now, could you explain your approach to solving this problem? I'll listen to your solution.";
    addMessage(codingPrompt, "ai");
    
    speakText(codingPrompt, () => {
      // Start speech recognition after prompt is spoken
      startSpeechRecognition();
    });
  }

  // Generate feedback on the interview
  function generateFeedback() {
    debugLog("Generating feedback");
    
    if (!interviewState.transcript || interviewState.transcript.trim() === "") {
      addMessage("I didn't capture any response from you. Would you like to try again?", "ai");
      return;
    }
    
    // For now, just provide a simple feedback
    // In a real implementation, this would call an AI service
    const feedback = "Based on your explanation, I can see that you have a good understanding of the problem. Your approach seems reasonable, though you might want to consider edge cases more carefully. Overall, good job!";
    
    addMessage(feedback, "ai");
    speakText(feedback);
  }

  // Speak text using the Web Speech API
  function speakText(text, onEndCallback) {
    debugLog("Speaking text:", text);
    
    if (!window.speechSynthesis) {
      debugLog("Speech synthesis not supported");
      if (onEndCallback) onEndCallback();
      return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice (optional)
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => voice.lang === 'en-US' && !voice.localService);
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    // Set properties
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Set callbacks
    utterance.onstart = function() {
      debugLog("Speech started");
      interviewState.isSpeaking = true;
      updateVoiceVisualization(true);
    };
    
    utterance.onend = function() {
      debugLog("Speech ended");
      interviewState.isSpeaking = false;
      updateVoiceVisualization(false);
      if (onEndCallback) onEndCallback();
    };
    
    utterance.onerror = function(event) {
      debugLog("Speech error:", event);
      interviewState.isSpeaking = false;
      updateVoiceVisualization(false);
      if (onEndCallback) onEndCallback();
    };
    
    // Speak
    window.speechSynthesis.speak(utterance);
  }

  // Update the voice visualization based on speaking state
  function updateVoiceVisualization(isActive) {
    const soundWaveBars = document.querySelectorAll('.sound-wave-bar');
    soundWaveBars.forEach(bar => {
      bar.style.animationPlayState = isActive ? 'running' : 'paused';
    });
  }

  // Start speech recognition
  function startSpeechRecognition() {
    debugLog("Starting speech recognition");
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      debugLog("Speech recognition not supported");
      addMessage("Speech recognition is not supported in your browser. Please try Chrome, Edge, or Safari.", "ai");
      return;
    }
    
    // Request microphone access
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        interviewState.mediaStream = stream;
        
        // Create recognition object
        interviewState.recognition = new SpeechRecognition();
        interviewState.recognition.continuous = true;
        interviewState.recognition.interimResults = true;
        interviewState.recognition.lang = "en-US";
        
        // Set up event handlers
        interviewState.recognition.onstart = function() {
          debugLog("Recognition started");
          addMessage("I'm listening to your solution...", "ai");
        };
        
        interviewState.recognition.onresult = function(event) {
          let interimTranscript = '';
          let finalTranscript = '';
          
          // Process results
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
            interviewState.transcript += " " + finalTranscript;
            addMessage(finalTranscript, "user");
          }
          
          debugLog("Interim transcript:", interimTranscript);
          debugLog("Final transcript:", finalTranscript);
        };
        
        interviewState.recognition.onerror = function(event) {
          debugLog("Recognition error:", event);
          
          if (event.error === 'not-allowed') {
            addMessage("Microphone access was denied. Please allow microphone access and try again.", "ai");
          }
        };
        
        interviewState.recognition.onend = function() {
          debugLog("Recognition ended");
          
          // Restart if still recording
          if (interviewState.isRecording && interviewState.stage === 'coding') {
            debugLog("Restarting recognition");
            interviewState.recognition.start();
          }
        };
        
        // Start recognition
        interviewState.recognition.start();
      })
      .catch(error => {
        debugLog("Microphone error:", error);
        addMessage("Microphone access was denied. Please allow microphone access and try again.", "ai");
      });
  }

  // Stop speech recognition
  function stopSpeechRecognition() {
    debugLog("Stopping speech recognition");
    
    if (interviewState.recognition) {
      try {
        interviewState.recognition.stop();
      } catch (error) {
        debugLog("Error stopping recognition:", error);
      }
      interviewState.recognition = null;
    }
    
    if (interviewState.mediaStream) {
      interviewState.mediaStream.getTracks().forEach(track => track.stop());
      interviewState.mediaStream = null;
    }
  }

  // Add a message to the state and UI
  function addMessage(text, sender) {
    // Add to state
    interviewState.messages.push({ text, sender });
    
    // Add to UI
    addMessageToUI(text, sender);
  }

  // Add a message to the UI
  function addMessageToUI(text, sender) {
    const contentArea = document.getElementById('interview-content');
    if (!contentArea) return;
    
    const messageElement = document.createElement('div');
    messageElement.style.padding = '0.75rem';
    messageElement.style.borderRadius = '0.5rem';
    messageElement.style.backgroundColor = sender === 'ai' ? 'rgba(102, 26, 230, 0.1)' : 'rgba(72, 187, 120, 0.1)';
    messageElement.style.marginBottom = '0.75rem';
    
    const textElement = document.createElement('p');
    textElement.style.margin = '0';
    textElement.style.fontSize = '0.875rem';
    textElement.style.color = '#E5E7EB';
    textElement.textContent = text;
    
    messageElement.appendChild(textElement);
    contentArea.appendChild(messageElement);
    
    // Scroll to bottom
    contentArea.scrollTop = contentArea.scrollHeight;
  }

  // Update the interview UI based on state
  function updateInterviewUI() {
    // Update sound wave animation
    updateVoiceVisualization(interviewState.isSpeaking);
    
    // Update button
    const button = document.getElementById('toggle-interview-btn');
    if (button) {
      if (interviewState.isRecording) {
        button.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
          End Interview
        `;
        button.style.backgroundColor = '#F87272'; // DaisyUI error color
      } else {
        button.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
          Start Interview
        `;
        button.style.backgroundColor = '#661AE6'; // DaisyUI primary color
      }
    }
  }

  // Let the popup know the content script is ready
  function notifyPopupOfReadiness() {
    debugLog("Notifying popup that content script is ready");
    chrome.runtime.sendMessage({ action: 'CONTENT_SCRIPT_READY' }, (response) => {
      if (chrome.runtime.lastError) {
        // This is normal if the popup isn't open
        debugLog("No popup listening: " + chrome.runtime.lastError.message);
      } else if (response) {
        debugLog("Popup acknowledged: " + JSON.stringify(response));
      }
    });
  }

  // Listen for messages from the popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    debugLog("Received message: " + JSON.stringify(message));
    
    if (message.action === 'PING_CONTENT_SCRIPT') {
      // Respond to ping to let popup know we're here
      debugLog("Responding to ping from popup");
      sendResponse({ status: 'CONTENT_SCRIPT_ACTIVE' });
      return true;
    } else if (message.action === 'START_INTERVIEW') {
      if (!interviewState.isRecording) {
        startInterview();
      }
      sendResponse({ success: true });
      return true;
    } else if (message.action === 'END_INTERVIEW') {
      if (interviewState.isRecording) {
        endInterview();
      }
      sendResponse({ success: true });
      return true;
    }
  });

  // Initialize when the page loads
  function initialize() {
    debugLog("Initializing content script");
    
    // Check if we're on LeetCode
    if (window.location.href.includes('leetcode.com/problems/')) {
      debugLog("On LeetCode problem page, adding floating icon");
      // Add the floating icon
      addFloatingIcon();
      
      // Notify popup that we're ready
      notifyPopupOfReadiness();
    } else {
      debugLog("Not on LeetCode problem page, skipping initialization");
    }
  }

  // Run initialization
  debugLog("Content script loaded");
  initialize();

  // Also initialize when the page is fully loaded
  window.addEventListener('load', () => {
    debugLog("Window loaded event");
    // Add the floating icon after a short delay to ensure the page is fully loaded
    setTimeout(() => {
      initialize();
      // Periodically notify popup of readiness
      setInterval(notifyPopupOfReadiness, 5000);
    }, 1000);
  });
})();