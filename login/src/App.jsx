import { BrowserRouter, Routes, Route } from "react-router-dom";
import VerifyOtp from "./pages/Login";
import AppContextProvider from "./context/AppContext";
import Home from "./pages/Home";
import { ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <AppContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<VerifyOtp />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </BrowserRouter>
         <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
        transition={Bounce}
      />
    </AppContextProvider>
  );
}

export default App;
