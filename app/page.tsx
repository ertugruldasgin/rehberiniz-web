import { Link } from "lucide-react";
import React from "react";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-4xl font-bold">Rehberiniz</h1>
      <p className="text-lg text-gray-600">
        Öğrencilerinizin geleceği verilerle şekilleniyor!
      </p>
      <a
        href="/auth/login"
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        <Link size={20} />
        Giriş Yap
      </a>
    </div>
  );
};

export default Home;
