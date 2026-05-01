import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../BaseURL";
import ProfileHeader from "./ProfileHeader";
import ProfileForm from "./ProfileForm";
import SecurityForm from "./SecurityForm";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/auth");
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
      } else {
        throw new Error("Invalid user data format");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleProfileUpdate = (updatedData) => {
    setUserData(updatedData);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <ProfileHeader userData={userData} />

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="border-b border-gray-100">
            <div className="flex">
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "profile"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "security"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Security
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "profile" && (
              <ProfileForm userData={userData} onUpdate={handleProfileUpdate} />
            )}
            {activeTab === "security" && <SecurityForm />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
