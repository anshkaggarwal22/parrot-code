import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Popup() {
  const [isInterviewing, setIsInterviewing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 min countdown

  // Countdown Timer Effect
  useEffect(() => {
    if (isInterviewing && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            return 0; // Stop at 0
          }
          return prevTime - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isInterviewing, timeLeft]);

  // Function to start interview
  const startInterview = () => {
    setIsInterviewing(true);
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="w-96 h-80 p-6 bg-base-100 shadow-xl rounded-xl flex flex-col items-center space-y-6">
      {/* AI Profile Image */}
      <div className="avatar">
        <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
          <img src="/ai-avatar.png" alt="AI Interviewer" />
        </div>
      </div>

      {/* Timer */}
      <div className="text-3xl font-bold text-primary">{formatTime(timeLeft)}</div>

      {/* Start Interview Button */}
      <button
        className={`btn btn-primary w-full ${isInterviewing ? "btn-disabled" : ""}`}
        onClick={startInterview}
      >
        {isInterviewing ? "Interview in Progress..." : "Start Interview"}
      </button>

      {/* Voice Wave Animation */}
      {isInterviewing && (
        <div className="flex space-x-1">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-6 bg-primary rounded-full"
              animate={{
                height: [6, 20, 6],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.8,
                delay: i * 0.1,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
