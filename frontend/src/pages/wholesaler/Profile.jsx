import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import useAuthStore from '../../store/authStore';
import api, { userAPI, authAPI } from '../../lib/api';
import { User, Mail, Lock, CheckCircle, XCircle, Loader2, Eye, EyeOff, AlertTriangle, MapPin, Bell, X, Shield } from 'lucide-react';

function PasswordCheck({ password }) {
  const checks = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'One uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', valid: /[a-z]/.test(password) },
    { label: 'One number', valid: /[0-9]/.test(password) },
  ];

  return (
    <div className="mt-2 space-y-1">
      {checks.map((check, i) => (
        <div key={i} className="flex items-center text-sm">
          {check.valid ? (
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
          ) : (
            <XCircle className="h-4 w-4 text-gray-300 mr-2" />
          )}
          <span className={check.valid ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
            {check.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Target Markets
  const [preferredStates, setPreferredStates] = useState([]);
  const [marketplaceEmails, setMarketplaceEmails] = useState(true);
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);

  // Sensitive Info Blur Modal
  const [showBlurModal, setShowBlurModal] = useState(false);
  const [blurSettings, setBlurSettings] = useState(() => {
    const saved = localStorage.getItem('sensitiveInfoBlur');
    return saved ? JSON.parse(saved) : {
      firstName: false,
      lastName: false,
      propertyAddress: false,
      propertyAddressPartial: false,
      mailingAddress: false,
      mailingAddressPartial: false,
      phoneNumber: false,
      phoneNumberPartial: false,
      email: false,
      emailPartial: false,
    };
  });

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPreferredStates(user.preferred_states || []);
      setMarketplaceEmails(user.marketplace_emails !== false);
    }
  }, [user]);

  const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const addState = (state) => {
    if (preferredStates.length < 3 && !preferredStates.includes(state)) {
      setPreferredStates([...preferredStates, state]);
    }
    setStateDropdownOpen(false);
  };

  const removeState = (state) => {
    setPreferredStates(preferredStates.filter(s => s !== state));
  };

  const isPasswordValid = (pwd) => {
    return (
      pwd.length >= 8 &&
      /[A-Z]/.test(pwd) &&
      /[a-z]/.test(pwd) &&
      /[0-9]/.test(pwd)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate password if changing
    if (newPassword) {
      if (!isPasswordValid(newPassword)) {
        setError('New password does not meet all requirements');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('New passwords do not match');
        return;
      }
    }

    setLoading(true);

    try {
      const updateData = {};
      
      if (name !== user.name) updateData.name = name;
      if (email !== user.email) updateData.email = email;
      if (newPassword) {
        updateData.currentPassword = currentPassword;
        updateData.newPassword = newPassword;
      }
      
      // Always include marketplace preferences
      updateData.preferredStates = preferredStates;
      updateData.marketplaceEmails = marketplaceEmails;

      if (Object.keys(updateData).length === 0) {
        setError('No changes to save');
        setLoading(false);
        return;
      }

      const response = await userAPI.updateProfile(updateData);
      
      // Track state preference update if states changed
      const statesChanged = JSON.stringify(preferredStates) !== JSON.stringify(user.preferred_states || []);
      if (statesChanged) {
        try {
          await api.post('/analytics/track', { eventType: 'state_preference_update', eventData: { states: preferredStates } });
        } catch (e) { /* ignore */ }
      }
      
      // Update local user state
      setUser({
        ...user,
        name: response.data.user.name,
        email: response.data.user.email,
        email_verified: response.data.user.emailVerified,
        preferred_states: response.data.user.preferredStates || preferredStates,
        marketplace_emails: response.data.user.marketplaceEmails !== false,
      });

      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setSuccess(response.data.emailChanged 
        ? 'Profile updated! Please verify your new email address.'
        : 'Profile updated successfully!'
      );
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to update profile';
      const details = err.response?.data?.details;
      setError(details ? `${errorMsg}: ${details.join(', ')}` : errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setSendingVerification(true);
    try {
      await authAPI.sendVerification();
      setSuccess('Verification email sent! Check your inbox.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send verification email');
    } finally {
      setSendingVerification(false);
    }
  };

  // Save blur settings to localStorage and apply CSS
  const updateBlurSetting = (key, value) => {
    const newSettings = { ...blurSettings, [key]: value };
    // If enabling full blur, disable partial and vice versa
    if (key === 'propertyAddress' && value) newSettings.propertyAddressPartial = false;
    if (key === 'propertyAddressPartial' && value) newSettings.propertyAddress = false;
    if (key === 'mailingAddress' && value) newSettings.mailingAddressPartial = false;
    if (key === 'mailingAddressPartial' && value) newSettings.mailingAddress = false;
    if (key === 'phoneNumber' && value) newSettings.phoneNumberPartial = false;
    if (key === 'phoneNumberPartial' && value) newSettings.phoneNumber = false;
    if (key === 'email' && value) newSettings.emailPartial = false;
    if (key === 'emailPartial' && value) newSettings.email = false;
    
    setBlurSettings(newSettings);
    localStorage.setItem('sensitiveInfoBlur', JSON.stringify(newSettings));
    // Dispatch event so other components can react
    window.dispatchEvent(new CustomEvent('blurSettingsChanged', { detail: newSettings }));
  };

  const resetBlurSettings = () => {
    const defaultSettings = {
      firstName: false,
      lastName: false,
      propertyAddress: false,
      propertyAddressPartial: false,
      mailingAddress: false,
      mailingAddressPartial: false,
      phoneNumber: false,
      phoneNumberPartial: false,
      email: false,
      emailPartial: false,
    };
    setBlurSettings(defaultSettings);
    localStorage.setItem('sensitiveInfoBlur', JSON.stringify(defaultSettings));
    window.dispatchEvent(new CustomEvent('blurSettingsChanged', { detail: defaultSettings }));
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account information
          </p>
        </div>

        {/* Email Verification Warning */}
        {!user?.email_verified && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 dark:text-amber-300">Email Not Verified</h3>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  Please verify your email to upgrade your plan.
                </p>
                <button
                  onClick={handleResendVerification}
                  disabled={sendingVerification}
                  className="mt-3 inline-flex items-center px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition disabled:opacity-50"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {sendingVerification ? 'Sending...' : 'Resend Verification Email'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-purple-600" />
              Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="you@example.com"
                    required
                  />
                  {user?.email_verified && email === user?.email && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-green-600 text-sm">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Verified
                    </span>
                  )}
                </div>
                {email !== user?.email && (
                  <p className="text-amber-600 dark:text-amber-400 text-sm mt-1">
                    Changing your email will require re-verification
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Password Change */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Lock className="h-5 w-5 mr-2 text-purple-600" />
              Change Password
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {showPasswords ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="••••••••"
                />
                {newPassword && <PasswordCheck password={newPassword} />}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="••••••••"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
                )}
              </div>
            </div>
          </div>

          {/* Sensitive Info Blur */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-purple-600" />
              Sensitive Information
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Blur sensitive lead data on screen to protect privacy during screen sharing or presentations.
            </p>
            <button
              type="button"
              onClick={() => setShowBlurModal(true)}
              className="inline-flex items-center px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition text-sm font-medium"
            >
              <Shield className="h-4 w-4 mr-2" />
              Configure Blur Settings
            </button>
            {Object.values(blurSettings).some(v => v) && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Blur protection is active
              </p>
            )}
          </div>

          {/* Target Markets */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-purple-600" />
              Target Markets
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Select up to 3 states where you're actively looking for deals. We'll notify you instantly when hot leads become available in your markets.
            </p>

            <div className="space-y-4">
              {/* Selected States */}
              <div className="flex flex-wrap gap-2">
                {preferredStates.map((state) => (
                  <span
                    key={state}
                    className="inline-flex items-center px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium"
                  >
                    {state}
                    <button
                      type="button"
                      onClick={() => removeState(state)}
                      className="ml-2 hover:text-purple-900 dark:hover:text-purple-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
                
                {preferredStates.length < 3 && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setStateDropdownOpen(!stateDropdownOpen)}
                      className="inline-flex items-center px-3 py-1.5 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-full text-sm hover:border-purple-500 hover:text-purple-600 dark:hover:border-purple-500 dark:hover:text-purple-400 transition"
                    >
                      + Add State
                    </button>
                    
                    {stateDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-48 max-h-60 overflow-y-auto bg-white dark:bg-gray-700 rounded-lg shadow-lg border dark:border-gray-600 z-10">
                        {US_STATES.filter(s => !preferredStates.includes(s)).map((state) => (
                          <button
                            key={state}
                            type="button"
                            onClick={() => addState(state)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                          >
                            {state}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {preferredStates.length === 0 && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  No states selected. Add your target markets to receive lead notifications.
                </p>
              )}

              {/* Email Notifications Toggle */}
              <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Marketplace Notifications</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Get emails when new leads match your markets</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMarketplaceEmails(!marketplaceEmails)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    marketplaceEmails ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      marketplaceEmails ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition shadow-lg disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </form>

        {/* Account Info */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Account Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Plan:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white uppercase">{user?.plan_type}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Role:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white capitalize">{user?.role}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Blur Settings Modal */}
      {showBlurModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Blur Sensitive Information</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Manage which information you want to blur on the screen to avoid people seeing on presentations.
                  </p>
                </div>
                <button
                  onClick={() => setShowBlurModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* First Name */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">First Name</span>
                  <button
                    type="button"
                    onClick={() => updateBlurSetting('firstName', !blurSettings.firstName)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      blurSettings.firstName ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      blurSettings.firstName ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Last Name */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Last Name</span>
                  <button
                    type="button"
                    onClick={() => updateBlurSetting('lastName', !blurSettings.lastName)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      blurSettings.lastName ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      blurSettings.lastName ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Property Address */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Property Address</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Blur address completely</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateBlurSetting('propertyAddress', !blurSettings.propertyAddress)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      blurSettings.propertyAddress ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      blurSettings.propertyAddress ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Property Address Partial */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Property Address Partial</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Blur only State, City and Zipcode</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateBlurSetting('propertyAddressPartial', !blurSettings.propertyAddressPartial)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      blurSettings.propertyAddressPartial ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      blurSettings.propertyAddressPartial ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Mailing Address */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Mailing Address</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Blur address completely</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateBlurSetting('mailingAddress', !blurSettings.mailingAddress)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      blurSettings.mailingAddress ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      blurSettings.mailingAddress ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Mailing Address Partial */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Mailing Address Partial</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Blur only State, City and Zipcode</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateBlurSetting('mailingAddressPartial', !blurSettings.mailingAddressPartial)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      blurSettings.mailingAddressPartial ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      blurSettings.mailingAddressPartial ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Phone Number */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Phone Number</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Blur phone number completely</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateBlurSetting('phoneNumber', !blurSettings.phoneNumber)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      blurSettings.phoneNumber ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      blurSettings.phoneNumber ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Phone Number Partial */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Phone Number Partial</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Show only last 4 digits</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateBlurSetting('phoneNumberPartial', !blurSettings.phoneNumberPartial)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      blurSettings.phoneNumberPartial ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      blurSettings.phoneNumberPartial ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Email */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Email</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Blur email completely</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateBlurSetting('email', !blurSettings.email)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      blurSettings.email ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      blurSettings.email ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Email Partial */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Email Partial</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Show only first 2 or 4 characters</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateBlurSetting('emailPartial', !blurSettings.emailPartial)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      blurSettings.emailPartial ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      blurSettings.emailPartial ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 mt-6 pt-4 border-t dark:border-gray-700">
                <button
                  type="button"
                  onClick={resetBlurSettings}
                  className="flex-1 px-4 py-2 border dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm font-medium"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setShowBlurModal(false)}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium"
                >
                  Done!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
