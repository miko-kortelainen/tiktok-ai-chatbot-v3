import { useState } from "react";

function UsernameInput(props: {
  handleStart: (username: string) => void;
  handleDisconnect: () => void;
  isConnected: boolean;
}) {
  const [username, setUsername] = useState("");

  return (
    <div>
      <div className="header-container"></div>
      <form onSubmit={() => props.handleStart(username)}>
        <div className="input-container" id="chat">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="off"
            className="input"
            type="text"
            placeholder="@tiktok_username"
            id="username"
            required
          />

          {props.isConnected ? (
            <button className="button stop" onClick={props.handleDisconnect}>
              Stop
            </button>
          ) : (
            <button className="button start" onClick={() => props.handleStart(username)}>
              Start
            </button>
          )}
          <a href="/moderation" target="_blank" rel="noopener noreferrer" className="cog-icon" title="Moderation">
            ⚙️
          </a>
        </div>
      </form>
    </div>
  );
}

export default UsernameInput;
