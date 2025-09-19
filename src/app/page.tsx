import Link from 'next/link'
import { Users, Shield, Trophy, Brain } from 'lucide-react'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Brain className="h-20 w-20 text-indigo-600" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Scout AI Awareness Event
          </h1>
          <p className="text-xl text-gray-600">
            Bangladesh Scout Training Center
          </p>
          <p className="text-lg text-gray-500">
            Learn, Compete, and Discover AI Together!
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {/* Team Portal */}
          <Link href="/team" className="group">
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-transparent hover:border-blue-500 transition-all duration-300 hover:shadow-2xl">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Team Portal</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Join as a team to participate in AI awareness activities and compete for the top spot!
              </p>
              <div className="flex items-center text-blue-600 font-semibold">
                Enter Team Portal
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Admin Portal */}
          <Link href="/admin" className="group">
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-transparent hover:border-indigo-500 transition-all duration-300 hover:shadow-2xl">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                  <Shield className="h-8 w-8 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Admin Portal</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Manage activities, control the event, view real-time leaderboard, and export results.
              </p>
              <div className="flex items-center text-indigo-600 font-semibold">
                Enter Admin Portal
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Features */}
        <div className="bg-white/80 backdrop-blur rounded-xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Event Features</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span>Live Leaderboard</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Brain className="h-4 w-4 text-purple-500" />
              <span>4 AI Sprints</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Users className="h-4 w-4 text-green-500" />
              <span>Team Competition</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Shield className="h-4 w-4 text-red-500" />
              <span>Auto Scoring</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 pt-8">
          <p>© 2025 Bangladesh Scout Training Center</p>
          <p>AI Awareness Initiative</p>
        </div>
      </div>
    </main>
  )
}