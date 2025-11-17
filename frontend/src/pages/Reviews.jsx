import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../services/api'

const Reviews = () => {
  const [reviews, setReviews] = useState([])
  const [myReviews, setMyReviews] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingReview, setEditingReview] = useState(null)
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
    fetchMyReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const response = await api.get('/reviews')
      setReviews(response.data.reviews)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  const fetchMyReviews = async () => {
    try {
      const response = await api.get('/reviews/my')
      setMyReviews(response.data.reviews)
    } catch (error) {
      console.error('Error fetching my reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingReview) {
        await api.put(`/reviews/${editingReview._id}`, formData)
        toast.success('Review updated successfully!')
      } else {
        await api.post('/reviews', formData)
        toast.success('Review submitted for approval!')
      }
      
      setFormData({ rating: 5, title: '', comment: '' })
      setShowForm(false)
      setEditingReview(null)
      fetchMyReviews()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error submitting review')
    }
  }

  const handleEdit = (review) => {
    setEditingReview(review)
    setFormData({
      rating: review.rating,
      title: review.title,
      comment: review.comment
    })
    setShowForm(true)
  }

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return
    
    try {
      await api.delete(`/reviews/${reviewId}`)
      toast.success('Review deleted successfully!')
      fetchMyReviews()
    } catch (error) {
      toast.error('Error deleting review')
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-xl ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
        ⭐
      </span>
    ))
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 sm:p-8 mb-8 text-white">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Reviews & Feedback</h1>
          <p className="text-blue-100">Share your experience and read what others say about Experts15</p>
        </div>

        {/* My Reviews Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Reviews</h2>
            {myReviews.length === 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Write Review
              </button>
            )}
          </div>

          {myReviews.length > 0 ? (
            <div className="space-y-4">
              {myReviews.map((review) => (
                <div key={review._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      {renderStars(review.rating)}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        review.status === 'approved' ? 'bg-green-100 text-green-800' :
                        review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {review.status}
                      </span>
                      {review.isPinned && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                          📌 Pinned
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {review.status === 'pending' && (
                        <button
                          onClick={() => handleEdit(review)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{review.title}</h3>
                  <p className="text-gray-600 mb-2">{review.comment}</p>
                  {review.adminResponse && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mt-3">
                      <p className="text-sm text-blue-800">
                        <strong>Admin Response:</strong> {review.adminResponse}
                      </p>
                    </div>
                  )}
                  <p className="text-sm text-gray-500">
                    Submitted on {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">💭</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-600 mb-4">Share your experience with Experts15</p>
            </div>
          )}
        </div>

        {/* Review Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  {editingReview ? 'Edit Review' : 'Write Review'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingReview(null)
                    setFormData({ rating: 5, title: '', comment: '' })
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className={`text-2xl ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief title for your review"
                    required
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Share your experience with Experts15..."
                    required
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.comment.length}/500 characters</p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingReview(null)
                      setFormData({ rating: 5, title: '', comment: '' })
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                  >
                    {editingReview ? 'Update' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* All Reviews Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Reviews</h2>
          
          {reviews.length > 0 ? (
            <div className="grid gap-6">
              {reviews.map((review) => (
                <div key={review._id} className="border rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      {review.userId.profile?.profileImage ? (
                        <img
                          src={review.userId.profile.profileImage}
                          alt={review.userId.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-blue-600 font-semibold">
                          {review.userId.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{review.userId.name}</h4>
                          {review.userId.profile?.institute && (
                            <p className="text-sm text-gray-500">{review.userId.profile.institute}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {renderStars(review.rating)}
                          {review.isPinned && (
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                              📌 Featured
                            </span>
                          )}
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{review.title}</h3>
                      <p className="text-gray-600 mb-2">{review.comment}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-600">Be the first to share your experience!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Reviews