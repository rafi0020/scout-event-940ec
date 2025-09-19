'use client'

import { CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react'

interface ExplanationPanelProps {
  type: string
  explanation: any
  meta: any
  detailed?: boolean
}

export default function ExplanationPanel({ type, explanation, meta, detailed = false }: ExplanationPanelProps) {
  if (!explanation || !meta) return null

  const renderMCQExplanation = () => (
    <div className="space-y-3">
      {meta.correct ? (
        <div className="flex items-center text-green-600">
          <CheckCircle className="h-5 w-5 mr-2" />
          <span className="font-medium">Correct!</span>
        </div>
      ) : (
        <div className="flex items-center text-red-600">
          <XCircle className="h-5 w-5 mr-2" />
          <span className="font-medium">Incorrect</span>
        </div>
      )}
      
      {explanation.kind === 'decisionRule' && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-blue-800 mb-1">Decision Rule:</p>
          <code className="text-sm text-blue-700">{explanation.ruleText}</code>
          {explanation.why && (
            <p className="text-sm text-blue-600 mt-2">{explanation.why}</p>
          )}
          {detailed && explanation.check && (
            <div className="text-xs text-blue-700 mt-2">
              Checks: {Object.entries(explanation.check).map(([k, v]) => `${k}: ${String(v)}`).join(', ')}
            </div>
          )}
        </div>
      )}

      {explanation.kind === 'concept' && (
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-purple-800 mb-1">
            Concept: {explanation.concept}
          </p>
          <p className="text-sm text-purple-600">{explanation.why}</p>
        </div>
      )}

      {explanation.kind === 'safetyTip' && (
        <div className="bg-orange-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-orange-800 mb-2">
            {explanation.principle}
          </p>
          {explanation.redFlags && (
            <div className="flex flex-wrap gap-1 mb-2">
              {explanation.redFlags.map((flag: string, idx: number) => (
                <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                  🚩 {flag}
                </span>
              ))}
            </div>
          )}
          <p className="text-sm text-orange-600">{explanation.why}</p>
        </div>
      )}

      <div className="text-sm text-gray-600">
        <p>Your answer: <span className="font-medium">{meta.userAnswer}</span></p>
        <p>Correct answer: <span className="font-medium text-green-600">{meta.correctAnswer}</span></p>
      </div>
    </div>
  )

  const renderCheckboxExplanation = () => (
    <div className="space-y-3">
      {meta.correct ? (
        <div className="flex items-center text-green-600">
          <CheckCircle className="h-5 w-5 mr-2" />
          <span className="font-medium">Perfect!</span>
        </div>
      ) : (
        <div className="flex items-center text-orange-600">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span className="font-medium">Partial Credit</span>
        </div>
      )}

      {explanation.kind === 'fairnessPanel' && (
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-purple-800 mb-2">Dataset Analysis:</p>
          
          {explanation.datasetSketch && (
            <div className="grid grid-cols-2 gap-2 mb-2">
              {Object.entries(explanation.datasetSketch).map(([key, value]) => (
                <div key={key} className="flex justify-between text-xs">
                  <span className="text-gray-600">{key.replace('_', ' ')}:</span>
                  <span className="font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          )}

          {explanation.issues && (
            <div className="mb-2">
              <p className="text-xs text-purple-700 font-medium">Issues Found:</p>
              <div className="flex flex-wrap gap-1">
                {explanation.issues.map((issue: string, idx: number) => (
                  <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                    {issue}
                  </span>
                ))}
              </div>
            </div>
          )}

          {explanation.whyFixes && (
            <div>
              <p className="text-xs text-purple-700 font-medium mb-1">Why These Fixes:</p>
              <ul className="text-xs text-purple-600 space-y-1">
                {explanation.whyFixes.map((fix: string, idx: number) => (
                  <li key={idx}>• {fix}</li>
                ))}
              </ul>
            </div>
          )}
          {detailed && meta && (
            <div className="mt-2 text-xs text-purple-700">
              Your selections: {JSON.stringify(meta.userAnswer)}
            </div>
          )}
        </div>
      )}

      <div className="text-sm text-gray-600">
        <p>Correct selections: {meta.correctSelections || 0}</p>
        <p>Wrong selections: {meta.wrongSelections || 0}</p>
        <p>Missed selections: {meta.missedSelections || 0}</p>
      </div>
    </div>
  )

  const renderGridPathExplanation = () => (
    <div className="space-y-3">
      {meta.valid && meta.goalReached ? (
        <div className="flex items-center text-green-600">
          <CheckCircle className="h-5 w-5 mr-2" />
          <span className="font-medium">Goal Reached!</span>
        </div>
      ) : (
        <div className="flex items-center text-red-600">
          <XCircle className="h-5 w-5 mr-2" />
          <span className="font-medium">{meta.error || 'Failed'}</span>
        </div>
      )}

      {explanation.kind === 'pathOverlay' && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-blue-800 mb-2">Path Analysis:</p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-700">Your Path:</p>
              <p className="text-blue-600">Steps: {meta.steps}</p>
              <p className="text-blue-600">Water hits: {meta.waterHits}</p>
              <p className="text-blue-600 font-medium">Reward: {meta.reward}</p>
            </div>
            <div>
              <p className="text-green-700">Optimal Path:</p>
              <p className="text-green-600">Steps: {meta.optimalSteps}</p>
              <p className="text-green-600 font-medium">Reward: {meta.optimalReward}</p>
              <p className="text-green-600">Efficiency: {meta.efficiency}%</p>
            </div>
          </div>

          {explanation.math && (
            <div className="mt-2 p-2 bg-white rounded">
              <code className="text-xs text-blue-700">{explanation.math}</code>
            </div>
          )}
          {detailed && meta?.path && (
            <div className="mt-2 text-xs text-blue-700">
              Your Path: {meta.path}
            </div>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
        <TrendingUp className="h-4 w-4 mr-2" />
        Explanation
      </h4>
      
      {type === 'MCQ' && renderMCQExplanation()}
      {type === 'TRUE_FALSE' && renderMCQExplanation()}
      {type === 'CHECKBOX' && renderCheckboxExplanation()}
      {type === 'GRID_PATH' && renderGridPathExplanation()}
    </div>
  )
}
