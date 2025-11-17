import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

const EnhancedDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState(null)
  const [weeklyProgress, setWeeklyProgress] = useState([])
  const [todayTasks, setTodayTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    fetchDashboardData()
    
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    
    return () => clearInterval(timeInterval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [dashboardResponse, weeklyResponse] = await Promise.all([
        api.get('/progress/dashboard'),
        api.get('/progress/weekly')
      ])
      
      setDashboardData(dashboardResponse.data)
      setWeeklyProgress(weeklyResponse.data.weeklyProgress || [])
      setTodayTasks(dashboardResponse.data.todayTasks || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const completeTask = async (taskId) => {
    try {
      await api.post(`/progress/task/${taskId}/complete`, { score: 100 })
      toast.success('Task completed! 🎉')
      fetchDashboardData()
    } catch (error) {
      toast.error('Failed to complete task')
    }
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const getStreakEmoji = (streak) => {
    if (streak >= 30) return '🔥'
    if (streak >= 14) return '⚡'
    if (streak >= 7) return '💪'
    if (streak >= 3) return '🌟'
    return '🚀'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const currentStreak = dashboardData?.progress?.studyStreak?.current || 0
  const totalStudyTime = dashboardData?.user?.totalStudyTime || 0
  const subscription = dashboardData?.user?.subscription || { plan: 'free', active: false }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <h1 className="text-4xl lg:text-5xl font-black mb-4">
                  {getGreeting()}, {user?.name}! 👋
                </h1>
                <p className="text-xl lg:text-2xl text-white/90 mb-6">
                  Ready to conquer JEE today? Let's make it count! 🎯
                </p>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="text-2xl mb-1">{getStreakEmoji(currentStreak)}</div>
                    <div className="text-2xl font-bold">{currentStreak}</div>
                    <div className="text-sm text-white/80">Day Streak</div>
                  </div>
                  
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="text-2xl mb-1">⏱️</div>
                    <div className="text-2xl font-bold">{Math.floor(totalStudyTime / 60)}h</div>
                    <div className="text-sm text-white/80">Study Time</div>
                  </div>
                  
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="text-2xl mb-1">📊</div>
                    <div className="text-2xl font-bold">{subscription.plan.toUpperCase()}</div>
                    <div className="text-sm text-white/80">Plan</div>
                  </div>
                  
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="text-2xl mb-1">📅</div>
                    <div className="text-lg font-bold">{currentTime.getDate()}</div>
                    <div className="text-sm text-white/80">{currentTime.toLocaleDateString('en-US', { month: 'short' })}</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 lg:mt-0 lg:ml-8">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold mb-2">{currentTime.toLocaleDateString('en-US', { weekday: 'long' })}</div>
                  <div className="text-lg text-white/90">{currentTime.toLocaleDateString()}</div>
                  <div className="text-sm text-white/80 mt-2">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Progress & Tasks */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Today's Tasks */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <span className="text-3xl mr-3">✅</span>
                  Today's Tasks
                </h2>
                <div className="text-sm text-gray-500">
                  {todayTasks.filter(t => t.completed).length} / {todayTasks.length} completed
                </div>
              </div>
              
              {todayTasks.length > 0 ? (
                <div className="space-y-4">
                  {todayTasks.map((task, index) => (
                    <div key={index} className={`p-4 rounded-xl border-2 transition-all ${
                      task.completed 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-gray-50 hover:border-indigo-200 hover:bg-indigo-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => !task.completed && completeTask(task.taskId)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              task.completed
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-indigo-500'
                            }`}
                            disabled={task.completed}
                          >
                            {task.completed && <span className="text-xs">✓</span>}
                          </button>
                          <div>
                            <h3 className={`font-semibold ${task.completed ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                              {task.title}
                            </h3>
                            {task.completed && (
                              <p className="text-sm text-green-600">Completed at {new Date(task.completedAt).toLocaleTimeString()}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-2xl">
                          {task.completed ? '🎉' : '⏳'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks for today</h3>
                  <p className="text-gray-600">Subscribe to a premium plan to get daily tasks!</p>
                  <Link to="/packages" className="inline-block mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                    View Plans
                  </Link>
                </div>
              )}
            </div>

            {/* Weekly Progress Chart */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-3xl mr-3">📊</span>
                Weekly Progress
              </h2>
              
              <div className="flex items-end justify-between h-40 space-x-2">
                {weeklyProgress.map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex flex-col items-center mb-2">
                      <div 
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          day.isToday ? 'bg-indigo-500' : 'bg-gray-300'
                        }`}
                        style={{ 
                          height: `${Math.max(day.completionRate * 1.2, 8)}px`,
                          maxHeight: '120px'
                        }}
                      ></div>
                      <div className="text-xs font-bold text-gray-600 mt-1">{day.completionRate}%</div>
                    </div>
                    <div className={`text-sm font-medium ${
                      day.isToday ? 'text-indigo-600' : 'text-gray-500'
                    }`}>
                      {day.day}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-center text-sm text-gray-600">
                Task completion rate over the last 7 days
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-3xl mr-3">⚡</span>
                Quick Actions
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/tests" className="group p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:border-blue-300 transition-all hover:shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-white text-xl">📝</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Take Mock Test</h3>
                      <p className="text-sm text-gray-600">Practice with JEE pattern tests</p>
                    </div>
                  </div>
                </Link>
                
                <Link to="/packages" className="group p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 hover:border-purple-300 transition-all hover:shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-white text-xl">💎</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Upgrade Plan</h3>
                      <p className="text-sm text-gray-600">Unlock premium features</p>
                    </div>
                  </div>
                </Link>
                
                <Link to="/profile" className="group p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:border-green-300 transition-all hover:shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-white text-xl">👤</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">My Profile</h3>
                      <p className="text-sm text-gray-600">Update your details</p>
                    </div>
                  </div>
                </Link>
                
                <button 
                  onClick={() => navigate('/demo')}
                  className="group p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 hover:border-orange-300 transition-all hover:shadow-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-white text-xl">🚀</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Demo Test</h3>
                      <p className="text-sm text-gray-600">Try our platform for free</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Subscription */}
          <div className="space-y-8">
            
            {/* Subscription Status */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">💎</span>
                Subscription
              </h2>
              
              <div className={`p-4 rounded-xl border-2 ${
                subscription.active 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {subscription.plan.toUpperCase()} PLAN
                  </div>
                  <div className={`text-sm ${subscription.active ? 'text-green-600' : 'text-gray-600'}`}>
                    {subscription.active ? 'Active' : 'Inactive'}
                  </div>
                  
                  {subscription.active && subscription.expiryDate && (
                    <div className="mt-2 text-xs text-gray-500">
                      Expires: {new Date(subscription.expiryDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
              
              {!subscription.active && (
                <Link 
                  to="/packages"
                  className="block w-full mt-4 bg-indigo-600 text-white text-center py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                >
                  Upgrade Now
                </Link>
              )}
            </div>

            {/* Achievement Badges */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">🏆</span>
                Achievements
              </h2>
              
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-lg border-2 text-center ${
                  currentStreak >= 7 ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="text-2xl mb-1">🔥</div>
                  <div className="text-xs font-semibold">Week Warrior</div>
                  {currentStreak >= 7 && <div className="text-xs text-yellow-600 font-bold">UNLOCKED!</div>}
                </div>
                
                <div className={`p-3 rounded-lg border-2 text-center ${
                  totalStudyTime >= 3600 ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="text-2xl mb-1">📚</div>
                  <div className="text-xs font-semibold">Study Master</div>
                  {totalStudyTime >= 3600 && <div className="text-xs text-blue-600 font-bold">UNLOCKED!</div>}
                </div>
                
                <div className={`p-3 rounded-lg border-2 text-center ${
                  currentStreak >= 30 ? 'border-purple-300 bg-purple-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="text-2xl mb-1">💪</div>
                  <div className="text-xs font-semibold">Month Champion</div>
                  {currentStreak >= 30 && <div className="text-xs text-purple-600 font-bold">UNLOCKED!</div>}
                </div>
                
                <div className={`p-3 rounded-lg border-2 text-center ${
                  subscription.active ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="text-2xl mb-1">⭐</div>
                  <div className="text-xs font-semibold">Premium User</div>
                  {subscription.active && <div className="text-xs text-green-600 font-bold">UNLOCKED!</div>}
                </div>
              </div>
            </div>

            {/* Study Stats */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">📈</span>
                Study Stats
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current Streak</span>
                  <span className="font-bold text-indigo-600">{currentStreak} days</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Study Time</span>
                  <span className="font-bold text-green-600">{Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">This Week</span>
                  <span className="font-bold text-purple-600">
                    {weeklyProgress.reduce((sum, day) => sum + day.completedTasks, 0)} tasks
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Plan Status</span>
                  <span className={`font-bold ${subscription.active ? 'text-green-600' : 'text-gray-600'}`}>
                    {subscription.plan.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedDashboard