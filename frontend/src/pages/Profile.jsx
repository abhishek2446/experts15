import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../services/api'

const Profile = () => {
  const [user, setUser] = useState(null)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    profile: {
      phone: '',
      institute: '',
      city: '',
      state: '',
      targetExam: 'JEE Main',
      targetYear: '',
      bio: ''
    }
  })
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile')
      setUser(response.data.user)
      setFormData({
        name: response.data.user.name,
        profile: {
          phone: response.data.user.profile?.phone || '',
          institute: response.data.user.profile?.institute || '',
          city: response.data.user.profile?.city || '',
          state: response.data.user.profile?.state || '',
          targetExam: response.data.user.profile?.targetExam || 'JEE Main',
          targetYear: response.data.user.profile?.targetYear || '',
          bio: response.data.user.profile?.bio || ''
        }
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Error loading profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await api.put('/profile', formData)
      setUser(response.data.user)
      setEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Error updating profile')
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    const formData = new FormData()
    formData.append('profileImage', file)

    setUploading(true)
    try {
      const response = await api.post('/profile/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      setUser(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          profileImage: response.data.profileImage
        }
      }))
      
      toast.success('Profile image updated successfully!')
    } catch (error) {
      toast.error('Error uploading image')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 sm:p-8 mb-8 text-white">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">My Profile</h1>
          <p className="text-blue-100">Manage your account information and preferences</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Image Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                  {user?.profile?.profileImage ? (
                    <img
                      src={user.profile.profileImage}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-blue-600">
                      {user?.name?.charAt(0)}
                    </span>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-2">{user?.name}</h2>
              <p className="text-gray-600 mb-4">{user?.email}</p>
              
              {uploading && (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-sm text-gray-600">Uploading...</span>
                </div>
              )}

              {/* Quick Stats */}
              <div className="mt-6 space-y-3">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600">Member Since</div>
                  <div className="font-semibold text-gray-900">
                    {new Date(user?.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600">Subscription</div>
                  <div className="font-semibold text-gray-900 capitalize">
                    {user?.subscription?.plan || 'Free'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Profile Information</h3>
                <button
                  onClick={() => setEditing(!editing)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  {editing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.profile.phone}
                        onChange={(e) => setFormData({
                          ...formData,
                          profile: { ...formData.profile, phone: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Institute/School</label>
                      <input
                        type="text"
                        value={formData.profile.institute}
                        onChange={(e) => setFormData({
                          ...formData,
                          profile: { ...formData.profile, institute: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={formData.profile.city}
                        onChange={(e) => setFormData({
                          ...formData,
                          profile: { ...formData.profile, city: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        value={formData.profile.state}
                        onChange={(e) => setFormData({
                          ...formData,
                          profile: { ...formData.profile, state: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Exam</label>
                      <select
                        value={formData.profile.targetExam}
                        onChange={(e) => setFormData({
                          ...formData,
                          profile: { ...formData.profile, targetExam: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="JEE Main">JEE Main</option>
                        <option value="JEE Advanced">JEE Advanced</option>
                        <option value="Both">Both</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Year</label>
                      <input
                        type="text"
                        value={formData.profile.targetYear}
                        onChange={(e) => setFormData({
                          ...formData,
                          profile: { ...formData.profile, targetYear: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 2025"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      value={formData.profile.bio}
                      onChange={(e) => setFormData({
                        ...formData,
                        profile: { ...formData.profile, bio: e.target.value }
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Tell us about yourself..."
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.profile.bio.length}/200 characters</p>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                      <p className="text-gray-900 font-medium">{user?.name || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                      <p className="text-gray-900 font-medium">{user?.email}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                      <p className="text-gray-900 font-medium">{user?.profile?.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Institute/School</label>
                      <p className="text-gray-900 font-medium">{user?.profile?.institute || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">City</label>
                      <p className="text-gray-900 font-medium">{user?.profile?.city || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">State</label>
                      <p className="text-gray-900 font-medium">{user?.profile?.state || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Target Exam</label>
                      <p className="text-gray-900 font-medium">{user?.profile?.targetExam || 'JEE Main'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Target Year</label>
                    <p className="text-gray-900 font-medium">{user?.profile?.targetYear || 'Not provided'}</p>
                  </div>

                  {user?.profile?.bio && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Bio</label>
                      <p className="text-gray-900">{user.profile.bio}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile