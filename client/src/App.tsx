import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { SocketProvider } from "./components/hooks/SocketProvider.tsx";
import MainSite from "./components/main/MainSite.tsx";
import ModerationPanel from "./components/moderation/ModerationPanel.tsx";

function App() {
  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/" Component={MainSite} />
          <Route path="/moderation" Component={ModerationPanel} />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;
