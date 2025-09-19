'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Plus, Edit2, Trash2, Lock, Unlock, 
  ChevronDown, ChevronUp, Activity, Brain, AlertCircle
} from 'lucide-react'

interface Question {
  id: string
  type: string
  prompt: any
  options: any
  points: number
  order: number
  aiAnswerKey: any
  aiExplanation: any
}

interface ActivityData {
  id: string
  title: string
  description: string
  order: number
  isFrozen: boolean
  questions: Question[]
}

export default function AdminActivitiesPage() {
  const router = useRouter()
  const [activities, setActivities] = useState<ActivityData[]>([])
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadActivities()
  }, [])

  const loadActivities = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        router.push('/admin')
        return
      }

      const res = await fetch('/api/admin/activities', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/admin')
          return
        }
        throw new Error('Failed to load activities')
      }

      const data = await res.json()
      setActivities(data.activities || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const toggleFreeze = async (activityId: string, currentState: boolean) => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/admin/activities/${activityId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isFrozen: !currentState
        })
      })

      if (res.ok) {
        await loadActivities()
      }
    } catch (err) {
      console.error('Error toggling freeze:', err)
    }
  }

  const deleteActivity = async (activityId: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) {
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/admin/activities/${activityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (res.ok) {
        await loadActivities()
      } else {
        const error = await res.json()
        alert(`Error deleting activity: ${error.error}`)
      }
    } catch (err) {
      console.error('Error deleting activity:', err)
      alert('Failed to delete activity')
    }
  }

  const updateActivity = async (activityId: string, updates: { title?: string; description?: string }) => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/admin/activities/${activityId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      if (res.ok) {
        await loadActivities()
      } else {
        const error = await res.json()
        alert(`Error updating activity: ${error.error}`)
      }
    } catch (err) {
      console.error('Error updating activity:', err)
      alert('Failed to update activity')
    }
  }

  const createActivity = async (data: { title: string; description: string }) => {
    try {
      const token = localStorage.getItem('adminToken')
      
      // Get current event ID
      const eventRes = await fetch('/api/admin/event', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const eventData = await eventRes.json()
      
      const res = await fetch('/api/admin/activities', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          eventId: eventData.event.id,
          order: activities.length + 1
        })
      })

      if (res.ok) {
        await loadActivities()
      } else {
        const error = await res.json()
        alert(`Error creating activity: ${error.error}`)
      }
    } catch (err) {
      console.error('Error creating activity:', err)
      alert('Failed to create activity')
    }
  }

  const getActivityColor = (order: number) => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-purple-500 to-pink-500',
      'from-orange-500 to-red-500'
    ]
    return colors[order - 1] || 'from-gray-500 to-gray-600'
  }

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'MCQ': return '🎯'
      case 'CHECKBOX': return '☑️'
      case 'TRUE_FALSE': return '⚖️'
      case 'GRID_PATH': return '🗺️'
      default: return '❓'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading activities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Activity Management</h1>
                <p className="text-sm text-gray-600">Create and manage event activities</p>
              </div>
            </div>
            <button
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              onClick={() => {
                const title = prompt('Enter activity title:')
                if (title) {
                  const description = prompt('Enter activity description:')
                  if (description) {
                    createActivity({ title, description })
                  }
                }
              }}
            >
              <Plus className="h-5 w-5" />
              <span>New Activity</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {activities.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No activities created yet</p>
            <p className="text-sm text-gray-500 mt-2">Click "New Activity" to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="bg-white rounded-lg shadow overflow-hidden">
                {/* Activity Header */}
                <div className={`bg-gradient-to-r ${getActivityColor(activity.order)} p-4 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">Sprint {activity.order}</span>
                      <h3 className="text-lg font-bold">{activity.title}</h3>
                      {activity.isFrozen ? (
                        <span className="flex items-center text-sm bg-white/20 px-2 py-1 rounded">
                          <Lock className="h-3 w-3 mr-1" />
                          Frozen
                        </span>
                      ) : (
                        <span className="flex items-center text-sm bg-white/20 px-2 py-1 rounded">
                          <Unlock className="h-3 w-3 mr-1" />
                          Editable
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setExpandedActivity(
                        expandedActivity === activity.id ? null : activity.id
                      )}
                      className="text-white hover:bg-white/20 p-2 rounded transition-colors"
                    >
                      {expandedActivity === activity.id ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-white/90 text-sm mt-2">{activity.description}</p>
                </div>

                {/* Activity Body */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{activity.questions.length}</span> Questions
                      {' • '}
                      <span className="font-medium">
                        {activity.questions.reduce((sum, q) => sum + q.points, 0)}
                      </span> Points Total
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleFreeze(activity.id, activity.isFrozen)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          activity.isFrozen
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        }`}
                      >
                        {activity.isFrozen ? 'Unfreeze' : 'Freeze'}
                      </button>
                      <button
                        className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
                        onClick={() => {
                          const newTitle = prompt('Enter new title:', activity.title)
                          if (newTitle && newTitle !== activity.title) {
                            updateActivity(activity.id, { title: newTitle })
                          }
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                        onClick={() => deleteActivity(activity.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Questions List */}
                  {expandedActivity === activity.id && (
                    <div className="border-t pt-4 space-y-3">
                      {activity.questions.map((question, idx) => (
                        <div key={question.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-lg">{getQuestionTypeIcon(question.type)}</span>
                                <span className="text-sm font-medium text-gray-700">
                                  Q{idx + 1}: {question.type}
                                </span>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  {question.points} pts
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {typeof question.prompt === 'string' 
                                  ? question.prompt 
                                  : question.prompt?.text || 'Complex prompt'}
                              </p>
                              {question.aiAnswerKey && (
                                <div className="mt-2 flex items-center text-xs text-green-600">
                                  <Brain className="h-3 w-3 mr-1" />
                                  AI Key Generated
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
