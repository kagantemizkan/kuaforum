import { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import CreateEmployeeModal from "./components/CreateEmployeeModal";
import { getUserProfile } from "./lib/userService";
import "./App.css";

function App() {
  const { user, session, loading, signIn, signUp, signOut } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateEmployeeModalOpen, setIsCreateEmployeeModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Fetch user profile from users table when user is authenticated
  useEffect(() => {
    if (user?.id) {
      getUserProfile(user.id).then(({ data, error }) => {
        if (error) {
          console.error("Error fetching user profile:", error);
        } else {
          setUserProfile(data);
        }
      });
    }
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const { error } = await signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) {
          setError(error.message);
        } else {
          setError("Check your email for the confirmation link!");
        }
      } else {
        const { error } = await signIn({ email, password });
        if (error) {
          setError(error.message);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="app">
        <div className="welcome">
          <h1>Welcome to KuaForum!</h1>
          <div className="user-info">
            <h2>User Information</h2>
            <div className="info-item">
              <strong>Email:</strong> {user.email}
            </div>
            <div className="info-item">
              <strong>User ID:</strong> {user.id}
            </div>
            <div className="info-item">
              <strong>Created At:</strong> {new Date(user.created_at).toLocaleString()}
            </div>
            <div className="info-item">
              <strong>Last Sign In:</strong> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "N/A"}
            </div>
            <div className="info-item">
              <strong>Email Confirmed:</strong> {user.email_confirmed_at ? "Yes" : "No"}
            </div>
            {userProfile?.full_name && (
              <div className="info-item">
                <strong>Full Name (from users table):</strong> {userProfile.full_name}
              </div>
            )}
            {userProfile?.role && (
              <div className="info-item">
                <strong>Role (from users table):</strong> {userProfile.role}
              </div>
            )}
            <div className="info-item">
              <strong>Session Expires At:</strong> {session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : "N/A"}
            </div>
            <div className="info-item">
              <strong>Access Token (JWT):</strong>
              <div className="token-display">
                {session?.access_token ? (
                  <div>
                    <div className="token-preview">{session.access_token.substring(0, 50)}...</div>
                    <details>
                      <summary>Show Full Token</summary>
                      <pre className="metadata-json">{session.access_token}</pre>
                    </details>
                  </div>
                ) : (
                  "No token available"
                )}
              </div>
            </div>
            <div className="info-item">
              <strong>Refresh Token:</strong>
              <div className="token-display">
                {session?.refresh_token ? (
                  <div>
                    <div className="token-preview">{session.refresh_token.substring(0, 50)}...</div>
                    <details>
                      <summary>Show Full Token</summary>
                      <pre className="metadata-json">{session.refresh_token}</pre>
                    </details>
                  </div>
                ) : (
                  "No refresh token available"
                )}
              </div>
            </div>
            <div className="info-item">
              <strong>Token Type:</strong> {session?.token_type || "N/A"}
            </div>
            <div className="info-item">
              <strong>Provider:</strong> {session?.user?.app_metadata?.provider || "email"}
            </div>
            <div className="info-item">
              <strong>Provider ID:</strong> {session?.user?.app_metadata?.providers?.[0] || "N/A"}
            </div>
            {user.user_metadata && Object.keys(user.user_metadata).length > 0 && (
              <div className="info-item">
                <strong>User Metadata:</strong>
                <pre className="metadata-json">{JSON.stringify(user.user_metadata, null, 2)}</pre>
              </div>
            )}
            <div className="info-item">
              <strong>App Metadata:</strong>
              <pre className="metadata-json">{JSON.stringify(user.app_metadata, null, 2)}</pre>
            </div>
            <div className="info-item">
              <strong>Raw Session Object:</strong>
              <pre className="metadata-json">{JSON.stringify(session, null, 2)}</pre>
            </div>
            <div className="info-item">
              <strong>User Profile (from users table):</strong>
              <pre className="metadata-json">{JSON.stringify(userProfile, null, 2)}</pre>
            </div>
            <div className="info-item">
              <strong>Raw User Object:</strong>
              <pre className="metadata-json">{JSON.stringify(user, null, 2)}</pre>
            </div>
          </div>
          <div className="welcome-actions">
            <button
              onClick={() => {
                console.log("Opening modal, current state:", isCreateEmployeeModalOpen);
                setIsCreateEmployeeModalOpen(true);
              }}
              className="create-employee-btn"
            >
              Create Employee
            </button>
            <button onClick={handleSignOut} className="sign-out-btn">
              Sign Out
            </button>
          </div>
        </div>
        <CreateEmployeeModal isOpen={isCreateEmployeeModalOpen} onClose={() => setIsCreateEmployeeModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="app">
      <div className="auth-container">
        <h1>Kuaforum</h1>
        <h2>{isSignUp ? "Sign Up" : "Sign In"}</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignUp && (
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={isSignUp}
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          {error && <div className="error">{error}</div>}

          <button type="submit" disabled={isSubmitting} className="submit-btn">
            {isSubmitting ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setEmail("");
                setPassword("");
                setFullName("");
              }}
              className="switch-btn"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
