import React from "react";

function Home() {

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-5">
      <h1 className="text-3xl font-bold">Welcome to Home</h1>

      <button
        onClick={handleLogout}
        className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}

export default Home;
