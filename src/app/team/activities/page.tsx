'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Brain, Trophy, CheckCircle, Circle, Lock, 
  ArrowRight, LogOut, Users, Activity 
} from 'lucide-react'

interface Activity {
  id: string
  title: string
  description: string
  order: number
  questions: any[]
  isCompleted: boolean
  submission?: {
    score: number
  }
}

interface Team {
  id: string
  code: string
  displayName: string
}

export default function TeamActivitiesPage() {
  const router = useRouter()
  const [activities, setActivities] = useState<Activity[]>([])
  const [team, setTeam] = useState<Team | null>(null)
  const [eventName, setEventName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token')
      const teamData = localStorage.getItem('team')
      
      if (!token || !teamData) {
        router.push('/team')
        return
      }

      setTeam(JSON.parse(teamData))

      const res = await fetch('/api/team/activities', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/team')
          return
        }
        throw new Error('Failed to load activities')
      }

      const data = await res.json()
      setActivities(data.activities || [])
      setEventName(data.event?.name || 'AI Awareness Event')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('team')
    router.push('/team')
  }

  const getTotalScore = () => {
    return activities.reduce((sum, activity) => 
      sum + (activity.submission?.score || 0), 0
    )
  }

  const getCompletedCount = () => {
    return activities.filter(a => a.isCompleted).length
  }

  const getActivityIcon = (order: number) => {
    const icons = ['🔍', '🏃', '🕵️', '🔍']
    return icons[order - 1] || '📝'
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading activities...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Brain className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-800">{eventName}</h1>
                <p className="text-sm text-gray-600">Team: {team?.displayName} ({team?.code})</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/team/leaderboard"
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Trophy className="h-6 w-6" />
                <span className="hidden sm:inline font-medium">Leaderboard</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Score</p>
                <p className="text-3xl font-bold text-blue-600">{getTotalScore()}</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activities Completed</p>
                <p className="text-3xl font-bold text-green-600">{getCompletedCount()}/{activities.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Team Code</p>
                <p className="text-3xl font-bold text-indigo-600">{team?.code}</p>
              </div>
              <Users className="h-8 w-8 text-indigo-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">AI Awareness Sprints</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${
                activity.isCompleted ? 'opacity-90' : 'hover:shadow-xl hover:scale-105'
              }`}
            >
              {/* Activity Header */}
              <div className={`bg-gradient-to-r ${getActivityColor(activity.order)} p-6 text-white`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-3xl mb-2">{getActivityIcon(activity.order)}</div>
                    <h3 className="text-xl font-bold mb-2">{activity.title}</h3>
                    <p className="text-white/90 text-sm">{activity.description}</p>
                  </div>
                  {activity.isCompleted && (
                    <CheckCircle className="h-8 w-8 text-white/80" />
                  )}
                </div>
              </div>

              {/* Activity Body */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{activity.questions.length}</span> Questions
                  </div>
                  {activity.isCompleted && activity.submission && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Score</p>
                      <p className="text-xl font-bold text-green-600">
                        {activity.submission.score} pts
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                {activity.isCompleted ? (
                  <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-center font-medium">
                    ✅ Completed
                  </div>
                ) : (
                  <Link
                    href={`/team/activities/${activity.id}`}
                    className="flex items-center justify-center w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors group"
                  >
                    Start Activity
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
