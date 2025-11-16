import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

const BulkQuestionEditor = ({ isOpen, onClose, questions, onSave }) => {
  const [editedQuestions, setEditedQuestions] = useState([])
  const [selectedQuestions, setSelectedQuestions] = useState([])
  const [bulkAction, setBulkAction] = useState('')
  const [bulkValue, setBulkValue] = useState('')

  useEffect(() => {
    if (questions) {
      setEditedQuestions([...questions])
    }
  }, [questions])

  const handleQuestionChange = (index, field, value) => {
    const updated = [...editedQuestions]
    updated[index] = { ...updated[index], [field]: value }
    setEditedQuestions(updated)
  }

  const handleSelectQuestion = (index) => {
    setSelectedQuestions(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const handleSelectAll = () => {
    if (selectedQuestions.length === editedQuestions.length) {
      setSelectedQuestions([])
    } else {
      setSelectedQuestions(editedQuestions.map((_, index) => index))
    }
  }

  const applyBulkAction = () => {
    if (!bulkAction || selectedQuestions.length === 0) {
      toast.error('Select questions and action')
      return
    }

    const updated = [...editedQuestions]
    selectedQuestions.forEach(index => {
      switch (bulkAction) {
        case 'marks':
          updated[index].marks = parseInt(bulkValue) || 4
          break
        case 'negativeMarks':
          updated[index].negativeMarks = parseInt(bulkValue) || -1
          break
        case 'difficulty':
          updated[index].difficulty = bulkValue
          break
        case 'subject':
          updated[index].subject = bulkValue
          break
      }
    })
    
    setEditedQuestions(updated)
    setSelectedQuestions([])
    setBulkAction('')
    setBulkValue('')
    toast.success(`Updated ${selectedQuestions.length} questions`)
  }

  const deleteSelected = () => {
    if (selectedQuestions.length === 0) {
      toast.error('No questions selected')
      return
    }

    if (!window.confirm(`Delete ${selectedQuestions.length} questions?`)) {
      return
    }

    const updated = editedQuestions.filter((_, index) => !selectedQuestions.includes(index))
    setEditedQuestions(updated)
    setSelectedQuestions([])
    toast.success(`Deleted ${selectedQuestions.length} questions`)
  }

  const reorderQuestions = () => {
    const updated = editedQuestions.map((q, index) => ({
      ...q,
      qno: index + 1
    }))
    setEditedQuestions(updated)
    toast.success('Questions reordered')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-7xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Bulk Question Editor</h2>
              <p className="text-purple-100 mt-1">{editedQuestions.length} questions loaded</p>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="bg-gray-50 border-b p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSelectAll}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
              >
                {selectedQuestions.length === editedQuestions.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className="text-sm text-gray-600">
                {selectedQuestions.length} selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={reorderQuestions}
                className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
              >
                Reorder Questions
              </button>
              <button
                onClick={deleteSelected}
                className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                disabled={selectedQuestions.length === 0}
              >
                Delete Selected
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="">Select Action</option>
              <option value="marks">Set Marks</option>
              <option value="negativeMarks">Set Negative Marks</option>
              <option value="difficulty">Set Difficulty</option>
              <option value="subject">Set Subject</option>
            </select>

            {bulkAction === 'difficulty' && (
              <select
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="">Select Difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            )}

            {bulkAction === 'subject' && (
              <select
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="">Select Subject</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Mathematics">Mathematics</option>
              </select>
            )}

            {(bulkAction === 'marks' || bulkAction === 'negativeMarks') && (
              <input
                type="number"
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm w-20"
                placeholder="Value"
              />
            )}

            <button
              onClick={applyBulkAction}
              className="px-4 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              disabled={!bulkAction || selectedQuestions.length === 0}
            >
              Apply to Selected
            </button>
          </div>
        </div>

        {/* Questions Table */}
        <div className="overflow-y-auto" style={{ height: 'calc(90vh - 200px)' }}>
          <table className="w-full">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="w-12 p-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedQuestions.length === editedQuestions.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="w-16 p-3 text-left">Q#</th>
                <th className="w-24 p-3 text-left">Subject</th>
                <th className="flex-1 p-3 text-left">Question Text</th>
                <th className="w-20 p-3 text-left">Marks</th>
                <th className="w-20 p-3 text-left">Negative</th>
                <th className="w-24 p-3 text-left">Difficulty</th>
                <th className="w-16 p-3 text-left">Answer</th>
              </tr>
            </thead>
            <tbody>
              {editedQuestions.map((question, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedQuestions.includes(index)}
                      onChange={() => handleSelectQuestion(index)}
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={question.qno}
                      onChange={(e) => handleQuestionChange(index, 'qno', parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      min="1"
                    />
                  </td>
                  <td className="p-3">
                    <select
                      value={question.subject}
                      onChange={(e) => handleQuestionChange(index, 'subject', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Mathematics">Mathematics</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <textarea
                      value={question.text}
                      onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      rows="2"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={question.marks}
                      onChange={(e) => handleQuestionChange(index, 'marks', parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      min="1"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={question.negativeMarks}
                      onChange={(e) => handleQuestionChange(index, 'negativeMarks', parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      max="0"
                    />
                  </td>
                  <td className="p-3">
                    <select
                      value={question.difficulty || 'Medium'}
                      onChange={(e) => handleQuestionChange(index, 'difficulty', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </td>
                  <td className="p-3 text-center">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      {String.fromCharCode(65 + (question.correctOptionIndex || 0))}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t p-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {editedQuestions.length} questions • {selectedQuestions.length} selected
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSave(editedQuestions)
                onClose()
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BulkQuestionEditor