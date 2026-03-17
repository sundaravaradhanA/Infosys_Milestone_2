import React, { useEffect, useState } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  Loader2, 
  Camera,
  Check,
  Shield,
  Bell,
  Lock
} from "lucide-react";

function Profile() {
  const [user, setUser] = useState({
    email: "",
    phone: "",
    address: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:8000/1", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch("http://localhost:8000/1", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(user)
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="card-gradient p-6 text-white">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl font-display font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center shadow-lg hover:bg-brand-600 transition-colors">
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold">{user.name || 'User'}</h2>
            <p className="text-brand-100 text-sm">{user.email || 'user@email.com'}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                Member since 2024
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
                <User className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-dark-800">Personal Information</h3>
                <p className="text-sm text-dark-500">Update your personal details</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={user.name || ''}
                    onChange={handleChange}
                    className="input-with-icon"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={user.email || ''}
                    onChange={handleChange}
                    className="input-with-icon"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input
                    type="text"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={user.phone || ''}
                    onChange={handleChange}
                    className="input-with-icon"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 w-5 h-5 text-dark-400" />
                  <textarea
                    name="address"
                    placeholder="Enter your address"
                    value={user.address || ''}
                    onChange={handleChange}
                    rows={3}
                    className="input-with-icon pt-4"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full btn-primary flex items-center justify-center gap-2 mt-4"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : saveSuccess ? (
                  <>
                    <Check className="w-5 h-5" />
                    Saved Successfully!
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Status */}
          <div className="card p-6">
            <h3 className="text-lg font-display font-bold text-dark-800 mb-4">Account Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-success-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-success-600" />
                  </div>
                  <div>
                    <p className="font-medium text-dark-800">KYC Status</p>
                    <p className="text-sm text-success-600">Verified</p>
                  </div>
                </div>
                <Check className="w-5 h-5 text-success-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-dark-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-dark-200 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-dark-600" />
                  </div>
                  <div>
                    <p className="font-medium text-dark-800">Notifications</p>
                    <p className="text-sm text-dark-500">Enabled</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-dark-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-dark-200 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-dark-600" />
                  </div>
                  <div>
                    <p className="font-medium text-dark-800">2FA Security</p>
                    <p className="text-sm text-dark-500">Disabled</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="text-lg font-display font-bold text-dark-800 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'Change Password', icon: Lock },
                { label: 'Download Statement', icon: User },
                { label: 'Manage Alerts', icon: Bell },
              ].map((action, index) => (
                <button
                  key={index}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-dark-50 transition-colors text-left"
                >
                  <action.icon className="w-5 h-5 text-dark-500" />
                  <span className="text-dark-700 font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;

