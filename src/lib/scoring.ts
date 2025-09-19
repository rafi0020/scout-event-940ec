import { Question, ActivityType } from '@prisma/client'

// Type definitions for different answer formats
export interface MCQAnswer {
  selected: string | number
}

export interface CheckboxAnswer {
  selected: number[]
}

export interface TrueFalseAnswer {
  selected: boolean
}

export interface GridPathAnswer {
  moves: string[]
}

export interface MCQKey {
  correct: string | number
}

export interface CheckboxKey {
  correctSet: number[]
  grading: 'exact' | 'partial'
}

export interface TrueFalseKey {
  correct: boolean
}

export interface GridPathKey {
  optimalPath: string
  optimalSteps: number
  optimalReward: number
}

export interface GridConfig {
  gridSize: [number, number]
  start: [number, number]
  goal: [number, number]
  water?: number[][]
  stepCost: number
  goalReward: number
  waterPenalty: number
}

export interface ScoreResult {
  points: number
  meta: any
}

export interface SubmissionResult {
  total: number
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

// MCQ Scoring
export function scoreMCQ(
  userAnswer: MCQAnswer | undefined,
  key: MCQKey,
  maxPoints: number
): ScoreResult {
  if (!userAnswer || userAnswer.selected === undefined) {
    return { points: 0, meta: { correct: false, userAnswer: null } }
  }
  
  const correct = userAnswer.selected === key.correct
  return {
    points: correct ? maxPoints : 0,
    meta: { correct, userAnswer: userAnswer.selected, correctAnswer: key.correct }
  }
}

// Checkbox Scoring
export function scoreCheckbox(
  userAnswer: CheckboxAnswer | undefined,
  key: CheckboxKey,
  maxPoints: number
): ScoreResult {
  if (!userAnswer || !userAnswer.selected || !Array.isArray(userAnswer.selected)) {
    return { points: 0, meta: { correct: false, userAnswer: [] } }
  }
  
  const userSet = new Set(userAnswer.selected)
  const correctSet = new Set(key.correctSet)
  
  if (key.grading === 'exact') {
    // Exact match required
    const isExact = 
      userSet.size === correctSet.size &&
      [...userSet].every(x => correctSet.has(x))
    
    return {
      points: isExact ? maxPoints : 0,
      meta: {
        correct: isExact,
        userAnswer: userAnswer.selected,
        correctAnswer: key.correctSet,
        matches: [...userSet].filter(x => correctSet.has(x)).length
      }
    }
  } else {
    // Partial credit
    const intersection = [...userSet].filter(x => correctSet.has(x))
    const wrong = [...userSet].filter(x => !correctSet.has(x))
    const missed = [...correctSet].filter(x => !userSet.has(x))
    
    let points = 0
    if (wrong.length === 0 && missed.length === 0) {
      points = maxPoints // Perfect
    } else if (intersection.length > 0) {
      // Partial credit based on correct selections minus penalties
      const correctRatio = intersection.length / correctSet.size
      const penaltyRatio = wrong.length / correctSet.size
      points = Math.max(0, Math.floor(maxPoints * (correctRatio - penaltyRatio * 0.5)))
    }
    
    return {
      points,
      meta: {
        correct: points === maxPoints,
        userAnswer: userAnswer.selected,
        correctAnswer: key.correctSet,
        correctSelections: intersection.length,
        wrongSelections: wrong.length,
        missedSelections: missed.length
      }
    }
  }
}

// True/False Scoring
export function scoreTrueFalse(
  userAnswer: TrueFalseAnswer | undefined,
  key: TrueFalseKey,
  maxPoints: number
): ScoreResult {
  if (!userAnswer || userAnswer.selected === undefined) {
    return { points: 0, meta: { correct: false, userAnswer: null } }
  }
  
  const correct = userAnswer.selected === key.correct
  return {
    points: correct ? maxPoints : 0,
    meta: { correct, userAnswer: userAnswer.selected, correctAnswer: key.correct }
  }
}

// Grid Path Scoring
export function scoreGridPath(
  userAnswer: GridPathAnswer | undefined,
  key: GridPathKey,
  maxPoints: number,
  config: GridConfig
): ScoreResult {
  if (!userAnswer || !userAnswer.moves || !Array.isArray(userAnswer.moves)) {
    return { 
      points: 0, 
      meta: { 
        valid: false, 
        error: 'No moves provided',
        userPath: [],
        optimalPath: key.optimalPath
      } 
    }
  }
  
  const { gridSize, start, goal, water = [], stepCost, goalReward, waterPenalty } = config
  
  // Parse moves
  const moves = userAnswer.moves
  let pos = [...start]
  let steps = 0
  let reward = 0
  let valid = true
  let waterHits = 0
  let path = [pos.slice()]
  
  // Helper functions
  const inBounds = (p: number[]) => 
    p[0] >= 1 && p[0] <= gridSize[0] && p[1] >= 1 && p[1] <= gridSize[1]
  
  const isWater = (p: number[]) => 
    water.some(w => w[0] === p[0] && w[1] === p[1])
  
  const equals = (a: number[], b: number[]) => 
    a[0] === b[0] && a[1] === b[1]
  
  const move = (p: number[], dir: string): number[] => {
    const newPos = [...p]
    switch(dir.toUpperCase()) {
      case 'U': newPos[0]--; break
      case 'D': newPos[0]++; break
      case 'L': newPos[1]--; break
      case 'R': newPos[1]++; break
      default: return p
    }
    return newPos
  }
  
  // Simulate path
  for (const m of moves) {
    const next = move(pos, m)
    
    if (!inBounds(next)) {
      valid = false
      break
    }
    
    pos = next.slice()
    path.push(pos.slice())
    steps++
    reward += stepCost
    
    if (isWater(pos)) {
      reward += waterPenalty
      waterHits++
    }
    
    if (equals(pos, goal)) {
      reward += goalReward
      break
    }
  }
  
  // Check if goal reached
  const goalReached = equals(pos, goal)
  
  if (!valid || !goalReached) {
    return {
      points: 0,
      meta: {
        valid,
        goalReached,
        steps,
        waterHits,
        reward,
        userPath: path,
        optimalPath: key.optimalPath,
        error: !valid ? 'Invalid move (out of bounds)' : 'Goal not reached'
      }
    }
  }
  
  // Calculate points based on reward
  let points = 0
  if (reward >= key.optimalReward) {
    points = maxPoints // Optimal or better
  } else if (reward >= key.optimalReward - 2) {
    points = Math.floor(maxPoints * 0.8) // Near optimal
  } else if (reward >= key.optimalReward - 4) {
    points = Math.floor(maxPoints * 0.6) // Acceptable
  } else if (reward > 0) {
    points = Math.floor(maxPoints * 0.4) // Valid but inefficient
  } else {
    points = Math.floor(maxPoints * 0.2) // Valid but poor
  }
  
  return {
    points,
    meta: {
      valid: true,
      goalReached: true,
      steps,
      waterHits,
      reward,
      optimalReward: key.optimalReward,
      optimalSteps: key.optimalSteps,
      userPath: path,
      optimalPath: key.optimalPath,
      efficiency: Math.round((key.optimalReward / Math.max(reward, 1)) * 100)
    }
  }
}

// Main submission scoring function
export function scoreSubmission(
  questions: Question[],
  answers: Record<string, any>
): SubmissionResult {
  let total = 0
  const perQuestion = []
  const explanations = []
  
  for (const q of questions) {
    const userAnswer = answers[q.id]
    const key = q.aiAnswerKey as any
    
    if (!key) {
      // No answer key yet - skip scoring
      perQuestion.push({
        questionId: q.id,
        points: 0,
        correct: false
      })
      explanations.push({
        questionId: q.id,
        ai: q.aiExplanation,
        meta: { error: 'No answer key available' }
      })
      continue
    }
    
    let result: ScoreResult
    
    switch (q.type) {
      case 'MCQ':
        result = scoreMCQ(userAnswer, key, q.points)
        break
      
      case 'CHECKBOX':
        result = scoreCheckbox(userAnswer, key, q.points)
        break
      
      case 'TRUE_FALSE':
        result = scoreTrueFalse(userAnswer, key, q.points)
        break
      
      case 'GRID_PATH':
        const config = q.prompt as unknown as GridConfig
        result = scoreGridPath(userAnswer, key, q.points, config)
        break
      
      default:
        result = { points: 0, meta: { error: 'Unknown question type' } }
    }
    
    total += result.points
    perQuestion.push({
      questionId: q.id,
      points: result.points,
      correct: result.meta.correct !== false
    })
    explanations.push({
      questionId: q.id,
      ai: q.aiExplanation,
      meta: result.meta
    })
  }
  
  return { total, perQuestion, explanations }
}
