'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Download, FileSpreadsheet, FileText, 
  Calendar, Users, Trophy, Activity
} from 'lucide-react'

interface ExportData {
  teams: number
  activities: number
  submissions: number
  averageScore: number
  eventName: string
  eventStatus: boolean
}

export default function AdminExportPage() {
  const router = useRouter()
  const [exportData, setExportData] = useState<ExportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    loadExportData()
  }, [])

  const loadExportData = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        router.push('/admin')
        return
      }

      // Get leaderboard data for export preview
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
        throw new Error('Failed to load data')
      }

      const data = await res.json()
      
      // Calculate summary statistics
      const teams = data.leaderboard?.length || 0
      const activities = data.event?.activities?.length || 0
      const totalSubmissions = data.leaderboard?.reduce(
        (sum: number, team: any) => sum + team.submissionCount, 0
      ) || 0
      const avgScore = teams > 0 
        ? Math.round(data.leaderboard.reduce(
            (sum: number, team: any) => sum + team.totalScore, 0
          ) / teams)
        : 0

      setExportData({
        teams,
        activities,
        submissions: totalSubmissions,
        averageScore: avgScore,
        eventName: data.event?.name || 'AI Event',
        eventStatus: data.event?.isOpen || false
      })
    } catch (err) {
      console.error('Error loading export data:', err)
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = async (type: string) => {
    setExporting(true)
    
    try {
      const token = localStorage.getItem('adminToken')
      
      // Get the data
      const res = await fetch('/api/admin/leaderboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error('Failed to fetch data')
      }

      const data = await res.json()
      
      let csvContent = ''
      const timestamp = new Date().toISOString().split('T')[0]
      let filename = ''

      if (type === 'leaderboard') {
        // Export leaderboard
        const headers = ['Rank', 'Team Code', 'Team Name', 'Total Score', 'Activities Completed', 'Last Activity']
        const rows = data.leaderboard.map((entry: any) => [
          entry.rank,
          entry.teamCode,
          entry.teamName,
          entry.totalScore,
          entry.submissionCount,
          entry.lastActivity ? new Date(entry.lastActivity).toLocaleString() : 'N/A'
        ])
        
        csvContent = [
          headers.join(','),
          ...rows.map((row: any[]) => row.map(cell => `"${cell}"`).join(','))
        ].join('\n')
        
        filename = `leaderboard_${timestamp}.csv`
        
      } else if (type === 'detailed') {
        // Export detailed activity scores
        const activities = data.event?.activities || []
        const headers = ['Team Code', 'Team Name', 'Total Score']
        activities.forEach((activity: any) => {
          headers.push(`Sprint ${activity.order}`)
        })
        headers.push('Submission Time')
        
        const rows = data.leaderboard.map((entry: any) => {
          const row = [entry.teamCode, entry.teamName, entry.totalScore]
          activities.forEach((activity: any) => {
            row.push(entry.activityScores[activity.id] || 0)
          })
          row.push(entry.lastActivity ? new Date(entry.lastActivity).toLocaleString() : 'N/A')
          return row
        })
        
        csvContent = [
          headers.join(','),
          ...rows.map((row: any[]) => row.map(cell => `"${cell}"`).join(','))
        ].join('\n')
        
        filename = `detailed_scores_${timestamp}.csv`
        
      } else if (type === 'summary') {
        // Export event summary
        const summaryData = [
          ['Event Summary Report'],
          ['Generated on', new Date().toLocaleString()],
          [''],
          ['Event Name', data.event?.name],
          ['Event Status', data.event?.isOpen ? 'Open' : 'Closed'],
          ['Leaderboard Visibility', data.event?.leaderboardVisibility],
          [''],
          ['Statistics'],
          ['Total Teams', data.leaderboard?.length || 0],
          ['Total Activities', data.event?.activities?.length || 0],
          ['Average Score', exportData?.averageScore || 0],
          ['Total Submissions', exportData?.submissions || 0],
          [''],
          ['Top 5 Teams'],
          ['Rank', 'Team', 'Score']
        ]
        
        const top5 = data.leaderboard.slice(0, 5).map((team: any) => [
          team.rank,
          `${team.teamName} (${team.teamCode})`,
          team.totalScore
        ])
        
        csvContent = [
          ...summaryData.map(row => row.map(cell => `"${cell}"`).join(',')),
          ...top5.map((row: any[]) => row.map(cell => `"${cell}"`).join(','))
        ].join('\n')
        
        filename = `event_summary_${timestamp}.csv`
      }

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
    } catch (err) {
      console.error('Export error:', err)
      alert('Failed to export data')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading export data...</p>
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
                <h1 className="text-xl font-bold text-gray-800">Export Data</h1>
                <p className="text-sm text-gray-600">Download event results and analytics</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Teams</p>
                <p className="text-2xl font-bold text-indigo-600">{exportData?.teams || 0}</p>
              </div>
              <Users className="h-8 w-8 text-indigo-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activities</p>
                <p className="text-2xl font-bold text-green-600">{exportData?.activities || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Submissions</p>
                <p className="text-2xl font-bold text-yellow-600">{exportData?.submissions || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold text-purple-600">{exportData?.averageScore || 0}</p>
              </div>
              <Trophy className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Leaderboard Export */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Trophy className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">
              Leaderboard Export
            </h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              Export team rankings and total scores
            </p>
            <button
              onClick={() => exportCSV('leaderboard')}
              disabled={exporting}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Download className="h-5 w-5" />
              <span>Download CSV</span>
            </button>
          </div>

          {/* Detailed Scores Export */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FileSpreadsheet className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">
              Detailed Scores
            </h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              Export scores per activity for all teams
            </p>
            <button
              onClick={() => exportCSV('detailed')}
              disabled={exporting}
              className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Download className="h-5 w-5" />
              <span>Download CSV</span>
            </button>
          </div>

          {/* Summary Report */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">
              Summary Report
            </h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              Export event summary and statistics
            </p>
            <button
              onClick={() => exportCSV('summary')}
              disabled={exporting}
              className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              <Download className="h-5 w-5" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>

        {/* Event Info */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Event Information</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-gray-600">Event Name</span>
              <span className="text-sm font-medium text-gray-800">{exportData?.eventName}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-gray-600">Event Status</span>
              <span className={`text-sm font-medium ${exportData?.eventStatus ? 'text-green-600' : 'text-red-600'}`}>
                {exportData?.eventStatus ? 'Open' : 'Closed'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-gray-600">Export Date</span>
              <span className="text-sm font-medium text-gray-800">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Export Time</span>
              <span className="text-sm font-medium text-gray-800">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
