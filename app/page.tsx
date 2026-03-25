import React from "react";

const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <a
        href="http://localhost:3000/auth/login"
        className="text-3xl text-blue-500 hover:underline"
      >
        Giriş Yap
      </a>
    </div>
  );
};

export default Home;
