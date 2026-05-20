import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../BaseURL";
import { Copy, Download, Eye, EyeOff, RefreshCw, ShieldCheck, ShieldOff } from "lucide-react";

const SecurityForm = () => {
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [twoFactorStatus, setTwoFactorStatus] = useState(null);
  const [setupData, setSetupData] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [isTwoFactorLoading, setIsTwoFactorLoading] = useState(false);

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  });

  const loadTwoFactorStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/2fa/status`, {
        headers: authHeaders(),
      });
      if (!response.ok) return;
      const data = await response.json();
      setTwoFactorStatus(data.data);
    } catch (error) {
      console.error("Error loading 2FA status:", error);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("userRole") === "professor") {
      loadTwoFactorStatus();
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.current_password || !formData.new_password || !formData.confirm_password) {
      toast.error("All fields are required");
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      toast.error("New passwords do not match");
      return;
    }

    if (formData.new_password.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${API_BASE_URL}/users/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: formData.current_password,
          new_password: formData.new_password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to change password");
      }

      toast.success("Password changed successfully!");
      setFormData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  const beginTwoFactorSetup = async () => {
    setIsTwoFactorLoading(true);
    setBackupCodes([]);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/2fa/setup`, {
        method: "POST",
        headers: authHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.message || "Failed to start 2FA setup");
      setSetupData(data.data);
      toast.success("Scan the QR code to continue");
    } catch (error) {
      toast.error(error.message || "Failed to start 2FA setup");
    } finally {
      setIsTwoFactorLoading(false);
    }
  };

  const enableTwoFactor = async () => {
    if (twoFactorCode.replace(/\D/g, "").length !== 6) {
      toast.error("Enter the 6-digit authenticator code");
      return;
    }
    setIsTwoFactorLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/2fa/enable`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ code: twoFactorCode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.message || "Invalid verification code");
      setBackupCodes(data.data?.backup_codes || []);
      setSetupData(null);
      setTwoFactorCode("");
      await loadTwoFactorStatus();
      toast.success("Two-factor authentication enabled");
    } catch (error) {
      toast.error(error.message || "Failed to enable 2FA");
    } finally {
      setIsTwoFactorLoading(false);
    }
  };

  const disableTwoFactor = async () => {
    if (!twoFactorCode) {
      toast.error("Enter an authenticator or backup code");
      return;
    }
    setIsTwoFactorLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/2fa/disable`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ code: twoFactorCode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.message || "Failed to disable 2FA");
      setBackupCodes([]);
      setTwoFactorCode("");
      await loadTwoFactorStatus();
      toast.success("Two-factor authentication disabled");
    } catch (error) {
      toast.error(error.message || "Failed to disable 2FA");
    } finally {
      setIsTwoFactorLoading(false);
    }
  };

  const regenerateBackupCodes = async () => {
    if (twoFactorCode.replace(/\D/g, "").length !== 6) {
      toast.error("Enter a fresh 6-digit authenticator code");
      return;
    }
    setIsTwoFactorLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/2fa/backup-codes/regenerate`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ code: twoFactorCode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.message || "Failed to regenerate backup codes");
      setBackupCodes(data.data?.backup_codes || []);
      setTwoFactorCode("");
      await loadTwoFactorStatus();
      toast.success("Backup codes regenerated");
    } catch (error) {
      toast.error(error.message || "Failed to regenerate backup codes");
    } finally {
      setIsTwoFactorLoading(false);
    }
  };

  const copyBackupCodes = async () => {
    await navigator.clipboard.writeText(backupCodes.join("\n"));
    toast.success("Backup codes copied");
  };

  const downloadBackupCodes = () => {
    const blob = new Blob([backupCodes.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "smartpapercheck-backup-codes.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {localStorage.getItem("userRole") === "professor" && (
        <section className="border border-gray-200 rounded-lg p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                {twoFactorStatus?.is_enabled ? (
                  <ShieldCheck className="h-5 w-5 text-accent" />
                ) : (
                  <ShieldOff className="h-5 w-5 text-gray-500" />
                )}
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Two-factor authentication</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {twoFactorStatus?.is_enabled
                    ? `Enabled. ${twoFactorStatus.backup_codes_remaining} backup codes remaining.`
                    : "Add Google Authenticator or another TOTP app to protect professor access."}
                </p>
              </div>
            </div>
            {!twoFactorStatus?.is_enabled && !setupData && (
              <button
                type="button"
                onClick={beginTwoFactorSetup}
                disabled={isTwoFactorLoading}
                className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium disabled:opacity-60"
              >
                Enable 2FA
              </button>
            )}
          </div>

          {setupData && (
            <div className="grid md:grid-cols-[220px_1fr] gap-5 items-start">
              <div className="rounded-lg border border-gray-200 bg-white p-3 flex items-center justify-center">
                {setupData.qr_code_url ? (
                  <img src={setupData.qr_code_url} alt="Authenticator QR code" className="h-48 w-48" />
                ) : (
                  <div className="h-48 w-48 flex items-center justify-center text-center text-xs text-gray-500">
                    QR generation requires the backend qrcode package. Use the manual key below.
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Open Google Authenticator or a compatible app.</li>
                  <li>Scan the QR code or enter the manual setup key.</li>
                  <li>Enter the 6-digit code to finish setup.</li>
                </ol>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Manual setup key</label>
                  <div className="flex gap-2">
                    <code className="flex-1 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-xs break-all">
                      {setupData.secret}
                    </code>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(setupData.secret)}
                      className="px-3 rounded-lg border border-gray-200 text-gray-600 hover:text-accent"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent tracking-widest text-center"
                    placeholder="000000"
                    inputMode="numeric"
                  />
                  <button
                    type="button"
                    onClick={enableTwoFactor}
                    disabled={isTwoFactorLoading}
                    className="px-5 py-2 bg-accent text-white rounded-lg font-medium disabled:opacity-60"
                  >
                    Verify
                  </button>
                </div>
              </div>
            </div>
          )}

          {twoFactorStatus?.is_enabled && (
            <div className="space-y-3">
              <input
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.toUpperCase().slice(0, 20))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Authenticator code or backup code"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={regenerateBackupCodes}
                  disabled={isTwoFactorLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:text-accent disabled:opacity-60"
                >
                  <RefreshCw size={16} />
                  Regenerate backup codes
                </button>
                <button
                  type="button"
                  onClick={disableTwoFactor}
                  disabled={isTwoFactorLoading}
                  className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium disabled:opacity-60"
                >
                  Disable 2FA
                </button>
              </div>
            </div>
          )}

          {backupCodes.length > 0 && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 space-y-3">
              <div className="grid sm:grid-cols-2 gap-2">
                {backupCodes.map((code) => (
                  <code key={code} className="px-3 py-2 rounded bg-white border border-green-100 text-sm text-gray-800">
                    {code}
                  </code>
                ))}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={copyBackupCodes} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-green-200 text-sm">
                  <Copy size={16} />
                  Copy
                </button>
                <button type="button" onClick={downloadBackupCodes} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-green-200 text-sm">
                  <Download size={16} />
                  Download
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Password
        </label>
        <div className="relative">
          <input
            type={showPasswords.current ? "text" : "password"}
            name="current_password"
            value={formData.current_password}
            onChange={handleChange}
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
            placeholder="Enter current password"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility("current")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          New Password
        </label>
        <div className="relative">
          <input
            type={showPasswords.new ? "text" : "password"}
            name="new_password"
            value={formData.new_password}
            onChange={handleChange}
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
            placeholder="Enter new password"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility("new")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Password must be at least 8 characters long
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Confirm New Password
        </label>
        <div className="relative">
          <input
            type={showPasswords.confirm ? "text" : "password"}
            name="confirm_password"
            value={formData.confirm_password}
            onChange={handleChange}
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
            placeholder="Confirm new password"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility("confirm")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Changing..." : "Change Password"}
        </button>
      </div>
      </form>
    </div>
  );
};

export default SecurityForm;
