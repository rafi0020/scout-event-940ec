'use client'

interface CheckboxQuestionProps {
  question: {
    id: string
    prompt: any
    options: string[]
    points: number
  }
  value?: { selected: number[] }
  onChange: (value: { selected: number[] }) => void
}

export default function CheckboxQuestion({ question, value, onChange }: CheckboxQuestionProps) {
  const promptText = typeof question.prompt === 'string' 
    ? question.prompt 
    : question.prompt?.text || ''
    
  const hint = typeof question.prompt === 'object' ? question.prompt?.hint : null

  const handleToggle = (index: number) => {
    const currentSelected = value?.selected || []
    const newSelected = currentSelected.includes(index)
      ? currentSelected.filter(i => i !== index)
      : [...currentSelected, index]
    
    onChange({ selected: newSelected })
  }

  const isSelected = (index: number) => {
    return value?.selected?.includes(index) || false
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">{promptText}</h3>
        {hint && (
          <p className="text-sm text-gray-600 italic">💡 Hint: {hint}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">Select all that apply</p>
      </div>

      <div className="space-y-2">
        {question.options.map((option, index) => (
          <label
            key={index}
            className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
              isSelected(index)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <input
              type="checkbox"
              checked={isSelected(index)}
              onChange={() => handleToggle(index)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="ml-3 text-gray-800">{option}</span>
          </label>
        ))}
      </div>

      {value?.selected && value.selected.length > 0 && (
        <div className="bg-blue-50 px-4 py-2 rounded-lg">
          <p className="text-sm text-blue-700">
            Selected: {value.selected.length} option(s)
          </p>
        </div>
      )}
    </div>
  )
}
