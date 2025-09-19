'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, ArrowRight, Send, CheckCircle, 
  XCircle, AlertCircle, Brain 
} from 'lucide-react'
import Link from 'next/link'
import MCQQuestion from '@/components/questions/MCQQuestion'
import CheckboxQuestion from '@/components/questions/CheckboxQuestion'
import TrueFalseQuestion from '@/components/questions/TrueFalseQuestion'
import GridPathQuestion from '@/components/questions/GridPathQuestion'
import ExplanationPanel from '@/components/ExplanationPanel'

interface Question {
  id: string
  type: 'MCQ' | 'CHECKBOX' | 'TRUE_FALSE' | 'GRID_PATH'
  prompt: any
  options: any
  points: number
}

interface Activity {
  id: string
  title: string
  description: string
  questions: Question[]
}

interface SubmissionResult {
  success: boolean
  score: number
  perQuestion: Array<{
    questionId: string
    points: number
    correct: boolean
  }>
  explanations: Array<{
    questionId: string
    ai: any
    meta: any
  }>
}

export default function ActivityDetailPage() {
  const router = useRouter()
  const params = useParams()
  const activityId = params.activityId as string

  const [activity, setActivity] = useState<Activity | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<SubmissionResult | null>(null)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [timerRunning, setTimerRunning] = useState(false)
  const [showDetailed, setShowDetailed] = useState(false)

  useEffect(() => {
    loadActivity()
  }, [activityId])

  const loadActivity = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/team')
        return
      }

      const res = await fetch('/api/team/activities', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error('Failed to load activity')
      }

      const data = await res.json()
      const act = data.activities.find((a: Activity) => a.id === activityId)
      
      if (!act) {
        throw new Error('Activity not found')
      }

      setActivity(act)
      // Assign timers by sprint order: 10/20/10/20 minutes
      const minutesByOrder: Record<number, number> = { 1: 10, 2: 20, 3: 10, 4: 20 }
      const minutes = minutesByOrder[(act as any).order] || 10
      setTimeLeft(minutes * 60)
      setTimerRunning(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Countdown timer
  useEffect(() => {
    if (!timerRunning || timeLeft === null) return
    if (timeLeft <= 0) {
      setTimerRunning(false)
      // auto-submit if possible
      handleSubmit()
      return
    }
    const t = setTimeout(() => setTimeLeft((t) => (t ?? 1) - 1), 1000)
    return () => clearTimeout(t)
  }, [timerRunning, timeLeft])

  const formatSeconds = (s: number) => {
    const m = Math.floor(s / 60)
    const ss = s % 60
    return `${m}:${ss.toString().padStart(2, '0')}`
  }

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmit = async () => {
    if (!activity) return

    setSubmitting(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/team/activities/${activityId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Submission failed')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < (activity?.questions.length || 0)) {
      setCurrentQuestionIndex(index)
    }
  }

  const isQuestionAnswered = (questionId: string) => {
    return answers[questionId] !== undefined
  }

  const getProgress = () => {
    if (!activity) return 0
    const answeredCount = activity.questions.filter(q => isQuestionAnswered(q.id)).length
    return Math.round((answeredCount / activity.questions.length) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading activity...</p>
        </div>
      </div>
    )
  }

  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Activity not found</p>
          <Link href="/team/activities" className="mt-4 text-blue-600 hover:underline">
            Back to Activities
          </Link>
        </div>
      </div>
    )
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Activity Completed!</h1>
              <p className="text-xl text-gray-600">{activity.title}</p>
              <div className="mt-6 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl p-6">
                <p className="text-lg font-medium">Total Score</p>
                <p className="text-5xl font-bold">{result.score} pts</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <h2 className="text-xl font-bold text-gray-800">Results by Question</h2>
              <div className="mb-2">
                <label className="inline-flex items-center space-x-2 text-sm text-gray-600">
                  <input type="checkbox" onChange={(e) => setShowDetailed(e.target.checked)} />
                  <span>Show detailed explanations</span>
                </label>
              </div>
              {activity.questions.map((question, index) => {
                const questionResult = result.perQuestion.find(r => r.questionId === question.id)
                const explanation = result.explanations.find(e => e.questionId === question.id)
                
                return (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-800">
                        Question {index + 1}: {
                          typeof question.prompt === 'object' 
                            ? question.prompt.text 
                            : 'See details'
                        }
                      </h3>
                      <div className="flex items-center space-x-2">
                        {questionResult?.correct ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className="font-bold">
                          {questionResult?.points || 0}/{question.points} pts
                        </span>
                      </div>
                    </div>
                    {explanation && (
                      <ExplanationPanel
                        type={question.type}
                        explanation={explanation.ai}
                        meta={explanation.meta}
                        detailed={showDetailed}
                      />
                    )}
                  </div>
                )
              })}
            </div>

            <Link
              href="/team/activities"
              className="flex items-center justify-center w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Activities
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = activity.questions[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/team/activities" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{activity.title}</h1>
                <p className="text-sm text-gray-600">{activity.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {activity.questions.length}
              </div>
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-lg shadow p-2">
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${getProgress()}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
            <p>{getProgress()}% Complete</p>
            <p className="font-medium">Time Left: {timeLeft !== null ? formatSeconds(timeLeft) : '--:--'}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">
                Question {currentQuestionIndex + 1}
              </span>
              <span className="text-sm font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                {currentQuestion.points} points
              </span>
            </div>
          </div>

          {/* Question Component */}
          {currentQuestion.type === 'MCQ' && (
            <MCQQuestion
              question={currentQuestion}
              value={answers[currentQuestion.id]}
              onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            />
          )}
          {currentQuestion.type === 'CHECKBOX' && (
            <CheckboxQuestion
              question={currentQuestion}
              value={answers[currentQuestion.id]}
              onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            />
          )}
          {currentQuestion.type === 'TRUE_FALSE' && (
            <TrueFalseQuestion
              question={currentQuestion}
              value={answers[currentQuestion.id]}
              onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            />
          )}
          {currentQuestion.type === 'GRID_PATH' && (
            <GridPathQuestion
              question={currentQuestion}
              value={answers[currentQuestion.id]}
              onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            />
          )}
        </div>

        {/* Question Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => goToQuestion(currentQuestionIndex - 1)}
            disabled={currentQuestionIndex === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          <div className="flex space-x-2">
            {activity.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => goToQuestion(index)}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-blue-600 text-white'
                    : isQuestionAnswered(activity.questions[index].id)
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => goToQuestion(currentQuestionIndex + 1)}
            disabled={currentQuestionIndex === activity.questions.length - 1}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Next</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={submitting || getProgress() < 100}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {submitting ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-5 w-5 mr-2" />
              Submit All Answers
            </>
          )}
        </button>
        
        {getProgress() < 100 && (
          <p className="text-center text-sm text-gray-500 mt-2">
            Please answer all questions before submitting
          </p>
        )}
      </div>
    </div>
  )
}
