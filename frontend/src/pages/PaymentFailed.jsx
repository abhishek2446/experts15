import { Link, useSearchParams } from 'react-router-dom'

const PaymentFailed = () => {
  const [searchParams] = useSearchParams()
  const reason = searchParams.get('reason') || 'Payment was cancelled or failed'

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Error Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          😞 Payment Failed
        </h1>
        
        <p className="text-gray-600 mb-6">
          {reason}
        </p>

        {/* Common Reasons */}
        <div className="text-left mb-6 bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Common reasons for payment failure:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              Insufficient balance in your account
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              Card expired or blocked
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              Network connectivity issues
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              Payment cancelled by user
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link 
            to="/subscription" 
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors block"
          >
            Try Again
          </Link>
          <Link 
            to="/contact" 
            className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors block"
          >
            Contact Support
          </Link>
          <Link 
            to="/dashboard" 
            className="w-full text-gray-500 py-2 px-6 rounded-lg hover:text-gray-700 transition-colors block"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Help Text */}
        <p className="text-xs text-gray-500 mt-4">
          💡 Need help? Contact us at support@experts15.com
        </p>
      </div>
    </div>
  )
}

export default PaymentFailed