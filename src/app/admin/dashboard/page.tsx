'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Shield, Users, Trophy, Activity, Settings, LogOut,
  Play, Pause, Eye, EyeOff, RefreshCw, Download
} from 'lucide-react'

interface Event {
  id: string
  name: string
  isOpen: boolean
  leaderboardVisibility: 'ADMIN_ONLY' | 'TEAMS'
  activities: any[]
  scores: any[]
}

interface Stats {
  totalTeams: number
  activitiesCreated: number
  averageScore: number
  completionRate: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadEventData()
    // Poll for updates every 10 seconds
    const interval = setInterval(loadEventData, 10000)
    return () => clearInterval(interval)
  }, [])

  const loadEventData = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        router.push('/admin')
        return
      }

      const res = await fetch('/api/admin/event', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/admin')
          return
        }
        throw new Error('Failed to load event')
      }

      const data = await res.json()
      setEvent(data.event)
      
      // Calculate stats
      if (data.event) {
        const teams = data.event.scores?.length || 0
        const activities = data.event.activities?.length || 0
        const totalScore = data.event.scores?.reduce((sum: number, s: any) => sum + s.total, 0) || 0
        const avgScore = teams > 0 ? Math.round(totalScore / teams) : 0
        
        setStats({
          totalTeams: teams,
          activitiesCreated: activities,
          averageScore: avgScore,
          completionRate: 0 // Would need submission data to calculate
        })
      }
    } catch (err) {
      console.error('Error loading event:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleEventStatus = async () => {
    if (!event) return
    setUpdating(true)

    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/event', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isOpen: !event.isOpen
        })
      })

      if (res.ok) {
        const data = await res.json()
        setEvent(data.event)
      }
    } catch (err) {
      console.error('Error updating event:', err)
    } finally {
      setUpdating(false)
    }
  }

  const toggleLeaderboardVisibility = async () => {
    if (!event) return
    setUpdating(true)

    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/event', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          leaderboardVisibility: event.leaderboardVisibility === 'ADMIN_ONLY' ? 'TEAMS' : 'ADMIN_ONLY'
        })
      })

      if (res.ok) {
        const data = await res.json()
        setEvent(data.event)
      }
    } catch (err) {
      console.error('Error updating visibility:', err)
    } finally {
      setUpdating(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    router.push('/admin')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
              <Shield className="h-8 w-8 text-indigo-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">{event?.name || 'Scout AI Event'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Teams</p>
                <p className="text-3xl font-bold text-indigo-600">{stats?.totalTeams || 0}</p>
              </div>
              <Users className="h-8 w-8 text-indigo-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activities</p>
                <p className="text-3xl font-bold text-green-600">{stats?.activitiesCreated || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Score</p>
                <p className="text-3xl font-bold text-yellow-600">{stats?.averageScore || 0}</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Event Status</p>
                <p className={`text-xl font-bold ${event?.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                  {event?.isOpen ? 'OPEN' : 'CLOSED'}
                </p>
              </div>
              <Settings className="h-8 w-8 text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Event Controls</h2>
          </div>
          <div className="p-6 space-y-4">
            {/* Event Status Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-800">Event Status</h3>
                <p className="text-sm text-gray-600">
                  {event?.isOpen ? 'Teams can register and submit activities' : 'Event is closed to teams'}
                </p>
              </div>
              <button
                onClick={toggleEventStatus}
                disabled={updating}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                  event?.isOpen
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                } disabled:opacity-50`}
              >
                {event?.isOpen ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Close Event
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Open Event
                  </>
                )}
              </button>
            </div>

            {/* Leaderboard Visibility Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-800">Leaderboard Visibility</h3>
                <p className="text-sm text-gray-600">
                  {event?.leaderboardVisibility === 'TEAMS' 
                    ? 'Teams can view the leaderboard'
                    : 'Leaderboard is admin-only'}
                </p>
              </div>
              <button
                onClick={toggleLeaderboardVisibility}
                disabled={updating}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                  event?.leaderboardVisibility === 'TEAMS'
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                } disabled:opacity-50`}
              >
                {event?.leaderboardVisibility === 'TEAMS' ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide from Teams
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Show to Teams
                  </>
                )}
              </button>
            </div>

            {/* Refresh Data */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-800">Refresh Data</h3>
                <p className="text-sm text-gray-600">Update dashboard with latest information</p>
              </div>
              <button
                onClick={loadEventData}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/activities" className="group">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800 group-hover:text-indigo-600">
                    Manage Activities
                  </h3>
                  <p className="text-sm text-gray-600">Create and edit activity questions</p>
                </div>
                <Activity className="h-6 w-6 text-gray-400 group-hover:text-indigo-600" />
              </div>
            </div>
          </Link>

          <Link href="/admin/leaderboard" className="group">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800 group-hover:text-indigo-600">
                    View Leaderboard
                  </h3>
                  <p className="text-sm text-gray-600">See team rankings and scores</p>
                </div>
                <Trophy className="h-6 w-6 text-gray-400 group-hover:text-indigo-600" />
              </div>
            </div>
          </Link>

          <Link href="/admin/export" className="group">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800 group-hover:text-indigo-600">
                    Export Results
                  </h3>
                  <p className="text-sm text-gray-600">Download CSV reports</p>
                </div>
                <Download className="h-6 w-6 text-gray-400 group-hover:text-indigo-600" />
              </div>
            </div>
          </Link>

          <Link href="/admin/teams" className="group">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800 group-hover:text-indigo-600">
                    Manage Teams
                  </h3>
                  <p className="text-sm text-gray-600">Edit or delete team profiles</p>
                </div>
                <Users className="h-6 w-6 text-gray-400 group-hover:text-indigo-600" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
