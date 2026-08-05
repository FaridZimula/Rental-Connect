import React, { useState } from 'react';

const BrokerSettings: React.FC = () => {
  const [profile, setProfile] = useState({
    name: 'Broker Name',
    email: 'broker@email.com',
  });
  const [notifications, setNotifications] = useState({
    bookings: true,
    reports: true,
    moderation: false,
  });
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-5xl">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Broker Account Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
            <div className="mb-6">
              <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-4xl font-bold text-primary-600 shadow">
                {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-4">Profile Information</h3>
            <div className="w-full space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={profile.email}
                  onChange={e => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
            </div>
          </div>
          {/* Notification Preferences & Security */}
          <div className="flex flex-col gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-semibold mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-700">Booking Notifications</span>
                  <span className="relative">
                    <input
                      type="checkbox"
                      checked={notifications.bookings}
                      onChange={e => setNotifications({ ...notifications, bookings: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-500 transition-colors"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform"></div>
                  </span>
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-700">Report Notifications</span>
                  <span className="relative">
                    <input
                      type="checkbox"
                      checked={notifications.reports}
                      onChange={e => setNotifications({ ...notifications, reports: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-500 transition-colors"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform"></div>
                  </span>
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-700">Moderation Alerts</span>
                  <span className="relative">
                    <input
                      type="checkbox"
                      checked={notifications.moderation}
                      onChange={e => setNotifications({ ...notifications, moderation: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-500 transition-colors"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform"></div>
                  </span>
                </label>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-semibold mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Password</label>
                  <input
                    type="password"
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                </div>
                <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold mt-2">Update Password</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrokerSettings; 