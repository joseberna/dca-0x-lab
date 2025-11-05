import { useEffect } from "react";
import { io } from "socket.io-client";

export const useSocket = () => {
    useEffect(() => {
        const socket = io("http://localhost:4000");

        socket.on("connect", () => console.log("✅ Connected to DCA backend"));
        socket.on("wallet:created", (data: any) => console.log("🆕 Wallet created:", data));
        socket.on("dca:executed", (data: any) => console.log("💸 DCA executed:", data));

        return () => {
            socket.disconnect();
        };
    }, []);
};
