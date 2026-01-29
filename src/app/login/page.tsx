
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
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
                <p>Pouze soukromý přístup</p>
            </div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "300px" }}>
                <div style={{ position: "relative" }}>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Zadejte heslo"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            padding: "0.8rem",
                            paddingRight: "2.5rem",
                            borderRadius: "4px",
                            border: "1px solid #333",
                            backgroundColor: "#2d2d2d",
                            color: "white",
                            fontSize: "1rem",
                            width: "100%",
                            boxSizing: "border-box"
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            position: "absolute",
                            right: "0.5rem",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "none",
                            border: "none",
                            color: "#888",
                            cursor: "pointer",
                            fontSize: "1.2rem",
                            padding: "0.2rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        {showPassword ? "👁️" : "🙈"}
                    </button>
                </div>
                {error && <p style={{ color: "#ff6b6b", margin: 0 }}>Nesprávné heslo</p>}
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
                    Vstoupit
                </button>
            </form>
        </div>
    );
}
