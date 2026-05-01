import { User } from "lucide-react";
import PropTypes from "prop-types";

const ProfileHeader = ({ userData }) => {
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleDisplay = (role) => {
    if (!role) return "User";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          {userData?.profile_picture ? (
            <img
              src={userData.profile_picture}
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            getInitials(userData?.full_name || userData?.name)
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">
            {userData?.full_name || userData?.name || "User"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {getRoleDisplay(userData?.role)}
          </p>
          <p className="text-sm text-gray-600 mt-1">{userData?.email}</p>
        </div>
      </div>
    </div>
  );
};

ProfileHeader.propTypes = {
  userData: PropTypes.shape({
    name: PropTypes.string,
    full_name: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
    profile_picture: PropTypes.string,
  }),
};

export default ProfileHeader;
