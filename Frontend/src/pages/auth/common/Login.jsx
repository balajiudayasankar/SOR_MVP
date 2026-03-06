import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/auth/AuthContext";
import authService from "../../../services/auth/authService";
import { toast } from "sonner";
import logodarkfull from "../../../assets/Sorlogo.png";
import "../../../styles/auth/Auth.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({ email: false, password: false });

  const navigate = useNavigate();
  const { login } = useAuth();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    if (name === "email") {
      if (!value.trim()) newErrors.email = "Email is required";
      else if (value.trim().length > 100)
        newErrors.email = "Email must not exceed 100 characters";
      else if (!validateEmail(value.trim()))
        newErrors.email = "Please enter a valid email address";
      else delete newErrors.email;
    }
    if (name === "password") {
      if (!value) newErrors.password = "Password is required";
      else if (value !== value.trim())
        newErrors.password = "Password cannot have leading or trailing spaces";
      else if (value.length < 6)
        newErrors.password = "Password must be at least 6 characters";
      else if (value.length > 50)
        newErrors.password = "Password must not exceed 50 characters";
      else delete newErrors.password;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (formData.email.trim().length > 100)
      newErrors.email = "Email must not exceed 100 characters";
    else if (!validateEmail(formData.email.trim()))
      newErrors.email = "Please enter a valid email address";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password !== formData.password.trim())
      newErrors.password = "Password cannot have leading or trailing spaces";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    else if (formData.password.length > 50)
      newErrors.password = "Password must not exceed 50 characters";
    setErrors(newErrors);
    setTouched({ email: true, password: true });
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (error) setError("");
    if (touched[name]) validateField(name, newValue);
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  const handlePasswordPaste = (e) => {
    e.preventDefault();
    toast.warning("Password pasting is disabled for security");
  };
  const handlePasswordCopy = (e) => {
    e.preventDefault();
    toast.warning("Password copying is disabled for security");
  };
  const handlePasswordCut = (e) => {
    e.preventDefault();
    toast.warning("Password cutting is disabled for security");
  };

  const getDashboardRoute = (roleName) => {
    const normalizedRole = roleName?.toUpperCase().replace(/\s+/g, "");
    const routes = {
      ADMIN: "/admin/dashboard",
      HR: "/hr/dashboard",
      DEPARTMENTHEAD: "/department-head/dashboard",
      LEADERSHIP: "/leadership/dashboard",
      MANAGER: "/manager/dashboard",
      EMPLOYEE: "/employee/dashboard",
    };
    return routes[normalizedRole] || "/employee/dashboard";
  };

  const handleSubmit = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setError("");
    if (!validateForm()) {
      toast.error("Enter Valid Details!");
      return false;
    }
    toast.loading("Signing in...");
    performLogin();
    return false;
  };

  const performLogin = async () => {
    setLoading(true);
    try {
      const response = await authService.login(
        formData.email,
        formData.password,
      );
      if (!response.success || !response.data) {
        const msg =
          response.message ||
          "Unable to sign in. Please check your credentials and try again.";
        setError(msg);
        toast.dismiss();
        toast.error(msg);
        setLoading(false);
        return;
      }
      const data = response.data;
      if (data.requiresTwoFactor) {
        toast.dismiss();
        toast.info("Two-factor authentication required");
        localStorage.setItem(
          "tempUser",
          JSON.stringify({ email: formData.email }),
        );
        navigate("/verify-code", { replace: false });
        return;
      }
      if (data.requiresPasswordReset) {
        toast.dismiss();
        toast.info("Password reset required for first login");
        localStorage.setItem(
          "tempUser",
          JSON.stringify({
            email: formData.email,
            isFirstLogin: true,
            requiresPasswordReset: true,
          }),
        );
        navigate("/verify-first-login", {
          state: { email: formData.email, isFirstLogin: true },
          replace: false,
        });
        return;
      }
      const user = data.user;
      if (!user) {
        const msg =
          "An unexpected error occurred. Please try again or contact support.";
        setError(msg);
        toast.dismiss();
        toast.error(msg);
        setLoading(false);
        return;
      }
      const tokenClaims = authService.getClaims();
      const userData = {
        userId: user.userId,
        email: user.email,
        name:
          user.fullName ||
          user.name ||
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          user.email?.split("@")[0] ||
          "User",
        fullName: user.fullName,
        firstName: user.firstName,
        lastName: user.lastName,
        empId: user.empId || user.employeeId || user.employeeCompanyId,
        empMasterId: tokenClaims?.empMasterId,
        role: user.roleName || user.role,
        roleName: user.roleName,
        departmentId: user.departmentId,
        departmentName: user.departmentName,
      };
      login(userData, data.accessToken);
      toast.dismiss();
      toast.success(`Welcome back, ${userData.name}!`);
      navigate(getDashboardRoute(user.roleName), { replace: true });
    } catch (err) {
      let msg = "Unable to sign in. Please try again.";
      if (err.response) {
        const { status, data } = err.response;
        if (status === 400)
          msg = data?.message || "Invalid request. Please check your input.";
        else if (status === 401)
          msg = data?.message || "Invalid email or password.";
        else if (status === 403)
          msg =
            data?.message ||
            "Your account has been locked or disabled. Please contact support.";
        else if (status === 429)
          msg = "Too many login attempts. Please wait a few minutes.";
        else if (status >= 500)
          msg = "Our servers are experiencing issues. Please try again later.";
        else msg = data?.message || `Error: ${status}`;
      } else if (err.message === "Network Error") {
        msg =
          "Unable to connect to the server. Please check your internet connection.";
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
      toast.dismiss();
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    /* ── PAGE WRAPPER ── */
    <div
      className="sor-page"
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
        position: "relative",
        overflow: "hidden",
        fontFamily:
          "ui-sans-serif, system-ui, Segoe UI, Roboto, Arial, sans-serif",
        boxSizing: "border-box",
      }}
    >
      {/* Decorative blobs */}
      <span className="sor-blob sor-blob--tl" aria-hidden="true" />
      <span className="sor-blob sor-blob--br" aria-hidden="true" />

      {/* ── CARD ── */}
      <div
        className="sor-card"
        style={{
          display: "flex",
          flexDirection: "row",
          width: "900px",
          maxWidth: "95vw",
          minHeight: "540px",
          borderRadius: "16px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
          overflow: "hidden",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* ══════════════ LEFT PANEL ══════════════ */}
        <div
          className="sor-left"
          style={{
            flex: "0 0 42%",
            width: "42%",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 36px",
            boxSizing: "border-box",
          }}
        >
          <div className="sor-left-inner">
            {/* Header */}
            <p className="sor-welcome-label">WELCOME TO</p>
            <h2 className="sor-heading">Streamlined Offer Release</h2>
            <p className="sor-subtext">
              Log in to get real-time updates on offers that interest you.
            </p>

            {/* Global error */}
            {error && (
              <div className="sor-global-error">
                <i
                  className="bi bi-exclamation-circle"
                  style={{ marginRight: 8 }}
                />
                {error}
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              noValidate
              autoComplete="off"
              style={{ width: "100%" }}
            >
              {/* Email */}
              <div className="sor-field">
                <div
                  className={`sor-input-pill ${errors.email && touched.email ? "invalid" : ""} ${touched.email && !errors.email && formData.email ? "valid" : ""}`}
                >
                  <i className="bi bi-person sor-pill-icon" />
                  <input
                    type="email"
                    className="sor-input"
                    name="email"
                    id="email"
                    placeholder="Username"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="username"
                    disabled={loading}
                    maxLength={100}
                  />
                </div>
                {errors.email && touched.email && (
                  <p className="sor-err-msg">
                    <i
                      className="bi bi-info-circle"
                      style={{ marginRight: 4 }}
                    />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="sor-field">
                <div
                  className={`sor-input-pill ${errors.password && touched.password ? "invalid" : ""}`}
                >
                  <i className="bi bi-lock sor-pill-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="sor-input"
                    name="password"
                    id="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onPaste={handlePasswordPaste}
                    onCopy={handlePasswordCopy}
                    onCut={handlePasswordCut}
                    autoComplete="new-password"
                    disabled={loading}
                    maxLength={50}
                  />
                  <button
                    type="button"
                    className="sor-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    <i
                      className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                    />
                  </button>
                </div>
                {errors.password && touched.password && (
                  <p className="sor-err-msg">
                    <i
                      className="bi bi-info-circle"
                      style={{ marginRight: 4 }}
                    />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Forgot password */}
              <div style={{ textAlign: "right", marginBottom: "20px" }}>
                <a
                  href="/reset-password"
                  className="sor-forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/reset-password");
                  }}
                >
                  Forgot Password?
                </a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="sor-btn-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      style={{ marginRight: 8 }}
                    />
                    Signing in...
                  </>
                ) : (
                  "SIGN IN"
                )}
              </button>
            </form>

            {/* Footer note */}
            <p className="sor-secure-note">
              <i className="bi bi-shield-lock" style={{ marginRight: 6 }} />
              Your credentials are encrypted and secure
            </p>
          </div>
        </div>

        {/* ══════════════ RIGHT PANEL ══════════════ */}
        <div
          className="sor-right"
          style={{
            flex: "0 0 58%",
            width: "58%",
            background: "#0a2540",
            backgroundImage:
              "linear-gradient(135deg, #0a2540 0%, #0d3154 55%, #0f3d3e 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          {/* Dot mesh overlay */}
          <div className="sor-right-mesh" aria-hidden="true" />
          {/* Glow circle */}
          <div className="sor-right-glow" aria-hidden="true" />

          {/* Content */}
          <div className="sor-right-content">
            {/* Secure Access badge */}
            <div className="sor-badge">
              <i className="bi bi-shield-check" style={{ marginRight: 8 }} />
              Secure Access
            </div>
            {/* Logo (circular container) */}
            <div style={{ textAlign: "center", marginBottom: "12px" }}>
              <div
                style={{
                  width: 160, // adjust size
                  height: 160, // same as width for a circle
                  borderRadius: "50%",
                  overflow: "hidden", // clip the image to the circle
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#fff", // optional background
                  boxShadow: "0 6px 20px rgba(0,0,0,0.15)", // optional shadow
                }}
              >
                <img
                  src={logodarkfull}
                  alt="SOR Logo"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover", // cover ensures full circle fill
                  }}
                />
              </div>
              <br></br>
              {/* Title */}
            <h1 className="sor-right-title">
              Streamlined
              <br />
              Offer Release
            </h1>
            <br></br>
            {/* Desc */}
            <p className="sor-right-desc">
              Align your goals, track your offers, and unlock new opportunities
              within your organization.
            </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
