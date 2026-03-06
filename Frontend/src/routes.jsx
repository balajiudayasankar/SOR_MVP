import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../src/contexts/auth/AuthContext";
import ProtectedRoute from "../src/components/guards/ProtectedRoute";
import PublicRoute from "../src/components/guards/PublicRoute";
import DashboardLayout from "../src/layouts/DashboardLayout";

// ===== AUTH PAGES =====
import Login from "../src/pages/auth/common/Login";
import VerifyCode from "../src/pages/auth/common/VerifyCode";
import ChangePassword from "../src/pages/auth/common/ChangePassword";
import ResetPassword from "../src/pages/auth/common/ResetPassword";
import VerifyResetOtp from "../src/pages/auth/common/VerifyResetOtp";
import VerifyFirstLogin from "../src/pages/auth/common/VerifyFirstLogin";
import EmployeeProfile from "../src/pages/auth/common/EmployeeProfile";

// ===== ADMIN PAGES =====
import AdminDashboard from "../src/pages/dashboards/AdminDashboard";
import DepartmentList from "../src/pages/auth/admin/departments/DepartmentList";
import RoleList from "../src/pages/auth/admin/roles/RoleList";
import UserList from "../src/pages/auth/admin/users/UserList";
import ChangeRequestManagement from "../src/pages/auth/admin/ChangeRequestManagement";

// ===== DASHBOARDS =====
import LeadershipDashboard from "../src/pages/dashboards/LeadershipDashboard";
import DepartmentHeadDashboard from "../src/pages/dashboards/DepartmentHeadDashboard";
import ManagerDashboard from "../src/pages/dashboards/ManagerDashboard";
import EmployeeDashboard from "../src/pages/dashboards/EmployeeDashboard";
import HRDashboard from "../src/pages/dashboards/HRDashboard";

// ===== PROJECT MANAGEMENT =====
import ProjectManagementDashboard from "../src/pages/project_management/ProjectManagementDashboard";
import CreateProject from "../src/pages/project_management/CreateProject";
import ProjectDetails from "../src/pages/project_management/ProjectDetails";
import ProjectList from "../src/pages/project_management/ProjectList";
import ResourcePoolMapping from "../src/pages/project_management/ResourcePoolMapping";

// ===== SOR — DASHBOARD =====
import SORDashboard from "../src/pages/sor/dashboard/SORDashboard";

// ===== SOR — CANDIDATES =====
import CandidateList from "../src/pages/sor/candidates/CandidateList";
import CandidateDetail from "../src/pages/sor/candidates/CandidateDetail";

// ===== SOR — OFFERS =====
import OfferList from "../src/pages/sor/offers/OfferList";
import CreateOffer from "../src/pages/sor/offers/CreateOffer";
import OfferDetail from "../src/pages/sor/offers/OfferDetail";
import OfferDetailsForm from "../src/pages/sor/offers/OfferDetailsForm";
import OfferPreview from "../src/pages/sor/offers/OfferPreview";
import OfferVersions from "../src/pages/sor/offers/OfferVersions";

// ===== SOR — APPROVALS =====
import MyPendingApprovals from "../src/pages/sor/approvals/MyPendingApprovals";
import ApprovalAction from "../src/pages/sor/approvals/ApprovalAction";
import WorkflowStatus from "../src/pages/sor/approvals/WorkflowStatus";

// ===== SOR — APPROVAL CHAINS =====
import ApprovalChainList from "../src/pages/sor/approval_chains/ApprovalChainList";
import ApprovalChainForm from "../src/pages/sor/approval_chains/ApprovalChainForm";

// ===== SOR — TEMPLATES =====
import OfferTemplateList from "../src/pages/sor/templates/OfferTemplateList";

// ===== SOR — AUDIT =====
import AuditLog from "../src/pages/sor/audit/AuditLog";
import OfferAuditLog from "../src/pages/sor/audit/OfferAuditLog";

// ===== SOR — NOTIFICATIONS =====
import NotificationList from "../src/pages/sor/notifications/NotificationList";

// ─── Role Constants ───────────────────────────────────────────────────────────
const SOR_HR_ROLES       = ["HR", "Admin"];
const SOR_ALL_ROLES      = ["HR", "Admin", "Manager"];
const SOR_APPROVER_ROLES = ["Hiring Manager", "Finance", "HRHead"];
const SOR_FULL_ACCESS    = [...SOR_ALL_ROLES, ...SOR_APPROVER_ROLES];

const AppRoutes = () => {
  const { user } = useAuth();
  console.log('[AppRoutes] user.role =', user?.role);
  return (
    <Routes>

      {/* === FALLBACK === */}
      <Route
        path="/"
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
      />
      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
      />

      {/* === PUBLIC AUTH ROUTES === */}
      <Route
        path="/login"
        element={<PublicRoute><Login /></PublicRoute>}
      />
      <Route
        path="/verify-code"
        element={<PublicRoute><VerifyCode /></PublicRoute>}
      />
      <Route
        path="/reset-password"
        element={<PublicRoute><ResetPassword /></PublicRoute>}
      />
      <Route
        path="/verify-reset-otp"
        element={<PublicRoute><VerifyResetOtp /></PublicRoute>}
      />
      <Route
        path="/verify-first-login"
        element={<PublicRoute><VerifyFirstLogin /></PublicRoute>}
      />
      <Route path="/change-password" element={<ChangePassword />} />

      {/* === PROTECTED DASHBOARDS === */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              {user?.role === "Admin"           && <AdminDashboard />}
              {user?.role === "Leadership"      && <LeadershipDashboard />}
              {user?.role === "Department Head" && <DepartmentHeadDashboard />}
              {user?.role === "Manager"         && <ManagerDashboard />}
              {user?.role === "Employee"        && <EmployeeDashboard />}
              {user?.role === "HR"              && <HRDashboard />}
              {/* Approver roles land on their pending approvals as home */}
              {user?.role === "Hiring Manager"   && <MyPendingApprovals />}
              {user?.role === "Finance"         && <MyPendingApprovals />}
              {user?.role === "HRHead"          && <MyPendingApprovals />}
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* === ADMIN ROUTES === */}
      <Route
        path="/admin/departments"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <DashboardLayout role="Admin">
              <DepartmentList />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/roles"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <DashboardLayout role="Admin">
              <RoleList />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <DashboardLayout role="Admin">
              <UserList />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/change-requests"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <DashboardLayout role="Admin">
              <ChangeRequestManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* === HR ROUTES === */}
      <Route
        path="/hr/dashboard"
        element={
          <ProtectedRoute allowedRoles={["HR"]}>
            <DashboardLayout role="HR">
              <HRDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/dashboard/projectmgmt"
        element={
          <ProtectedRoute allowedRoles={["HR"]}>
            <DashboardLayout role="HR">
              <ProjectManagementDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/dashboard/projectmgmt/create"
        element={
          <ProtectedRoute allowedRoles={["HR"]}>
            <DashboardLayout role="HR">
              <CreateProject />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/dashboard/projectmgmt/list"
        element={
          <ProtectedRoute allowedRoles={["HR"]}>
            <DashboardLayout role="HR">
              <ProjectList />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/dashboard/projectmgmt/view/:projectId"
        element={
          <ProtectedRoute allowedRoles={["HR"]}>
            <DashboardLayout role="HR">
              <ProjectDetails />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/dashboard/projectmgmt/resourcepool"
        element={
          <ProtectedRoute allowedRoles={["HR"]}>
            <DashboardLayout role="HR">
              <ResourcePoolMapping />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* === PROFILE (Shared) === */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <DashboardLayout role={user?.role}>
              <EmployeeProfile />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* ============================================================ */}
      {/* === SOR — SMART OFFER RELEASE ROUTES                      === */}
      {/* ============================================================ */}

      {/* SOR Dashboard */}
      <Route
        path="/sor/dashboard"
        element={
          <ProtectedRoute allowedRoles={SOR_FULL_ACCESS}>
            <DashboardLayout role={user?.role}>
              <SORDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* SOR Candidates — HR only */}
      <Route
        path="/sor/candidates"
        element={
          <ProtectedRoute allowedRoles={SOR_HR_ROLES}>
            <DashboardLayout role={user?.role}>
              <CandidateList />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sor/candidates/new"
        element={<Navigate to="/sor/candidates" replace />}
      />
      <Route
        path="/sor/candidates/:id"
        element={
          <ProtectedRoute allowedRoles={SOR_HR_ROLES}>
            <DashboardLayout role={user?.role}>
              <CandidateDetail />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* SOR Offers — HR creates/edits, approvers can view */}
      <Route
        path="/sor/offers"
        element={
          <ProtectedRoute allowedRoles={SOR_FULL_ACCESS}>
            <DashboardLayout role={user?.role}>
              <OfferList />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sor/offers/new"
        element={
          <ProtectedRoute allowedRoles={SOR_HR_ROLES}>
            <DashboardLayout role={user?.role}>
              <CreateOffer />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sor/offers/:id"
        element={
          <ProtectedRoute allowedRoles={SOR_FULL_ACCESS}>
            <DashboardLayout role={user?.role}>
              <OfferDetail />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sor/offers/:id/edit"
        element={
          <ProtectedRoute allowedRoles={SOR_HR_ROLES}>
            <DashboardLayout role={user?.role}>
              <OfferDetailsForm />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sor/offers/:id/preview"
        element={
          <ProtectedRoute allowedRoles={SOR_FULL_ACCESS}>
            <DashboardLayout role={user?.role}>
              <OfferPreview />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sor/offers/:id/versions"
        element={
          <ProtectedRoute allowedRoles={SOR_FULL_ACCESS}>
            <DashboardLayout role={user?.role}>
              <OfferVersions />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* SOR Approvals — all approver roles */}
      <Route
        path="/sor/approvals"
        element={
          <ProtectedRoute allowedRoles={SOR_FULL_ACCESS}>
            <DashboardLayout role={user?.role}>
              <MyPendingApprovals />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sor/approvals/workflow"
        element={
          <ProtectedRoute allowedRoles={[...SOR_HR_ROLES, "HRHead"]}>
            <DashboardLayout role={user?.role}>
              <WorkflowStatus />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sor/approvals/:offerId"
        element={
          <ProtectedRoute allowedRoles={SOR_FULL_ACCESS}>
            <DashboardLayout role={user?.role}>
              <ApprovalAction />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* SOR Approval Chains — HR + HRHead */}
      <Route
        path="/sor/approval-chains"
        element={
          <ProtectedRoute allowedRoles={[...SOR_HR_ROLES, "HRHead"]}>
            <DashboardLayout role={user?.role}>
              <ApprovalChainList />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sor/approval-chains/new"
        element={
          <ProtectedRoute allowedRoles={SOR_HR_ROLES}>
            <DashboardLayout role={user?.role}>
              <ApprovalChainForm />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sor/approval-chains/:id/edit"
        element={
          <ProtectedRoute allowedRoles={SOR_HR_ROLES}>
            <DashboardLayout role={user?.role}>
              <ApprovalChainForm />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* SOR Templates — HR only */}
      <Route
        path="/sor/templates"
        element={
          <ProtectedRoute allowedRoles={SOR_HR_ROLES}>
            <DashboardLayout role={user?.role}>
              <OfferTemplateList />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* SOR Audit — HR + HRHead */}
      <Route
        path="/sor/audit"
        element={
          <ProtectedRoute allowedRoles={[...SOR_HR_ROLES, "HRHead"]}>
            <DashboardLayout role={user?.role}>
              <AuditLog />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sor/audit/offer/:offerId"
        element={
          <ProtectedRoute allowedRoles={SOR_FULL_ACCESS}>
            <DashboardLayout role={user?.role}>
              <OfferAuditLog />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* SOR Notifications */}
      <Route
        path="/sor/notifications"
        element={
          <ProtectedRoute allowedRoles={SOR_FULL_ACCESS}>
            <DashboardLayout role={user?.role}>
              <NotificationList />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

    </Routes>
  );
};

export default AppRoutes;
