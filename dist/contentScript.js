(function() {
    if (window.hasRun) return;
    window.hasRun = true;

    let recognition = null;
    let transcript = "";
    // let speechObj = null;
    // const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    function createInterviewPanel() {
        const shadowHost = document.createElement('div');
        shadowHost.id = "ai-interviewer-shadow-host";
        document.body.appendChild(shadowHost);

        const shadowRoot = shadowHost.attachShadow({mode:'open'});
        const panel = document.createElement('div');
        panel.innerHTML = `
            <style>
                #interview-panel {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 300px;
                    height: 400px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0px 4px 10px rgba(0,0,0,0.2);
                    padding: 10px;
                    font-family: Arial, sans-serif;
                }
                button {
                    background: #007AFF;
                    color: white;
                    padding: 5px 10px;
                    border: none;
                    cursor: pointer;
                }
            </style>
            <div id="interview-panel">
                <h3>AI Interviewer</h3>
                <p id="status">Press Start to Begin</p>
                <button id="start-btn">Start</button>
                <button id="end-btn" style="display:none;">End</button>
                <p id="transcription"></p>
            </div>
        `;
        shadowRoot.appendChild(panel);

        const startBtn = shadowRoot.querySelector("#start-btn");
        const endBtn = shadowRoot.querySelector("#end-btn");
        const statusText = shadowRoot.querySelector("#status");
        const transcriptText = shadowRoot.querySelector("#transcription");

        startBtn.addEventListener("click", () => startInterview(statusText, endBtn, startBtn, transcriptText));
        endBtn.addEventListener("click", () => endInterview(statusText, endBtn, startBtn));
        // startBtn.addEventListener("click", () => startInterview());
        // endBtn.addEventListener("click", () => endInterview());
    }

    // function startInterview() {
    //     // startBtn.innerText = "Recording";
    //     speechObj = new SpeechRecognition();
    //     speechObj.start();
    //     speechObj.onresult = transcribe;
    // }
    // function transcribe(e) {
    //     console.log(e);
    // }
    // function endInterview() {
    //     speechObj.stop();
    //     speechObj = null;
    //     // startBtn.innerText = "Start";
    // }
    function startInterview(statusText, endBtn, startBtn, transcriptText) {
        console.log("Start button clicked! Starting recognition...");
        navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {
            this._userMediaInputStream = stream;         
        }).catch(error => console.error("Microphone error:", error));


        statusText.innerText = "Recording...";
        startBtn.style.display = "none";
        endBtn.style.display = "inline";

        startSpeechRecognition(transcriptText);
    }

    function endInterview(statusText, endBtn, startBtn) {
        console.log("End button clicked! Stopping recognition...");
        console.log("Elements:", { statusText, endBtn, startBtn });
        this._userMediaInputStream.getAudioTracks().forEach(track => {
            track.stop();
        });

        statusText.innerText = "Processing...";
        endBtn.style.display = "none";
        startBtn.style.display = "inline";

        stopSpeechRecognition();
    }

    function startSpeechRecognition(transcriptText) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        // recognition.continuous = true;
        // recognition.interimResults = false;
        // recognition.lang = "en-US";

        // recognition.onstart = () => console.log("Speech recognition started.");
        // recognition.onerror = (event) => console.error("Speech recognition error:", event);
        
        // recognition.onresult = (event) => {
        //     transcript += event.results[event.results.length - 1][0].transcript + " ";
        //     transcriptText.innerText = transcript;
        // };
        recognition.start();
        recognition.onresult = transcribe;
        
    }
    function transcribe(e) {
        console.log(e);
    }

    function stopSpeechRecognition() {
        if (recognition) {
            recognition.stop();
            recognition = null;
            console.log("Final transcript:", transcript);
            chrome.runtime.sendMessage({ action: "processTranscript", transcript });
        }
    }


    createInterviewPanel();
})();