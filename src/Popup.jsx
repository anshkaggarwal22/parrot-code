import React, { useState, useEffect } from 'react';
import './App.css';

const Popup = () => {
  const [isOnLeetCode, setIsOnLeetCode] = useState(false);
  const [contentScriptActive, setContentScriptActive] = useState(false);

  // Check if we're on LeetCode and if content script is active
  useEffect(() => {
    const checkLeetCodeAndContentScript = async () => {
      try {
        // Get the active tab
        const tabs = await new Promise((resolve) => {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            resolve(tabs);
          });
        });
        
        if (tabs && tabs[0] && tabs[0].url && tabs[0].url.includes('leetcode.com/problems/')) {
          setIsOnLeetCode(true);
          
          // Ping the content script to see if it's active
          try {
            const response = await new Promise((resolve, reject) => {
              chrome.tabs.sendMessage(
                tabs[0].id,
                { action: 'PING_CONTENT_SCRIPT' },
                (response) => {
                  if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                  } else {
                    resolve(response);
                  }
                }
              );
            });
            
            if (response && response.status === 'CONTENT_SCRIPT_ACTIVE') {
              setContentScriptActive(true);
            }
          } catch (error) {
            console.log('Content script not ready:', error);
            setContentScriptActive(false);
          }
        }
      } catch (error) {
        console.error('Error checking LeetCode and content script:', error);
      }
    };
    
    checkLeetCodeAndContentScript();
    
    // Listen for messages from content script
    const messageListener = (message, sender, sendResponse) => {
      if (message.action === 'CONTENT_SCRIPT_READY') {
        setContentScriptActive(true);
        sendResponse({ received: true });
        return true;
      }
    };
    
    chrome.runtime.onMessage.addListener(messageListener);
    
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  if (!isOnLeetCode) {
    return (
      <div className="p-4 min-w-[350px]">
        <div className="alert alert-warning">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <span>Please navigate to a LeetCode problem page to use this extension.</span>
        </div>
      </div>
    );
  }

  if (!contentScriptActive) {
    return (
      <div className="p-4 min-w-[350px]">
        <div className="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span>Please refresh the LeetCode page to activate the interview assistant.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 min-w-[350px]">
      <div className="alert alert-success">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <div>
          <h3 className="font-bold">Interview Assistant Active!</h3>
          <div className="text-sm">Click the avatar icon in the bottom-right corner of the LeetCode page to start your interview.</div>
        </div>
      </div>
    </div>
  );
};

export default Popup;
