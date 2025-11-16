import { useState, useRef, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../services/api'

const OTPInput = ({ email, onVerify, loading: externalLoading = false }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [timer, setTimer] = useState(60)
  const inputRefs = useRef([])
  const isLoading = loading || externalLoading

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(timer - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [timer])

  const handleChange = (index, value) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleSubmit(newOtp.join(''))
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (otpValue = otp.join('')) => {
    if (otpValue.length !== 6) {
      toast.error('Please enter complete OTP')
      return
    }

    setLoading(true)
    try {
      const result = await onVerify(otpValue)
      if (!result.success) {
        setOtp(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    try {
      await api.post('/auth/resend-otp', { email })
      toast.success('OTP resent successfully!')
      setTimer(60)
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to resend OTP')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center space-x-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={el => inputRefs.current[index] = el}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition-all duration-200 bg-white hover:border-primary-300"
            disabled={isLoading}
          />
        ))}
      </div>

      <div className="text-center space-y-6">
        <button
          onClick={() => handleSubmit()}
          disabled={isLoading || otp.some(digit => digit === '')}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Verifying...
            </div>
          ) : (
            '✅ Verify OTP'
          )}
        </button>

        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-sm text-gray-600 mb-2">
            {timer > 0 ? (
              <div className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Resend OTP in <span className="font-bold text-primary-600">{timer}</span> seconds
              </div>
            ) : (
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="text-primary-600 hover:text-primary-500 font-semibold transition-colors duration-200 disabled:opacity-50"
              >
                {resendLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  '🔄 Resend OTP'
                )}
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500">
            💡 Didn't receive the code? Check your spam folder or try resending.
          </p>
        </div>
      </div>
    </div>
  )
}

export default OTPInput