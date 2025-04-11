import { Routes, Route } from "react-router-dom";
import NotFound from "./page/NotFound";
import GamePage from "./page/GamePage"; // Import the GamePage component

function App() {
  return (
    <Routes>
      <Route path="*" element={<NotFound />} />
      <Route path="/Activity" element={<GamePage />} />  
    </Routes>
  );
}

export default App;
