import { prisma } from './db'
import { hashPassword } from './auth'

async function seed() {
  console.log('🌱 Starting seed...')
  
  try {
    // Create default admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@scout.event'
    const adminPassword = process.env.ADMIN_PASSWORD || 'Scout2025Admin!'
    
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })
    
    if (!existingAdmin) {
      const hashedPassword = await hashPassword(adminPassword)
      await prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash: hashedPassword,
          role: 'ADMIN'
        }
      })
      console.log('✅ Admin user created:', adminEmail)
    } else {
      console.log('ℹ️  Admin user already exists')
    }
    
    // Create a sample event if none exists
    const eventCount = await prisma.event.count()
    
    if (eventCount === 0) {
      const event = await prisma.event.create({
        data: {
          name: 'Bangladesh Scout AI Awareness Event 2025',
          isOpen: false,
          leaderboardVisibility: 'ADMIN_ONLY'
        }
      })
      console.log('✅ Sample event created')
      
      // Create sample activities with questions
      const activities = [
        {
          title: 'Sprint 1: Pattern Hunt',
          description: 'Learn how AI recognizes patterns through supervised learning',
          order: 1,
          questions: [
            {
              type: 'MCQ' as const,
              prompt: {
                text: 'An AI sees these training examples: Triangle+Green→A, Square+Blue→B, Triangle+Blue→A. What label would it give to: Triangle+Red?',
                hint: 'Look for the pattern in the shapes'
              },
              options: ['A', 'B', 'Not sure'],
              points: 2,
              order: 1,
              aiAnswerKey: { correct: 0 },
              aiExplanation: {
                kind: 'decisionRule',
                ruleText: 'Triangle → A',
                why: 'The AI learned that triangles always get label A, regardless of color'
              }
            },
            {
              type: 'TRUE_FALSE' as const,
              prompt: {
                text: 'True or False: An AI trained only on daytime photos of cars will work perfectly on nighttime photos.'
              },
              options: undefined,
              points: 2,
              order: 2,
              aiAnswerKey: { correct: false },
              aiExplanation: {
                kind: 'concept',
                concept: 'Overfitting',
                why: 'AI needs diverse training data to work in different conditions'
              }
            }
          ]
        },
        {
          title: 'Sprint 2: Reward Runner',
          description: 'Explore reinforcement learning through path-finding challenges',
          order: 2,
          questions: [
            {
              type: 'GRID_PATH' as const,
              prompt: {
                gridSize: [5, 5],
                start: [5, 1],
                goal: [1, 5],
                water: [[2, 3], [3, 2], [4, 4]],
                stepCost: -1,
                goalReward: 10,
                waterPenalty: -3
              },
              options: undefined,
              points: 10,
              order: 1,
              aiAnswerKey: {
                optimalPath: 'U,U,U,U,R,R,R,R',
                optimalSteps: 8,
                optimalReward: 2
              },
              aiExplanation: {
                kind: 'pathOverlay',
                grid: { rows: 5, cols: 5, water: [[2, 3], [3, 2], [4, 4]] },
                optimalPath: 'U,U,U,U,R,R,R,R',
                math: 'Reward = +10 (goal) - 8 (steps) = +2'
              }
            }
          ]
        },
        {
          title: 'Sprint 3: Bias Detective',
          description: 'Discover fairness issues in AI training data',
          order: 3,
          questions: [
            {
              type: 'CHECKBOX' as const,
              prompt: {
                text: 'An AI trained on 100 Apple photos (all daytime) and 10 Guava photos (all nighttime) is failing. Which fixes would help? (Select all that apply)'
              },
              options: [
                'Add more daytime Guava photos',
                'Add more nighttime Apple photos', 
                'Remove all nighttime photos',
                'Use equal numbers of each fruit',
                'Test on both day and night photos'
              ],
              points: 5,
              order: 1,
              aiAnswerKey: { 
                correctSet: [0, 1, 3, 4],
                grading: 'partial'
              },
              aiExplanation: {
                kind: 'fairnessPanel',
                datasetSketch: {
                  apple_day: 100,
                  apple_night: 0,
                  guava_day: 0,
                  guava_night: 10
                },
                issues: ['class imbalance', 'confounding variable (time of day)'],
                whyFixes: [
                  'Adding diverse examples removes the confounding',
                  'Balance prevents the AI from just memorizing "day=apple"',
                  'Testing on both conditions reveals problems early'
                ]
              }
            }
          ]
        },
        {
          title: 'Sprint 4: Reality Check',
          description: 'Learn to identify AI-generated content and stay safe online',
          order: 4,
          questions: [
            {
              type: 'MCQ' as const,
              prompt: {
                text: 'You receive a video of your favorite celebrity asking for money. The lip-sync looks slightly off. What should you do?'
              },
              options: [
                'Send money immediately',
                'Share with all friends first',
                'Verify through official channels',
                'Assume it\'s real if it looks mostly good'
              ],
              points: 3,
              order: 1,
              aiAnswerKey: { correct: 2 },
              aiExplanation: {
                kind: 'safetyTip',
                principle: 'SCOUT - C: Check sources',
                redFlags: ['unusual request', 'imperfect lip-sync'],
                why: 'Deepfakes often have subtle flaws. Always verify unexpected requests through official channels.'
              }
            }
          ]
        }
      ]
      
      // Create activities
      for (const activityData of activities) {
        const { questions, ...activityFields } = activityData
        
        const activity = await prisma.activity.create({
          data: {
            ...activityFields,
            eventId: event.id,
            isFrozen: true, // Pre-frozen with answer keys
            questions: {
              create: questions
            }
          }
        })
        
        console.log(`✅ Created activity: ${activity.title}`)
      }
    }

    // Import v2 60-minute track if present
    try {
      const fs = await import('fs')
      const path = await import('path')
      const seedPath = path.resolve(process.cwd(), 'seed_v2_60.json')
      if (fs.existsSync(seedPath)) {
        const raw = fs.readFileSync(seedPath, 'utf-8')
        const json = JSON.parse(raw)
        console.log('📥 Found seed_v2_60.json, importing...')

        // Upsert event
        await prisma.event.upsert({
          where: { id: json.event.id },
          create: {
            id: json.event.id,
            name: json.event.name,
            isOpen: json.event.isOpen,
            leaderboardVisibility: json.event.leaderboardVisibility
          },
          update: {
            name: json.event.name,
            isOpen: json.event.isOpen,
            leaderboardVisibility: json.event.leaderboardVisibility
          }
        })

        // Remove existing data for that event in safe order
        // 1) Delete submissions tied to activities in this event
        await prisma.submission.deleteMany({
          where: {
            activity: { eventId: json.event.id }
          }
        })
        // 2) Delete scores tied to this event
        await prisma.score.deleteMany({ where: { eventId: json.event.id } })
        // 3) Delete activities for that event
        await prisma.activity.deleteMany({ where: { eventId: json.event.id } })

        // Create activities and questions
        for (const a of json.activities) {
          await prisma.activity.create({
            data: {
              id: a.id,
              eventId: a.eventId,
              title: a.title,
              description: a.description,
              order: a.order,
              isFrozen: a.isFrozen,
              questions: {
                create: a.questions.map((q: any, idx: number) => ({
                  id: q.id,
                  type: q.type,
                  prompt: q.prompt,
                  options: q.options ?? undefined,
                  points: q.points,
                  order: idx,
                  aiAnswerKey: q.aiAnswerKey ?? undefined,
                  aiExplanation: q.aiExplanation ?? undefined
                }))
              }
            }
          })
        }
        console.log('✅ Imported seed_v2_60.json')
      }
    } catch (e) {
      console.warn('⚠️  Could not import seed_v2_60.json', e)
    }
    
    console.log('🎉 Seed completed successfully!')
  } catch (error) {
    console.error('❌ Seed error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run seed if called directly
if (require.main === module) {
  seed()
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}
