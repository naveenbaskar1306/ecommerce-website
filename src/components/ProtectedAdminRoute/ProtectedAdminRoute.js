import { Navigate } from "react-router-dom";

export default function ProtectedAdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // If not logged in → open login popup
  if (!token || !user) {
    window.dispatchEvent(
      new CustomEvent("openLogin", { detail: { goto: "/dashboard" } })
    );
    return <Navigate to="/" />;
  }

  // If not admin → deny access
  if (user.role !== "admin") {
    return (
      <div style={{ padding: 40 }}>
        <h2>Access Denied</h2>
        <p>You must be an admin to view this page.</p>
      </div>
    );
  }

  return children;
}
