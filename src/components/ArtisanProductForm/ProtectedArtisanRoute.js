import { Navigate } from "react-router-dom";

export default function ProtectedArtisanRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Not logged in → Open login popup
  if (!token || !user) {
    window.dispatchEvent(
      new CustomEvent("openLogin", { detail: { goto: "/artisan-dashboard" } })
    );
    return <Navigate to="/" />;
  }

  // Logged in but NOT artisan
  if (user.role !== "artisan") {
    return <Navigate to="/" />;
  }

  // Logged in artisan but not approved
  if (user.isApproved === false) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Your artisan account is not approved yet.</h2>
        <p>The admin will approve your profile soon.</p>
      </div>
    );
  }

  // All good → Load the page
  return children;
}
