'use client'

interface MCQQuestionProps {
  question: {
    id: string
    prompt: any
    options: string[]
    points: number
  }
  value?: { selected: number }
  onChange: (value: { selected: number }) => void
}

export default function MCQQuestion({ question, value, onChange }: MCQQuestionProps) {
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

      <div className="space-y-2">
        {question.options.map((option, index) => (
          <label
            key={index}
            className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
              value?.selected === index
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <input
              type="radio"
              name={`mcq-${question.id}`}
              value={index}
              checked={value?.selected === index}
              onChange={() => onChange({ selected: index })}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-3 text-gray-800">{option}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
