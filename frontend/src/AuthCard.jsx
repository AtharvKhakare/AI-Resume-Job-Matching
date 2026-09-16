import { useState } from "react";
import "./AuthCard.css";

function AuthCard({ onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState("login");

  // Login fields
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Sign Up fields
  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setMessage("");
  };

  // LOGIN
  const handleLogin = async (event) => {
    event.preventDefault();

    if (!loginUsername || !loginPassword) {
      setMessage("Please enter username and password.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "https://ai-resume-job-matching.onrender.com/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: loginUsername,
            password: loginPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Login successful!");

        // Keep username for your navbar
        if (onLoginSuccess) {
          onLoginSuccess(data.username);
        }

        setLoginUsername("");
        setLoginPassword("");
      } else {
        setMessage(data.message || "Invalid username or password.");
      }
    } catch (error) {
      setMessage("Cannot connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  // SIGN UP
  const handleSignup = async (event) => {
    event.preventDefault();

    if (!fullName || !signupEmail || !signupPassword || !confirmPassword) {
      setMessage("Please fill all fields.");
      return;
    }

    if (signupPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "https://ai-resume-job-matching.onrender.com/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: signupEmail,
            password: signupPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Account created successfully!");

        setFullName("");
        setSignupEmail("");
        setSignupPassword("");
        setConfirmPassword("");

        // Automatically move to login
        setTimeout(() => {
          setActiveTab("login");
          setMessage("");
          setLoginUsername(signupEmail);
        }, 1200);
      } else {
        setMessage(data.message || "Registration failed.");
      }
    } catch (error) {
      setMessage("Cannot connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">

      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">🤖</div>
          <div>
            <h2>ResumeAI</h2>
            <span>AI Career Assistant</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={activeTab === "login" ? "auth-tab active" : "auth-tab"}
            onClick={() => switchTab("login")}
          >
            Sign In
          </button>

          <button
            className={activeTab === "signup" ? "auth-tab active" : "auth-tab"}
            onClick={() => switchTab("signup")}
          >
            Sign Up
          </button>
        </div>

        {/* LOGIN */}
        {activeTab === "login" && (
          <form className="auth-form" onSubmit={handleLogin}>

            <div className="auth-heading">
              <h1>Welcome Back</h1>
              <p>Sign in to continue to your ResumeAI account.</p>
            </div>

            <div className="input-group">
              <label>Username or Email</label>

              <div className="input-wrapper">
                <span className="input-icon">👤</span>

                <input
                  type="text"
                  placeholder="Enter username or email"
                  value={loginUsername}
                  onChange={(event) =>
                    setLoginUsername(event.target.value)
                  }
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>

              <div className="input-wrapper">
                <span className="input-icon">🔒</span>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(event) =>
                    setLoginPassword(event.target.value)
                  }
                />
              </div>
            </div>

            <div className="login-options">

              <label className="remember-option">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(event.target.checked)
                  }
                />

                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="forgot-button"
                onClick={() =>
                  setMessage("Password recovery will be added soon.")
                }
              >
                Forgot password?
              </button>

            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

          </form>
        )}

        {/* SIGN UP */}
        {activeTab === "signup" && (
          <form className="auth-form" onSubmit={handleSignup}>

            <div className="auth-heading">
              <h1>Create Account</h1>
              <p>Join ResumeAI and start your career journey.</p>
            </div>

            <div className="input-group">
              <label>Full Name</label>

              <div className="input-wrapper">
                <span className="input-icon">👤</span>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(event.target.value)
                  }
                />
              </div>
            </div>

            <div className="input-group">
              <label>Email Address</label>

              <div className="input-wrapper">
                <span className="input-icon">✉️</span>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={signupEmail}
                  onChange={(event) =>
                    setSignupEmail(event.target.value)
                  }
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>

              <div className="input-wrapper">
                <span className="input-icon">🔒</span>

                <input
                  type="password"
                  placeholder="Create a password"
                  value={signupPassword}
                  onChange={(event) =>
                    setSignupPassword(event.target.value)
                  }
                />
              </div>
            </div>

            <div className="input-group">
              <label>Confirm Password</label>

              <div className="input-wrapper">
                <span className="input-icon">🔐</span>

                <input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

          </form>
        )}

        {/* MESSAGE */}
        {message && (
          <div className="auth-message">
            {message}
          </div>
        )}

        <div className="auth-footer">
          <span>Secure &nbsp;•&nbsp; Simple &nbsp;•&nbsp; AI Powered</span>
        </div>

      </div>
    </div>
  );
}

export default AuthCard;