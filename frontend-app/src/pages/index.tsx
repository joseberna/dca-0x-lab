"use client";
import Navbar from "../components/Navbar";
import DCAForm from "../components/DCAForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="p-8 flex flex-col items-center">
        <div className="max-w-3xl text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-2">
            🪙 PoC DCA Frontend
          </h2>
          <p className="text-gray-500">
            Configura tu plan DCA en{" "}
            <span className="font-medium text-indigo-600">Polygon</span> y deja
            que las compras se ejecuten automáticamente cada período.
          </p>
        </div>

        <DCAForm />
      </main>
    </div>
  );
}
