import "../css/Centralized.css";
import ChatContainer from "../LiveComponents/ChatContainer.tsx";
import TikTokLiveConnection from "../LiveComponents/TikTokLiveConnection.tsx";

const MainSite = () => {
  return (
    <div className="body-container">
      <div className="top-container">
        <TikTokLiveConnection />
      </div>
      <ChatContainer />
    </div>
  );
};

export default MainSite;
