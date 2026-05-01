import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import PropTypes from "prop-types";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../BaseURL";
import ProfileHeader from "./ProfileHeader";
import ProfileForm from "./ProfileForm";
import SecurityForm from "./SecurityForm";

const ProfileModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const data = await response.json();
      if (data && data.data) {
        setUserData(data.data);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchUserProfile();
      setActiveTab("profile"); // Reset to profile tab when opening
    }
  }, [isOpen, fetchUserProfile]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleProfileUpdate = (updatedData) => {
    setUserData(updatedData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Content */}
        <div className="overflow-y-auto max-h-[90vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
          ) : (
            <div className="p-6">
              {/* Header with Close Button */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close profile"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <ProfileHeader userData={userData} />

              {/* Tabs */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
                <div className="border-b border-gray-100">
                  <div className="flex">
                    <button
                      onClick={() => setActiveTab("profile")}
                      className={`px-6 py-3 font-medium transition-colors relative ${
                        activeTab === "profile"
                          ? "text-accent"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Profile
                      {activeTab === "profile" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab("security")}
                      className={`px-6 py-3 font-medium transition-colors relative ${
                        activeTab === "security"
                          ? "text-accent"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Security
                      {activeTab === "security" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {activeTab === "profile" && (
                    <ProfileForm
                      userData={userData}
                      onUpdate={handleProfileUpdate}
                    />
                  )}
                  {activeTab === "security" && <SecurityForm />}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ProfileModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ProfileModal;
