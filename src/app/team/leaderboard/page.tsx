'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Trophy, Medal, Award, ArrowLeft, RefreshCw, Users } from 'lucide-react'

interface LeaderboardEntry {
  rank: number
  teamId: string
  teamCode: string
  teamName: string
  score: number
  lastUpdated: string
}

export default function TeamLeaderboardPage() {
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [eventName, setEventName] = useState('')
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastRefresh, setLastRefresh] = useState(new Date())

  useEffect(() => {
    const team = localStorage.getItem('team')
    if (team) {
      const teamData = JSON.parse(team)
      setCurrentTeamId(teamData.id)
    }
    
    loadLeaderboard()
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadLeaderboard, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadLeaderboard = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/team')
        return
      }

      const res = await fetch('/api/team/leaderboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/team')
          return
        }
        if (res.status === 403) {
          setError('Leaderboard is not visible to teams yet')
          return
        }
        throw new Error('Failed to load leaderboard')
      }

      const data = await res.json()
      setLeaderboard(data.leaderboard || [])
      setEventName(data.event?.name || 'AI Awareness Event')
      setLastRefresh(new Date())
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-orange-500" />
      default:
        return <span className="text-lg font-bold text-gray-500">#{rank}</span>
    }
  }

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300'
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300'
      case 3:
        return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300'
      default:
        return 'bg-white hover:bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leaderboard...</p>
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
              <Link href="/team/activities" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Leaderboard</h1>
                <p className="text-sm text-gray-600">{eventName}</p>
              </div>
            </div>
            <button
              onClick={loadLeaderboard}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <RefreshCw className="h-5 w-5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Last Updated */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
            {error}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No teams have submitted yet</p>
            <p className="text-sm text-gray-500 mt-2">Be the first to complete activities!</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {/* Second Place */}
                <div className="mt-8">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl p-4 text-center">
                    <Medal className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                    <p className="font-bold text-gray-800">{leaderboard[1]?.teamName}</p>
                    <p className="text-sm text-gray-600">{leaderboard[1]?.teamCode}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-2">
                      {leaderboard[1]?.score} pts
                    </p>
                  </div>
                  <div className="bg-gray-300 text-gray-700 text-center py-2 rounded-b-xl font-bold">
                    2nd
                  </div>
                </div>

                {/* First Place */}
                <div>
                  <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-t-xl p-4 text-center">
                    <Trophy className="h-16 w-16 text-yellow-600 mx-auto mb-2" />
                    <p className="font-bold text-gray-800">{leaderboard[0]?.teamName}</p>
                    <p className="text-sm text-gray-600">{leaderboard[0]?.teamCode}</p>
                    <p className="text-3xl font-bold text-yellow-700 mt-2">
                      {leaderboard[0]?.score} pts
                    </p>
                  </div>
                  <div className="bg-yellow-500 text-white text-center py-3 rounded-b-xl font-bold text-lg">
                    1st Place
                  </div>
                </div>

                {/* Third Place */}
                <div className="mt-8">
                  <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-t-xl p-4 text-center">
                    <Award className="h-12 w-12 text-orange-600 mx-auto mb-2" />
                    <p className="font-bold text-gray-800">{leaderboard[2]?.teamName}</p>
                    <p className="text-sm text-gray-600">{leaderboard[2]?.teamCode}</p>
                    <p className="text-2xl font-bold text-orange-700 mt-2">
                      {leaderboard[2]?.score} pts
                    </p>
                  </div>
                  <div className="bg-orange-500 text-white text-center py-2 rounded-b-xl font-bold">
                    3rd
                  </div>
                </div>
              </div>
            )}

            {/* Full Leaderboard */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4">
                <h2 className="text-lg font-bold flex items-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  Complete Rankings
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.teamId}
                    className={`p-4 flex items-center justify-between transition-colors ${
                      entry.teamId === currentTeamId
                        ? 'bg-blue-50 border-l-4 border-blue-500'
                        : getRankStyle(entry.rank)
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 flex justify-center">
                        {getRankIcon(entry.rank)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {entry.teamName}
                          {entry.teamId === currentTeamId && (
                            <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                              YOUR TEAM
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-600">Team {entry.teamCode}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-800">
                        {entry.score}
                      </p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
