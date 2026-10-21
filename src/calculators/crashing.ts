export interface CrashActivity {
  id: string
  label: string
  normalTime: number
  crashTime: number
  normalCost: number
  crashCost: number
}

export interface CrashResult extends CrashActivity {
  costSlope: number
  maxCrash: number
}

export function calculateCostSlope(activity: CrashActivity): CrashResult {
  const timeSaved = activity.normalTime - activity.crashTime
  const costSlope = timeSaved === 0 ? 0 : (activity.crashCost - activity.normalCost) / timeSaved

  return {
    ...activity,
    costSlope,
    maxCrash: timeSaved,
  }
}

export const CRASHING_FACULTY_EXAMPLE: CrashActivity[] = [
  { id: 'A', label: 'Activity A', normalTime: 6, crashTime: 4, normalCost: 2000, crashCost: 2600 },
]

export const CRASHING_EVENTHUB_PRESET: CrashActivity[] = [
  { id: 'A', label: 'Requirements', normalTime: 5, crashTime: 3, normalCost: 5000, crashCost: 7000 },
  { id: 'B', label: 'Backend Dev', normalTime: 10, crashTime: 7, normalCost: 20000, crashCost: 26000 },
  { id: 'C', label: 'Frontend Dev', normalTime: 8, crashTime: 6, normalCost: 15000, crashCost: 19000 },
  { id: 'D', label: 'Integration', normalTime: 5, crashTime: 3, normalCost: 10000, crashCost: 14000 },
  { id: 'E', label: 'Testing', normalTime: 4, crashTime: 2, normalCost: 8000, crashCost: 12000 },
]
