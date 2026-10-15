import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const { devLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function sendOtp() {
    setError(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setBusy(false);
    if (error) setError(error.message);
    else setOtpSent(true);
  }

  async function verifyOtp() {
    setError(null);
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
    setBusy(false);
    if (error) setError(error.message);
  }

  async function handleDevLogin() {
    setError(null);
    setBusy(true);
    try {
      await devLogin(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Dev login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-screen">
      <h1>GymBro — Owner Login</h1>
      <p>Sign in with your email to manage your gym.</p>

      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={otpSent}
        />
      </label>

      {!otpSent ? (
        <button className="btn-primary" onClick={sendOtp} disabled={busy || !email}>
          Send OTP
        </button>
      ) : (
        <>
          <label>
            OTP code
            <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" />
          </label>
          <button className="btn-primary" onClick={verifyOtp} disabled={busy || !otp}>
            Verify & Continue
          </button>
        </>
      )}

      {error && <p className="error">{error}</p>}

      <hr />
      <p className="hint">Dev only — skips real OTP delivery entirely.</p>
      <button onClick={handleDevLogin} disabled={busy || !email}>
        Continue without OTP (dev)
      </button>
    </div>
  );
}
