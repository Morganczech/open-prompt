
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch("/api/auth", {
            method: "POST",
            body: JSON.stringify({ password }),
            headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
            router.push("/");
        } else {
            setError("Incorrect password");
        }
    };

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            backgroundColor: "#1e1e1e",
            color: "white",
            fontFamily: "sans-serif"
        }}>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <h1>Prompt Builder</h1>
                <p>Private Access Only</p>
            </div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "300px" }}>
                <input
                    type="password"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                        padding: "0.8rem",
                        borderRadius: "4px",
                        border: "1px solid #333",
                        backgroundColor: "#2d2d2d",
                        color: "white",
                        fontSize: "1rem"
                    }}
                />
                {error && <p style={{ color: "#ff6b6b", margin: 0 }}>{error}</p>}
                <button
                    type="submit"
                    style={{
                        padding: "0.8rem",
                        borderRadius: "4px",
                        border: "none",
                        backgroundColor: "#0070f3",
                        color: "white",
                        fontSize: "1rem",
                        cursor: "pointer",
                        fontWeight: "bold"
                    }}
                >
                    Enter
                </button>
            </form>
        </div>
    );
}
