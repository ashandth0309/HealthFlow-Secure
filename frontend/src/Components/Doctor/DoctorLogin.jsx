import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./doctor.css";

function DoctorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  const saveAuthentication = (data) => {
    if (!data.token || !data.doctor) {
      throw new Error("Invalid authentication response");
    }

    sessionStorage.setItem(
      "doctor",
      JSON.stringify(data.doctor)
    );

    sessionStorage.setItem(
      "doctorToken",
      data.token
    );

    navigate("/DoctorDashboard");
  };

  /*
   * Normal email/password authentication
   */
  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8081/auth/doctor/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Login failed"
        );
      }

      saveAuthentication(data);
    } catch (err) {
      console.error(
        "Doctor login failed:",
        err
      );

      setError(
        err.message ||
          "Unable to login. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Google OpenID Connect callback.
   *
   * Google returns a signed ID token in response.credential.
   * The token is sent to our backend for verification.
   */
  const handleGoogleCredential = async (response) => {
    setError("");
    setGoogleLoading(true);

    try {
      if (!response?.credential) {
        throw new Error(
          "Google did not return a valid credential"
        );
      }

      const backendResponse = await fetch(
        "http://localhost:8081/auth/google",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            credential: response.credential,
          }),
        }
      );

      const data = await backendResponse.json();

      if (!backendResponse.ok) {
        throw new Error(
          data.message ||
            "Google authentication failed"
        );
      }

      saveAuthentication(data);
    } catch (err) {
      console.error(
        "Google sign-in failed:",
        err
      );

      setError(
        err.message ||
          "Unable to sign in with Google"
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  /*
   * Load Google Identity Services.
   */
  useEffect(() => {
    const clientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.error(
        "VITE_GOOGLE_CLIENT_ID is not configured"
      );
      return;
    }

    const initializeGoogle = () => {
      if (
        !window.google ||
        !googleButtonRef.current
      ) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredential,
      });

      googleButtonRef.current.innerHTML = "";

      window.google.accounts.id.renderButton(
        googleButtonRef.current,
        {
          theme: "outline",
          size: "large",
          type: "standard",
          shape: "rectangular",
          text: "continue_with",
          width: 320,
        }
      );
    };

    /*
     * If Google's library is already loaded,
     * initialize immediately.
     */
    if (window.google?.accounts?.id) {
      initializeGoogle();
      return;
    }

    /*
     * Otherwise load Google Identity Services.
     */
    const existingScript =
      document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );

    if (existingScript) {
      existingScript.addEventListener(
        "load",
        initializeGoogle
      );

      return () => {
        existingScript.removeEventListener(
          "load",
          initializeGoogle
        );
      };
    }

    const script =
      document.createElement("script");

    script.src =
      "https://accounts.google.com/gsi/client";

    script.async = true;
    script.defer = true;

    script.onload = initializeGoogle;

    script.onerror = () => {
      setError(
        "Unable to load Google Sign-In"
      );
    };

    document.head.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, []);

  return (
    <div className="telemedicine-login-container">
      <div className="doctor-login-box">
        <div className="login-header">
          <h2>Telemedicine System</h2>

          <h3 className="doctor-login-title">
            Doctor Login
          </h3>
        </div>

        <div className="doctor-login-form-container">
          <form
            className="doctor-login-form"
            onSubmit={handleLogin}
          >
            <div className="form-group">
              <label
                className="form-label"
                htmlFor="email"
              >
                Doctor Email:
              </label>

              <input
                className="form-input"
                type="email"
                id="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter your doctor email"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label
                className="form-label"
                htmlFor="password"
              >
                Password:
              </label>

              <input
                className="form-input"
                type="password"
                id="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              className="doctor-login-btn"
              type="submit"
              disabled={
                loading || googleLoading
              }
            >
              {loading
                ? "Signing in..."
                : "Login to Telemedicine"}
            </button>
          </form>

          {/* Login separator */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              margin: "22px 0",
              gap: "12px",
            }}
          >
            <div
              style={{
                flex: 1,
                height: "1px",
                backgroundColor: "#ddd",
              }}
            />

            <span
              style={{
                color: "#777",
                fontSize: "14px",
              }}
            >
              OR
            </span>

            <div
              style={{
                flex: 1,
                height: "1px",
                backgroundColor: "#ddd",
              }}
            />
          </div>

          {/* Google Identity Services button */}

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              minHeight: "44px",
            }}
          >
            <div ref={googleButtonRef} />
          </div>

          {googleLoading && (
            <p
              style={{
                textAlign: "center",
                marginTop: "10px",
              }}
            >
              Verifying Google account...
            </p>
          )}

          {error && (
            <p
              role="alert"
              style={{
                color: "#d32f2f",
                marginTop: "15px",
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}

          <p className="system-note">
            Access to Telemedicine Consultation System Only
          </p>
        </div>
      </div>
    </div>
  );
}

export default DoctorLogin;
