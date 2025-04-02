import { Routes, Route } from "react-router-dom";
import NotFound from "./page/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/" element={<NotFound />} /> 
    </Routes>
  );
}

export default App;
