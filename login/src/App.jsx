import { BrowserRouter, Routes, Route } from "react-router-dom";
import VerifyOtp from "./pages/Login";
import AppContextProvider from "./context/AppContext";
import Home from "./pages/Home";

function App() {
  return (
    <AppContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<VerifyOtp />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </AppContextProvider>
  );
}

export default App;
