export interface Activity {
  id: string
  from: number
  to: number
  duration: number
  label?: string
}

export interface ActivityResult extends Activity {
  es: number
  ef: number
  ls: number
  lf: number
  totalFloat: number
  freeFloat: number
  interferingFloat: number
  isCritical: boolean
}

export interface CPMResult {
  activities: ActivityResult[]
  projectDuration: number
  criticalPaths: string[][]
  nodeEarliestTimes: Record<number, number>
  nodeLatestTimes: Record<number, number>
}

export function calculateCPM(activities: Activity[]): CPMResult {
  const nodes = new Set<number>()
  activities.forEach(a => { nodes.add(a.from); nodes.add(a.to) })
  const nodeList = Array.from(nodes).sort((a, b) => a - b)

  const E: Record<number, number> = {}
  const L: Record<number, number> = {}
  nodeList.forEach(n => { E[n] = 0; L[n] = Infinity })

  // Forward pass
  for (const node of nodeList) {
    activities
      .filter(a => a.to === node)
      .forEach(a => {
        E[node] = Math.max(E[node], E[a.from] + a.duration)
      })
  }

  const lastNode = nodeList[nodeList.length - 1]
  L[lastNode] = E[lastNode]

  // Backward pass
  for (const node of [...nodeList].reverse()) {
    activities
      .filter(a => a.from === node)
      .forEach(a => {
        L[node] = Math.min(L[node], L[a.to] - a.duration)
      })
  }

  const results: ActivityResult[] = activities.map(a => {
    const es = E[a.from]
    const ef = es + a.duration
    const lf = L[a.to]
    const ls = lf - a.duration
    const totalFloat = ls - es
    const freeFloat = E[a.to] - E[a.from] - a.duration
    const interferingFloat = totalFloat - freeFloat

    return {
      ...a,
      es,
      ef,
      ls,
      lf,
      totalFloat,
      freeFloat,
      interferingFloat,
      isCritical: totalFloat === 0,
    }
  })

  // Find critical paths (DFS)
  const criticalPaths: number[][] = []

  function dfs(node: number, path: number[]) {
    if (node === lastNode) { criticalPaths.push([...path]); return }
    const outgoing = results.filter(a => a.from === node && a.isCritical)
    outgoing.forEach(a => dfs(a.to, [...path, a.to]))
  }

  dfs(nodeList[0], [nodeList[0]])

  return {
    activities: results,
    projectDuration: E[lastNode],
    criticalPaths: criticalPaths.map(p => p.map(String)),
    nodeEarliestTimes: E,
    nodeLatestTimes: L,
  }
}

export const CPM_FACULTY_ACTIVITIES: Activity[] = [
  { id: '1-2', from: 1, to: 2, duration: 5, label: 'A' },
  { id: '1-3', from: 1, to: 3, duration: 6, label: 'B' },
  { id: '1-4', from: 1, to: 4, duration: 3, label: 'C' },
  { id: '2-5', from: 2, to: 5, duration: 5, label: 'D' },
  { id: '3-6', from: 3, to: 6, duration: 7, label: 'E' },
  { id: '3-7', from: 3, to: 7, duration: 10, label: 'F' },
  { id: '4-7', from: 4, to: 7, duration: 4, label: 'G' },
  { id: '5-8', from: 5, to: 8, duration: 2, label: 'H' },
  { id: '6-8', from: 6, to: 8, duration: 5, label: 'I' },
  { id: '7-9', from: 7, to: 9, duration: 6, label: 'J' },
  { id: '8-9', from: 8, to: 9, duration: 4, label: 'K' },
]

export const CPM_EVENTHUB_ACTIVITIES: Activity[] = [
  { id: '1-2', from: 1, to: 2, duration: 3, label: 'Requirements' },
  { id: '1-3', from: 1, to: 3, duration: 2, label: 'UI Design' },
  { id: '2-4', from: 2, to: 4, duration: 5, label: 'Backend Dev' },
  { id: '3-4', from: 3, to: 4, duration: 4, label: 'Frontend Dev' },
  { id: '4-5', from: 4, to: 5, duration: 3, label: 'Integration' },
  { id: '4-6', from: 4, to: 6, duration: 2, label: 'Testing' },
  { id: '5-7', from: 5, to: 7, duration: 2, label: 'UAT' },
  { id: '6-7', from: 6, to: 7, duration: 1, label: 'Bug Fixes' },
  { id: '7-8', from: 7, to: 8, duration: 2, label: 'Deployment' },
]
