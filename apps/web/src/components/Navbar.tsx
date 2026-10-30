import React from "react";
import { Sparkles, Users, Wifi, WifiOff } from "lucide-react";

interface NavbarProps {
  connectionStatus: "connected" | "connecting" | "offline";
  activeUsers: number;
  onOpenAIModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  connectionStatus,
  activeUsers,
  onOpenAIModal,
}) => {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <a className="brand" href="/">
          TaskFlow<span> AI</span>
        </a>
        <span className="badge">REAL-TIME BOARD</span>
      </div>

      <div className="navbar-right">
        <div className={`status-pill status-${connectionStatus}`}>
          {connectionStatus === "connected" ? (
            <>
              <span className="status-dot green"></span>
              <Wifi size={14} />
              <span>Live Sync</span>
            </>
          ) : connectionStatus === "connecting" ? (
            <>
              <span className="status-dot yellow"></span>
              <span>Reconnecting...</span>
            </>
          ) : (
            <>
              <WifiOff size={14} />
              <span>Offline Mode</span>
            </>
          )}
        </div>

        <div className="active-users-pill" title="Collaborators active on this board">
          <Users size={14} />
          <span>{activeUsers} online</span>
        </div>

        <button className="btn-ai-trigger" onClick={onOpenAIModal}>
          <Sparkles size={16} />
          <span>AI Task Breakdown</span>
        </button>
      </div>
    </header>
  );
};

