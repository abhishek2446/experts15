import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../services/api'

const TestResult = () => {
  const { testId } = useParams()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await api.get(`/cbt/${testId}/result`)
        setResult(response.data)
      } catch (error) {
        toast.error('Failed to load test result')
      } finally {
        setLoading(false)
      }
    }

    fetchResult()
  }, [testId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Result Not Found</h2>
          <p className="text-gray-600 mb-4">We couldn't find your test result.</p>
          <Link to="/dashboard" className="btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const { attempt, test } = result
  const { score, analytics } = attempt

  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-600' }
    if (percentage >= 80) return { grade: 'A', color: 'text-green-600' }
    if (percentage >= 70) return { grade: 'B+', color: 'text-blue-600' }
    if (percentage >= 60) return { grade: 'B', color: 'text-blue-600' }
    if (percentage >= 50) return { grade: 'C+', color: 'text-yellow-600' }
    if (percentage >= 40) return { grade: 'C', color: 'text-yellow-600' }
    return { grade: 'D', color: 'text-red-600' }
  }

  const percentage = (score.total / test.totalMarks) * 100
  const gradeInfo = getGrade(percentage)

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}h ${minutes}m ${secs}s`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Completed!</h1>
          <p className="text-gray-600">{test.title}</p>
        </div>

        {/* Score Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-2">{score.total}</div>
            <div className="text-sm text-gray-600">Total Score</div>
            <div className="text-xs text-gray-500 mt-1">out of {test.totalMarks}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className={`text-3xl font-bold mb-2 ${gradeInfo.color}`}>{percentage.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Percentage</div>
            <div className={`text-xs mt-1 font-medium ${gradeInfo.color}`}>Grade: {gradeInfo.grade}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{analytics.accuracy}%</div>
            <div className="text-sm text-gray-600">Accuracy</div>
            <div className="text-xs text-gray-500 mt-1">{analytics.correct}/{analytics.attempted} correct</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{Math.floor(attempt.timeSpent / 60)}m</div>
            <div className="text-sm text-gray-600">Time Taken</div>
            <div className="text-xs text-gray-500 mt-1">{Math.floor(attempt.timeSpent / 60)} out of {test.durationMins} minutes</div>
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Question Analysis */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Question Analysis</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                  <span className="font-medium text-gray-900">Correct Answers</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{analytics.correct}</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                  <span className="font-medium text-gray-900">Incorrect Answers</span>
                </div>
                <span className="text-2xl font-bold text-red-600">{analytics.incorrect}</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
                  <span className="font-medium text-gray-900">Marked for Review</span>
                </div>
                <span className="text-2xl font-bold text-purple-600">{analytics.markedForReview}</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-400 rounded-full mr-3"></div>
                  <span className="font-medium text-gray-900">Not Visited</span>
                </div>
                <span className="text-2xl font-bold text-gray-600">{analytics.notVisited}</span>
              </div>
            </div>
          </div>

          {/* Subject-wise Performance */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Subject-wise Performance</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Physics</div>
                  <div className="text-sm text-gray-600">Score obtained</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{score.physics}</div>
                  <div className="text-sm text-gray-500">marks</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Chemistry</div>
                  <div className="text-sm text-gray-600">Score obtained</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{score.chemistry}</div>
                  <div className="text-sm text-gray-500">marks</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Mathematics</div>
                  <div className="text-sm text-gray-600">Score obtained</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">{score.mathematics}</div>
                  <div className="text-sm text-gray-500">marks</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Insights</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">
                {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : percentage >= 40 ? '😐' : '😞'}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Overall Performance</h3>
              <p className="text-sm text-gray-600">
                {percentage >= 80 ? 'Excellent! You performed exceptionally well.' :
                 percentage >= 60 ? 'Good job! You have a solid understanding.' :
                 percentage >= 40 ? 'Average performance. There\'s room for improvement.' :
                 'Needs improvement. Focus on weak areas.'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-2">
                {analytics.accuracy >= 80 ? '🎯' : analytics.accuracy >= 60 ? '✅' : '⚠️'}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Accuracy</h3>
              <p className="text-sm text-gray-600">
                {analytics.accuracy >= 80 ? 'Great accuracy! You answered most questions correctly.' :
                 analytics.accuracy >= 60 ? 'Good accuracy. Be more careful with calculations.' :
                 'Low accuracy. Practice more to improve precision.'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-2">
                {attempt.timeSpent < (test.durationMins * 60 * 0.8) ? '⚡' : 
                 attempt.timeSpent < (test.durationMins * 60 * 0.95) ? '⏰' : '🕐'}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Time Management</h3>
              <p className="text-sm text-gray-600">
                {attempt.timeSpent < (test.durationMins * 60 * 0.8) ? 'Excellent time management! You finished early.' :
                 attempt.timeSpent < (test.durationMins * 60 * 0.95) ? 'Good time management. Well paced.' :
                 'Used most of the time. Practice speed and accuracy.'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to={`/test/${testId}/review`}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 text-center"
          >
            View Detailed Solutions
          </Link>
          <Link
            to="/tests"
            className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 text-center"
          >
            Take Another Test
          </Link>
          <Link
            to="/dashboard"
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 text-center"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Motivational Message */}
        <div className="text-center mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Keep Going! 🚀</h3>
          <p className="text-gray-600">
            {percentage >= 80 ? 'Outstanding performance! Keep up the excellent work and maintain this momentum.' :
             percentage >= 60 ? 'You\'re on the right track! Continue practicing to reach even greater heights.' :
             percentage >= 40 ? 'Every expert was once a beginner. Keep practicing and you\'ll see improvement.' :
             'Don\'t give up! Identify your weak areas, practice more, and come back stronger.'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default TestResult