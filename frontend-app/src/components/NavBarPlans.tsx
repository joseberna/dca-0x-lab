"use client";
import { useRouter } from "next/router";
import { Button } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ListIcon from "@mui/icons-material/List";

export default function NavbarPlans() {
  const router = useRouter();

  return (
    <nav className="flex justify-between items-center bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
      <h1
        className="font-bold text-lg text-gray-800 cursor-pointer"
        onClick={() => router.push("/")}
      >
        💸 PoC DCA Dashboard
      </h1>

      <div className="flex gap-3">
        <Button
          variant="outlined"
          startIcon={<HomeIcon />}
          onClick={() => router.push("/")}
          sx={{
            borderColor: "#ddd",
            color: "#333",
            textTransform: "none",
            "&:hover": { borderColor: "#999" },
          }}
        >
          Inicio
        </Button>

        
      </div>
    </nav>
  );
}
