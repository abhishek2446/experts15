import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../../services/api'

const NotificationSystem = ({ isOpen, onClose, testId, testTitle }) => {
  const [recipients, setRecipients] = useState('all')
  const [customEmails, setCustomEmails] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [users, setUsers] = useState([])

  useEffect(() => {
    if (isOpen) {
      fetchUsers()
      setSubject(`New Test Available: ${testTitle}`)
      setMessage(`A new test "${testTitle}" is now available on Experts15. Login to your dashboard to attempt the test.`)
    }
  }, [isOpen, testTitle])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users')
      setUsers(response.data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const sendNotification = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Subject and message are required')
      return
    }

    setSending(true)
    try {
      const payload = {
        testId,
        recipients,
        customEmails: customEmails.split(',').map(email => email.trim()).filter(email => email),
        subject,
        message
      }

      await api.post('/admin/notifications/send', payload)
      toast.success('Notifications sent successfully!')
      onClose()
    } catch (error) {
      toast.error('Error sending notifications')
    } finally {
      setSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Send Test Notification</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Recipients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="recipients"
                  value="all"
                  checked={recipients === 'all'}
                  onChange={(e) => setRecipients(e.target.value)}
                  className="mr-2"
                />
                All Students ({users.filter(u => u.role === 'student').length} users)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="recipients"
                  value="enrolled"
                  checked={recipients === 'enrolled'}
                  onChange={(e) => setRecipients(e.target.value)}
                  className="mr-2"
                />
                Enrolled Students Only
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="recipients"
                  value="custom"
                  checked={recipients === 'custom'}
                  onChange={(e) => setRecipients(e.target.value)}
                  className="mr-2"
                />
                Custom Email List
              </label>
            </div>
          </div>

          {/* Custom Emails */}
          {recipients === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Addresses</label>
              <textarea
                value={customEmails}
                onChange={(e) => setCustomEmails(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter email addresses separated by commas"
              />
              <p className="text-sm text-gray-500 mt-1">
                Separate multiple emails with commas
              </p>
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email subject"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={6}
              placeholder="Notification message"
              required
            />
          </div>

          {/* Preview */}
          <div className="bg-gray-50 border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
            <div className="text-sm">
              <div className="mb-2">
                <span className="font-medium">To:</span> {
                  recipients === 'all' ? 'All Students' :
                  recipients === 'enrolled' ? 'Enrolled Students' :
                  'Custom Recipients'
                }
              </div>
              <div className="mb-2">
                <span className="font-medium">Subject:</span> {subject}
              </div>
              <div>
                <span className="font-medium">Message:</span>
                <div className="mt-1 p-2 bg-white border rounded text-gray-700">
                  {message}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={sending}
            >
              Cancel
            </button>
            <button
              onClick={sendNotification}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={sending}
            >
              {sending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                'Send Notification'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationSystem