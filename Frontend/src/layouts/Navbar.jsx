import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/auth/AuthContext";
import { toast } from "sonner";
import {
  getUserDisplayName,
  getUserInitials,
  getUserEmail,
} from "../utils/auth/helpers";
import ProfilePhotoUploadModal from "../components/auth/Modal/common/ProfilePhotoUploadModal";
import EmployeeProfileService from "../services/auth/EmployeeProfileService";
import useNotifications from "../hooks/sor/useNotifications";
import "../styles/layout_styles/Navbar.css";




const getNotifIcon = (type) => {
  if (!type) return { icon: "bi-bell-fill", cls: "nbd-ni--blue" };
  const t = type.toLowerCase();
  if (t.includes("approv"))  return { icon: "bi-check-circle-fill",    cls: "nbd-ni--green"  };
  if (t.includes("reject"))  return { icon: "bi-x-circle-fill",        cls: "nbd-ni--red"    };
  if (t.includes("revision"))return { icon: "bi-arrow-repeat",         cls: "nbd-ni--amber"  };
  if (t.includes("expedit")) return { icon: "bi-lightning-charge-fill", cls: "nbd-ni--purple" };
  if (t.includes("sent"))    return { icon: "bi-send-fill",            cls: "nbd-ni--teal"   };
  return { icon: "bi-bell-fill", cls: "nbd-ni--blue" };
};

const timeAgo = (dateStr) => {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days < 7 ? `${days}d ago` : new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};




const Navbar = ({ onSidebarToggle, sidebarOpen }) => {
  const [showProfileMenu,   setShowProfileMenu]   = useState(false);
  const [showAwardDropdown, setShowAwardDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showPhotoModal,    setShowPhotoModal]    = useState(false);
  const [profilePhoto,      setProfilePhoto]      = useState(null);
  const [nominations,       setNominations]       = useState([]);
  const [hasNominations,    setHasNominations]    = useState(false);

  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllRead,
  } = useNotifications();

  const employeeId = user?.empId || null;

  
  useEffect(() => {
    const fetchProfilePhoto = async () => {
      try {
        const response = await EmployeeProfileService.getProfile();
        if (response.success && response.data?.profilePhotoBase64) {
          setProfilePhoto(`data:image/jpeg;base64,${response.data.profilePhotoBase64}`);
        }
      } catch (error) {
        console.error("Error fetching profile photo:", error);
      }
    };
    fetchProfilePhoto();
  }, []);

  
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  
  const handleLogout = () => {
    toast.success("You have been logged out successfully!");
    setTimeout(() => { logout(); }, 500);
  };

  const handleChangePassword = () => {
    localStorage.setItem("tempUser", JSON.stringify(user));
    navigate("/change-password", { state: { user, fromSettings: true } });
    setShowProfileMenu(false);
  };

  const handleProfile = () => {
    navigate("/profile");
    setShowProfileMenu(false);
  };

  const handleNavigateToNominations = (nomination) => {
    navigate("/employee/dashboard/performance/nominations", {
      state: { selectedNomination: nomination },
    });
    setShowAwardDropdown(false);
  };

  const handlePhotoUpdate = (newPhotoUrl) => {
    setProfilePhoto(newPhotoUrl);
  };

  const handleNotifClick = (n) => {
    if (!n.isRead) markAsRead([n.notificationId]);
  };

  const handleNotifBellClick = () => {
    setShowNotifDropdown((prev) => !prev);
    setShowProfileMenu(false);
    setShowAwardDropdown(false);
    if (!showNotifDropdown) fetchNotifications();
  };

  const handleViewAllNotifications = () => {
    navigate("/sor/notifications");
    setShowNotifDropdown(false);
  };

  const formatDate = (date, locale = navigator.language || "en-IN") => {
    return new Intl.DateTimeFormat(locale, {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    }).format(date);
  };

  const today         = new Date();
  const formattedDate = formatDate(today);
  const displayName   = getUserDisplayName(user);
  const initials      = getUserInitials(user);
  const displayEmail  = getUserEmail(user);
  const showDropdown  = nominations.length > 2;

  
  const recentNotifs = notifications.slice(0, 5);

  return (
    <>
      <header className="nbd-navbar">
        <div className="nbd-navbar-container">

          {}
          <div className="nbd-navbar-left">
            <button
              className="nbd-sidebar-toggle-mobile"
              onClick={(e) => { e.stopPropagation(); onSidebarToggle(); }}
              aria-label="Toggle sidebar"
            >
              <i className={`bi ${sidebarOpen ? "bi-x-lg" : "bi-list"}`}></i>
            </button>

            <div className="nbd-welcome-section">
              <div className="nbd-welcome-header">
                <i className="bi bi-person-circle nbd-welcome-icon" />
                <h6 className="nbd-welcome-text">Welcome, {displayName}</h6>
              </div>
              <small className="nbd-welcome-date">{formattedDate}</small>
            </div>
          </div>

          {}
          <div className="nbd-navbar-right">

            {}
            {hasNominations && nominations.length > 0 && (
              <>
                {showDropdown ? (
                  <div className="nbd-award-dropdown">
                    <button
                      className="nbd-award-badge-btn"
                      onClick={() => setShowAwardDropdown(!showAwardDropdown)}
                      aria-label="View Awards"
                    >
                      <i className="bi bi-trophy-fill"></i>
                      <span className="nbd-award-text">Awards</span>
                      <span className="nbd-award-count">{nominations.length}</span>
                      <i className={`bi bi-chevron-${showAwardDropdown ? "up" : "down"} nbd-chevron-icon`}></i>
                    </button>

                    {showAwardDropdown && (
                      <div className="nbd-award-dropdown-menu">
                        <div className="nbd-award-dropdown-header">
                          <i className="bi bi-trophy-fill"></i>
                          <h5>Your Awards</h5>
                        </div>
                        <div className="nbd-award-dropdown-body">
                          {nominations.map((nomination, index) => (
                            <div
                              key={nomination.nominationId || index}
                              className="nbd-award-dropdown-item"
                              onClick={() => handleNavigateToNominations(nomination)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) =>
                                (e.key === "Enter" || e.key === " ") &&
                                handleNavigateToNominations(nomination)
                              }
                            >
                              <div className="nbd-award-item-icon">
                                <i className="bi bi-award-fill"></i>
                              </div>
                              <div className="nbd-award-item-content">
                                <strong className="nbd-award-item-title">Congratulations!</strong>
                                <span className="nbd-award-item-subtitle">{nomination.roleType}</span>
                              </div>
                              <i className="bi bi-chevron-right nbd-award-item-arrow"></i>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  nominations.map((nomination, index) => (
                    <div
                      key={nomination.nominationId || index}
                      className="nbd-congrats-card"
                      onClick={() => handleNavigateToNominations(nomination)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) =>
                        (e.key === "Enter" || e.key === " ") &&
                        handleNavigateToNominations(nomination)
                      }
                      aria-label="View Nominations"
                    >
                      <div className="nbd-congrats-icon">
                        <div className="nbd-star-icon">★</div>
                      </div>
                      <div className="nbd-congrats-content">
                        <div className="nbd-congrats-title">Congratulations!</div>
                        <div className="nbd-congrats-subtitle">{nomination.roleType}</div>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {}
            <div className="nbd-notif-wrapper">
              <button
                className="nbd-notif-btn"
                onClick={handleNotifBellClick}
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
                title="Notifications"
              >
                <i className="bi bi-bell-fill"></i>
                {unreadCount > 0 && (
                  <span className="nbd-notif-badge">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {}
              {showNotifDropdown && (
                <div className="nbd-notif-dropdown">

                  {}
                  <div className="nbd-notif-dropdown__header">
                    <div className="nbd-notif-dropdown__header-left">
                      <i className="bi bi-bell-fill"></i>
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <span className="nbd-notif-count-pill">{unreadCount} new</span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        className="nbd-notif-mark-all"
                        onClick={(e) => { e.stopPropagation(); markAllRead(); }}
                        title="Mark all as read"
                      >
                        <i className="bi bi-check2-all"></i>
                        Mark all read
                      </button>
                    )}
                  </div>

                  {}
                  <div className="nbd-notif-dropdown__body">
                    {notifications.length === 0 ? (
                      <div className="nbd-notif-empty">
                        <i className="bi bi-bell-slash"></i>
                        <p>No notifications yet</p>
                      </div>
                    ) : (
                      recentNotifs.map((n) => {
                        const { icon, cls } = getNotifIcon(n.type);
                        return (
                          <div
                            key={n.notificationId}
                            className={`nbd-notif-item ${!n.isRead ? "nbd-notif-item--unread" : ""}`}
                            onClick={() => handleNotifClick(n)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && handleNotifClick(n)}
                          >
                            {!n.isRead && <div className="nbd-notif-item__bar" />}

                            <div className={`nbd-notif-item__icon ${cls}`}>
                              <i className={`bi ${icon}`}></i>
                            </div>

                            <div className="nbd-notif-item__body">
                              <p className="nbd-notif-item__msg">{n.message}</p>
                              {n.offerNumber && (
                                <span className="nbd-notif-item__ref">
                                  <i className="bi bi-file-earmark-text"></i>
                                  {n.offerNumber}
                                </span>
                              )}
                              <span className="nbd-notif-item__time">
                                <i className="bi bi-clock"></i>
                                {timeAgo(n.createdAt)}
                              </span>
                            </div>

                            <div className="nbd-notif-item__status">
                              {!n.isRead
                                ? <span className="nbd-notif-dot" />
                                : <i className="bi bi-check2 nbd-notif-read-tick"></i>
                              }
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {}
                  <div className="nbd-notif-dropdown__footer">
                    <button
                      className="nbd-notif-view-all"
                      onClick={handleViewAllNotifications}
                    >
                      <i className="bi bi-arrow-right-circle"></i>
                      View All Notifications
                      {notifications.length > 0 && (
                        <span className="nbd-notif-total-pill">{notifications.length}</span>
                      )}
                    </button>
                  </div>

                </div>
              )}
            </div>

            {}
            <div className="nbd-profile-wrapper">
              <button
                className="nbd-profile-avatar"
                onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifDropdown(false); }}
                aria-label="User profile menu"
              >
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="nbd-profile-photo" />
                ) : (
                  <span className="nbd-profile-initials">{initials}</span>
                )}
              </button>

              {showProfileMenu && (
                <div className="nbd-dropdown-menu">
                  <div className="nbd-dropdown-header">
                    <div className="nbd-dropdown-avatar-wrapper">
                      <div className="nbd-dropdown-avatar">
                        {profilePhoto ? (
                          <img src={profilePhoto} alt="Profile" className="nbd-dropdown-photo" />
                        ) : (
                          <span className="nbd-dropdown-initials">{initials}</span>
                        )}
                      </div>
                    </div>
                    <h5 className="nbd-dropdown-name">{displayName}</h5>
                    <p className="nbd-dropdown-email">{displayEmail}</p>
                  </div>

                  <div className="nbd-dropdown-actions">
                    <button onClick={handleProfile} className="nbd-action-btn nbd-action-btn-primary">
                      <i className="bi bi-person"></i>
                      Profile
                    </button>
                    <button onClick={handleChangePassword} className="nbd-action-btn nbd-action-btn-primary">
                      <i className="bi bi-key"></i>
                      Change Password
                    </button>
                    <button onClick={handleLogout} className="nbd-action-btn nbd-action-btn-danger">
                      <i className="bi bi-box-arrow-right"></i>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {}
      {showProfileMenu && (
        <div className="nbd-backdrop" onClick={() => setShowProfileMenu(false)} />
      )}
      {showAwardDropdown && (
        <div className="nbd-backdrop" onClick={() => setShowAwardDropdown(false)} />
      )}
      {showNotifDropdown && (
        <div className="nbd-backdrop" onClick={() => setShowNotifDropdown(false)} />
      )}

      {showPhotoModal && (
        <ProfilePhotoUploadModal
          onClose={() => setShowPhotoModal(false)}
          onPhotoUpdate={handlePhotoUpdate}
        />
      )}
    </>
  );
};

export default Navbar;
