import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

const QuestionEditor = ({ isOpen, onClose, question, onSave, testId }) => {
  const [formData, setFormData] = useState({
    qno: 1,
    subject: 'Physics',
    text: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0,
    marks: 4,
    negativeMarks: -1,
    questionType: 'MCQ',
    difficulty: 'Medium',
    explanation: '',
    imageUrl: ''
  })

  useEffect(() => {
    if (question) {
      setFormData({
        qno: question.qno || 1,
        subject: question.subject || 'Physics',
        text: question.text || '',
        options: question.options || ['', '', '', ''],
        correctOptionIndex: question.correctOptionIndex || 0,
        marks: question.marks || 4,
        negativeMarks: question.negativeMarks || -1,
        questionType: question.questionType || 'MCQ',
        difficulty: question.difficulty || 'Medium',
        explanation: question.explanation || '',
        imageUrl: question.imageUrl || ''
      })
    }
  }, [question])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.text.trim()) {
      toast.error('Question text is required')
      return
    }
    
    if (formData.questionType === 'MCQ' && formData.options.some(opt => !opt.trim())) {
      toast.error('All options are required for MCQ')
      return
    }

    onSave(formData)
    onClose()
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({ ...formData, options: newOptions })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {question ? 'Edit Question' : 'Add New Question'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question No.</label>
              <input
                type="number"
                value={formData.qno}
                onChange={(e) => setFormData({...formData, qno: parseInt(e.target.value)})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Mathematics">Mathematics</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
              <select
                value={formData.questionType}
                onChange={(e) => setFormData({...formData, questionType: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="MCQ">Multiple Choice (MCQ)</option>
                <option value="MSQ">Multiple Select (MSQ)</option>
                <option value="Integer">Integer Type</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData({...formData, text: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Enter the question text here..."
              required
            />
          </div>

          {(formData.questionType === 'MCQ' || formData.questionType === 'MSQ') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
              <div className="space-y-3">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={formData.correctOptionIndex === index}
                        onChange={() => setFormData({...formData, correctOptionIndex: index})}
                        className="mr-2"
                      />
                      <span className="font-medium text-gray-700">{String.fromCharCode(65 + index)}.</span>
                    </div>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      required
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {formData.questionType === 'Integer' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer (Integer)</label>
              <input
                type="number"
                value={formData.correctOptionIndex}
                onChange={(e) => setFormData({...formData, correctOptionIndex: parseInt(e.target.value)})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter the correct integer answer"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Positive Marks</label>
              <input
                type="number"
                value={formData.marks}
                onChange={(e) => setFormData({...formData, marks: parseInt(e.target.value)})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Negative Marks</label>
              <input
                type="number"
                value={formData.negativeMarks}
                onChange={(e) => setFormData({...formData, negativeMarks: parseInt(e.target.value)})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                max="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Explanation (Optional)</label>
            <textarea
              value={formData.explanation}
              onChange={(e) => setFormData({...formData, explanation: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Explain the solution..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {question ? 'Update Question' : 'Add Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default QuestionEditor