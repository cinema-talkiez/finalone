import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function IndexPage() {
  const [userId, setUserId] = useState(null);
  const [tokenVerified, setTokenVerified] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours
    let uid = localStorage.getItem("userId");
    let createdAt = localStorage.getItem("createdAt");

    if (uid && createdAt && Date.now() - parseInt(createdAt) > MAX_AGE) {
      localStorage.clear();
      uid = null;
    }

    if (!uid) {
      uid = generateUUID();
      localStorage.setItem("userId", uid);
      localStorage.setItem("createdAt", Date.now().toString());
    }

    setUserId(uid);

    // Fetch token status from backend
    fetch(`/api/check/${uid}`)
      .then(res => res.json())
      .then(data => {
        console.log("Token Check:", data);
        setTokenVerified(data.tokenVerified);

        const storedValidToken = localStorage.getItem("validToken") === "true";
        const validTokenExp = localStorage.getItem("validTokenExpiration");

        if (storedValidToken && validTokenExp && Date.now() < parseInt(validTokenExp)) {
          setValidToken(true);
        } else {
          setValidToken(false);
        }

        setLoading(false);
      })
      .catch(err => {
        console.error("Error:", err);
        setLoading(false);
      });
  }, []);

  const generateUUID = () =>
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });

  if (loading) return <p className="loading-text">Checking token status...</p>;

  return (
    <div className="glassmorphism-page">
      <div className="container5">
        <h1>Welcome to BlackHole</h1>
        <p>
          BlackHole is specially designed for middle-class movie lovers. This is an affordable entertainment with a vast collection of movies without the financial burden.
        </p>

        {tokenVerified && validToken ? (
          <button onClick={() => router.push("/index1")} className="visitButton">
            Visit HomePage
          </button>
        ) : tokenVerified ? (
          <div>
            <p>Token verification almost completed, click here...</p>
            <button onClick={() => router.push("/verification-success")} className="verifyButton">
              Set Token
            </button>
          </div>
        ) : (
          <div>
            <p style={{ color: 'yellow', fontSize: '15px' }}>
              ⚠️ Token not verified. Please verify first.
            </p>
            <button onClick={() => router.push("/Verifypage.html")} className="verifyButton">
              Go to Verify Page
            </button>
          </div>
        )}

        <style jsx>{`
          .container5 {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            text-align: center;
            padding: 20px;
          }
          .loading-text {
            font-size: 18px;
            color: white;
          }
          button {
            padding: 12px 24px;
            font-size: 18px;
            border: none;
            cursor: pointer;
            border-radius: 8px;
            transition: 0.3s;
            margin: 10px;
            width: 200px;
          }
          .verifyButton {
            background-color: #ff5722;
            color: white;
          }
          .visitButton {
            background-color: #4caf50;
            color: white;
          }
          .visitButton:hover {
            background-color: #388e3c;
          }
        `}</style>
      </div>
    </div>
  );
}
