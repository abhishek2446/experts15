import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

const DemoTest = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const startDemoTest = async () => {
      if (!user) {
        toast.info('Please login to access the demo test')
        navigate('/login')
        return
      }

      try {
        const response = await api.get('/demo/test')
        toast.success('Demo test ready! Redirecting...')
        setTimeout(() => {
          navigate(`/test/${response.data.testId}/instructions`)
        }, 1000)
      } catch (error) {
        toast.error('Failed to start demo test')
        navigate('/dashboard')
      }
    }

    startDemoTest()
  }, [user, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Starting Demo Test...</h2>
        <p className="text-gray-600">Please wait while we prepare your test</p>
      </div>
    </div>
  )
}

export default DemoTest