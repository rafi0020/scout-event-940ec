'use client'

import { Check, X } from 'lucide-react'

interface TrueFalseQuestionProps {
  question: {
    id: string
    prompt: any
    points: number
  }
  value?: { selected: boolean }
  onChange: (value: { selected: boolean }) => void
}

export default function TrueFalseQuestion({ question, value, onChange }: TrueFalseQuestionProps) {
  const promptText = typeof question.prompt === 'string' 
    ? question.prompt 
    : question.prompt?.text || ''
    
  const hint = typeof question.prompt === 'object' ? question.prompt?.hint : null

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">{promptText}</h3>
        {hint && (
          <p className="text-sm text-gray-600 italic">💡 Hint: {hint}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onChange({ selected: true })}
          className={`p-6 rounded-lg border-2 transition-all ${
            value?.selected === true
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Check className="h-8 w-8 mx-auto mb-2 text-green-600" />
          <span className="text-lg font-semibold text-gray-800">TRUE</span>
        </button>

        <button
          onClick={() => onChange({ selected: false })}
          className={`p-6 rounded-lg border-2 transition-all ${
            value?.selected === false
              ? 'border-red-500 bg-red-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <X className="h-8 w-8 mx-auto mb-2 text-red-600" />
          <span className="text-lg font-semibold text-gray-800">FALSE</span>
        </button>
      </div>

      {value?.selected !== undefined && (
        <div className={`px-4 py-2 rounded-lg ${
          value.selected ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <p className={`text-sm font-medium ${
            value.selected ? 'text-green-700' : 'text-red-700'
          }`}>
            Selected: {value.selected ? 'TRUE' : 'FALSE'}
          </p>
        </div>
      )}
    </div>
  )
}
