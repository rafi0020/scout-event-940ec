'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Trophy, ArrowLeft, RefreshCw, Download, Users,
  CheckCircle, Clock, TrendingUp 
} from 'lucide-react'

interface Activity {
  id: string
  title: string
  order: number
}

interface LeaderboardEntry {
  rank: number
  teamId: string
  teamCode: string
  teamName: string
  totalScore: number
  activityScores: Record<string, number>
  submissionCount: number
  lastActivity: number | null
}

interface EventData {
  id: string
  name: string
  activities: Activity[]
  isOpen: boolean
  leaderboardVisibility: string
}

export default function AdminLeaderboardPage() {
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [event, setEvent] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  useEffect(() => {
    loadLeaderboard()
    // Auto-refresh every 10 seconds
    const interval = setInterval(loadLeaderboard, 10000)
    return () => clearInterval(interval)
  }, [])

  const loadLeaderboard = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        router.push('/admin')
        return
      }

      const res = await fetch('/api/admin/leaderboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/admin')
          return
        }
        throw new Error('Failed to load leaderboard')
      }

      const data = await res.json()
      setLeaderboard(data.leaderboard || [])
      setEvent(data.event)
      setLastRefresh(new Date())
    } catch (err) {
      console.error('Error loading leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = () => {
    if (!leaderboard || !event) return

    // Create CSV content
    const headers = ['Rank', 'Team Code', 'Team Name', 'Total Score']
    event.activities.forEach(activity => {
      headers.push(`Sprint ${activity.order}: ${activity.title}`)
    })
    headers.push('Submissions', 'Last Activity')

    const rows = leaderboard.map(entry => {
      const row = [
        entry.rank,
        entry.teamCode,
        entry.teamName,
        entry.totalScore
      ]
      
      event.activities.forEach(activity => {
        row.push(entry.activityScores[activity.id] || 0)
      })
      
      row.push(entry.submissionCount)
      row.push(entry.lastActivity ? new Date(entry.lastActivity).toLocaleString() : 'N/A')
      
      return row
    })

    // Generate CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leaderboard_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leaderboard...</p>
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
                <h1 className="text-xl font-bold text-gray-800">Admin Leaderboard</h1>
                <p className="text-sm text-gray-600">{event?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadLeaderboard}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Refresh</span>
              </button>
              <button
                onClick={exportCSV}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Download className="h-5 w-5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm font-medium text-gray-600">Total Teams</p>
            <p className="text-2xl font-bold text-indigo-600">{leaderboard.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm font-medium text-gray-600">Average Score</p>
            <p className="text-2xl font-bold text-green-600">
              {leaderboard.length > 0 
                ? Math.round(leaderboard.reduce((sum, e) => sum + e.totalScore, 0) / leaderboard.length)
                : 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm font-medium text-gray-600">Top Score</p>
            <p className="text-2xl font-bold text-yellow-600">
              {leaderboard[0]?.totalScore || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm font-medium text-gray-600">Last Update</p>
            <p className="text-sm font-bold text-gray-800">
              {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Leaderboard Table */}
        {leaderboard.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No teams have registered yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Score
                    </th>
                    {event?.activities.map(activity => (
                      <th key={activity.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sprint {activity.order}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Activity
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboard.map((entry) => (
                    <tr key={entry.teamId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {entry.rank === 1 && <Trophy className="h-5 w-5 text-yellow-500 mr-2" />}
                          {entry.rank === 2 && <Trophy className="h-5 w-5 text-gray-400 mr-2" />}
                          {entry.rank === 3 && <Trophy className="h-5 w-5 text-orange-500 mr-2" />}
                          <span className="text-sm font-medium text-gray-900">#{entry.rank}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{entry.teamName}</div>
                          <div className="text-sm text-gray-500">{entry.teamCode}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-lg font-bold text-indigo-600">{entry.totalScore}</span>
                      </td>
                      {event?.activities.map(activity => (
                        <td key={activity.id} className="px-6 py-4 whitespace-nowrap text-center">
                          {entry.activityScores[activity.id] ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {entry.activityScores[activity.id]} pts
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              -
                            </span>
                          )}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          <div className="flex space-x-1">
                            {Array.from({ length: event?.activities.length || 0 }).map((_, idx) => {
                              const activity = event?.activities[idx]
                              const hasScore = activity && entry.activityScores[activity.id] > 0
                              return (
                                <div
                                  key={idx}
                                  className={`w-2 h-2 rounded-full ${
                                    hasScore ? 'bg-green-500' : 'bg-gray-300'
                                  }`}
                                />
                              )
                            })}
                          </div>
                          <span className="ml-2 text-xs text-gray-600">
                            {entry.submissionCount}/{event?.activities.length}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                        {entry.lastActivity ? (
                          <div className="flex items-center justify-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {new Date(entry.lastActivity).toLocaleTimeString()}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Legend</h3>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <span className="text-gray-600">Activity Completed</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-gray-300 mr-2"></div>
              <span className="text-gray-600">Activity Pending</span>
            </div>
            <div className="flex items-center">
              <Trophy className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="text-gray-600">Top 3 Teams</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
