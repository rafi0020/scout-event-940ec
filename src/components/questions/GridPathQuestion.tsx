'use client'

import { useState, useEffect } from 'react'
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, Target, MapPin } from 'lucide-react'

interface GridConfig {
  gridSize: [number, number]
  start: [number, number]
  goal: [number, number]
  water?: number[][]
  stepCost: number
  goalReward: number
  waterPenalty: number
}

interface GridPathQuestionProps {
  question: {
    id: string
    prompt: GridConfig
    points: number
  }
  value?: { moves: string[] }
  onChange: (value: { moves: string[] }) => void
}

export default function GridPathQuestion({ question, value, onChange }: GridPathQuestionProps) {
  const config = question.prompt
  const [currentPos, setCurrentPos] = useState<[number, number]>(config.start)
  const [path, setPath] = useState<[number, number][]>([config.start])
  const [moves, setMoves] = useState<string[]>(value?.moves || [])
  const [reward, setReward] = useState(0)
  const [waterHits, setWaterHits] = useState(0)

  useEffect(() => {
    // Recalculate path when moves change
    simulatePath(moves)
  }, [moves])

  const simulatePath = (moveList: string[]) => {
    let pos = [...config.start] as [number, number]
    const newPath = [pos]
    let newReward = 0
    let newWaterHits = 0

    for (const move of moveList) {
      const nextPos = getNextPosition(pos, move)
      if (isValidPosition(nextPos)) {
        pos = nextPos
        newPath.push(pos)
        newReward += config.stepCost

        if (isWater(pos)) {
          newReward += config.waterPenalty
          newWaterHits++
        }

        if (pos[0] === config.goal[0] && pos[1] === config.goal[1]) {
          newReward += config.goalReward
          break
        }
      }
    }

    setCurrentPos(pos)
    setPath(newPath)
    setReward(newReward)
    setWaterHits(newWaterHits)
  }

  const getNextPosition = (pos: [number, number], direction: string): [number, number] => {
    switch (direction.toUpperCase()) {
      case 'U': return [pos[0] - 1, pos[1]]
      case 'D': return [pos[0] + 1, pos[1]]
      case 'L': return [pos[0], pos[1] - 1]
      case 'R': return [pos[0], pos[1] + 1]
      default: return pos
    }
  }

  const isValidPosition = (pos: [number, number]) => {
    return pos[0] >= 1 && pos[0] <= config.gridSize[0] &&
           pos[1] >= 1 && pos[1] <= config.gridSize[1]
  }

  const isWater = (pos: [number, number]) => {
    return config.water?.some(w => w[0] === pos[0] && w[1] === pos[1]) || false
  }

  const addMove = (direction: string) => {
    if (currentPos[0] === config.goal[0] && currentPos[1] === config.goal[1]) {
      return // Already at goal
    }
    
    const newMoves = [...moves, direction]
    setMoves(newMoves)
    onChange({ moves: newMoves })
  }

  const removeLastMove = () => {
    if (moves.length > 0) {
      const newMoves = moves.slice(0, -1)
      setMoves(newMoves)
      onChange({ moves: newMoves })
    }
  }

  const reset = () => {
    setMoves([])
    onChange({ moves: [] })
  }

  const getCellClass = (row: number, col: number) => {
    const isStart = row === config.start[0] && col === config.start[1]
    const isGoal = row === config.goal[0] && col === config.goal[1]
    const isCurrent = row === currentPos[0] && col === currentPos[1]
    const isInPath = path.some(p => p[0] === row && p[1] === col)
    const isWaterCell = isWater([row, col])

    if (isGoal) return 'bg-green-500 border-green-600'
    if (isStart && isCurrent) return 'bg-yellow-500 border-yellow-600'
    if (isCurrent) return 'bg-blue-500 border-blue-600'
    if (isWaterCell && isInPath) return 'bg-purple-400 border-purple-500'
    if (isWaterCell) return 'bg-cyan-200 border-cyan-300'
    if (isInPath) return 'bg-yellow-200 border-yellow-300'
    return 'bg-white border-gray-300'
  }

  const onCellClick = (row: number, col: number) => {
    // Compute a shortest direction step toward clicked cell when adjacent
    const dr = row - currentPos[0]
    const dc = col - currentPos[1]
    let dir: string | null = null
    if (Math.abs(dr) + Math.abs(dc) !== 1) return // only adjacent clicks
    if (dr === -1 && dc === 0) dir = 'U'
    if (dr === 1 && dc === 0) dir = 'D'
    if (dr === 0 && dc === -1) dir = 'L'
    if (dr === 0 && dc === 1) dir = 'R'
    if (!dir) return
    addMove(dir)
  }

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Navigate to the Goal!</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• Use arrow buttons to move the character</p>
          <p>• Reach the green goal with maximum reward</p>
          <p>• Avoid water cells (cyan) - they reduce your score!</p>
          <p>• Each step costs {Math.abs(config.stepCost)} point</p>
          <p>• Water penalty: {Math.abs(config.waterPenalty)} points</p>
          <p>• Goal reward: +{config.goalReward} points</p>
        </div>
      </div>

      {/* Grid */}
      <div className="flex justify-center">
        <div className="inline-block p-4 bg-gray-100 rounded-lg">
          <div className="grid gap-1" style={{
            gridTemplateColumns: `repeat(${config.gridSize[1]}, minmax(0, 1fr))`
          }}>
            {Array.from({ length: config.gridSize[0] }, (_, row) => 
              Array.from({ length: config.gridSize[1] }, (_, col) => (
                <div
                  key={`${row + 1}-${col + 1}`}
                  onClick={() => onCellClick(row + 1, col + 1)}
                  className={`w-12 h-12 border-2 rounded flex items-center justify-center transition-all cursor-pointer ${
                    getCellClass(row + 1, col + 1)
                  }`}
                >
                  {row + 1 === config.start[0] && col + 1 === config.start[1] && (
                    <MapPin className="h-6 w-6" />
                  )}
                  {row + 1 === config.goal[0] && col + 1 === config.goal[1] && (
                    <Target className="h-6 w-6" />
                  )}
                  {row + 1 === currentPos[0] && col + 1 === currentPos[1] && 
                   !(row + 1 === config.start[0] && col + 1 === config.start[1]) &&
                   !(row + 1 === config.goal[0] && col + 1 === config.goal[1]) && (
                    <div className="w-3 h-3 bg-white rounded-full" />
                  )}
                </div>
              ))
            ).flat()}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-8">
        <div className="grid grid-cols-3 gap-2">
          <div />
          <button
            onClick={() => addMove('U')}
            className="p-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            disabled={currentPos[0] === config.goal[0] && currentPos[1] === config.goal[1]}
          >
            <ArrowUp className="h-6 w-6" />
          </button>
          <div />
          <button
            onClick={() => addMove('L')}
            className="p-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            disabled={currentPos[0] === config.goal[0] && currentPos[1] === config.goal[1]}
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <button
            onClick={() => addMove('D')}
            className="p-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            disabled={currentPos[0] === config.goal[0] && currentPos[1] === config.goal[1]}
          >
            <ArrowDown className="h-6 w-6" />
          </button>
          <button
            onClick={() => addMove('R')}
            className="p-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            disabled={currentPos[0] === config.goal[0] && currentPos[1] === config.goal[1]}
          >
            <ArrowRight className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-2">
          <button
            onClick={removeLastMove}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
            disabled={moves.length === 0}
          >
            Undo Last Move
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Path
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Steps</p>
          <p className="text-xl font-bold">{moves.length}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-600">Water Hits</p>
          <p className="text-xl font-bold text-blue-800">{waterHits}</p>
        </div>
        <div className={`p-3 rounded-lg ${reward >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className={`text-sm ${reward >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Total Reward
          </p>
          <p className={`text-xl font-bold ${reward >= 0 ? 'text-green-800' : 'text-red-800'}`}>
            {reward > 0 ? '+' : ''}{reward}
          </p>
        </div>
      </div>

      {/* Path Display */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-sm font-medium text-gray-600 mb-1">Your Path:</p>
        <p className="font-mono text-sm">
          {moves.length > 0 ? moves.join(', ') : 'No moves yet'}
        </p>
      </div>

      {currentPos[0] === config.goal[0] && currentPos[1] === config.goal[1] && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-center">
          🎯 Goal Reached! Your reward: {reward} points
        </div>
      )}
    </div>
  )
}
