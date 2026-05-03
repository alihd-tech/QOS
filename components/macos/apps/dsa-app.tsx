"use client"

import { useState, useEffect, useRef } from "react"
import {
  BookOpen,
  Code2,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Play,
  RefreshCw,
  SortAsc,
  Search,
  Link2,
  Layers,
  GitBranch,
  Box,
  TreePine,
} from "lucide-react"

function CodeBlock({ code, language = "typescript" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)
  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="rounded-lg overflow-hidden border border-border my-3">
      <div className="flex justify-between items-center px-3 py-1.5 bg-muted border-b border-border">
        <span className="text-xs font-mono text-muted-foreground">{language}</span>
        <button onClick={copyCode} className="p-1 rounded hover:bg-muted-foreground/20 transition-colors">
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
        </button>
      </div>
      <pre className="p-3 text-xs font-mono bg-secondary text-secondary-foreground overflow-x-auto">
        {code}
      </pre>
    </div>
  )
}

function PatternCard({ title, category, description, code }: { title: string; category: string; description: string; code: string }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="rounded-xl border border-border bg-card hover:shadow-sm transition-all">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left flex items-start justify-between gap-2"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
              {category}
            </span>
            <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-border mt-2">
          <CodeBlock code={code} />
        </div>
      )}
    </div>
  )
}

type SortingAlgorithm = "bubble" | "quick" | "merge"

function SortingVisualizer() {
  const [array, setArray] = useState<number[]>([])
  const [sorting, setSorting] = useState(false)
  const [comparing, setComparing] = useState<[number, number] | null>(null)
  const [selectedAlgo, setSelectedAlgo] = useState<SortingAlgorithm>("bubble")
  const abortRef = useRef(false)

  const generateArray = () => {
    if (sorting) return
    const newArr = Array.from({ length: 20 }, () => Math.floor(Math.random() * 80) + 10)
    setArray(newArr)
    setComparing(null)
  }

  useEffect(() => {
    generateArray()
    return () => { abortRef.current = true }
  }, [])

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const getBarColor = (idx: number) => {
    if (comparing && (comparing[0] === idx || comparing[1] === idx)) {
      return "#f97316" // orange-500
    }
    return "var(--primary, #3b82f6)"
  }

  // Bubble Sort
  const bubbleSort = async () => {
    setSorting(true)
    const arr = [...array]
    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        if (abortRef.current) { setSorting(false); return }
        setComparing([j, j + 1])
        await sleep(50)
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
          setArray([...arr])
          await sleep(30)
        }
      }
    }
    setComparing(null)
    setSorting(false)
  }

  // Quick Sort
  const quickSort = async () => {
    setSorting(true)
    const arr = [...array]
    const partition = async (low: number, high: number): Promise<number> => {
      const pivot = arr[high]
      let i = low - 1
      for (let j = low; j < high; j++) {
        if (abortRef.current) throw new Error("abort")
        setComparing([j, high])
        await sleep(30)
        if (arr[j] <= pivot) {
          i++
          ;[arr[i], arr[j]] = [arr[j], arr[i]]
          setArray([...arr])
          await sleep(30)
        }
      }
      ;[arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]
      setArray([...arr])
      await sleep(30)
      return i + 1
    }
    const quick = async (low: number, high: number) => {
      if (low < high && !abortRef.current) {
        const pi = await partition(low, high)
        await quick(low, pi - 1)
        await quick(pi + 1, high)
      }
    }
    await quick(0, arr.length - 1)
    setComparing(null)
    setSorting(false)
  }

  // Merge Sort (without comparison highlighting, because it's too complex to map indices)
  const mergeSort = async () => {
    setSorting(true)
    const arr = [...array]
    const merge = async (left: number[], right: number[]): Promise<number[]> => {
      const result: number[] = []
      let i = 0, j = 0
      while (i < left.length && j < right.length) {
        if (abortRef.current) throw new Error("abort")
        await sleep(20)
        if (left[i] <= right[j]) {
          result.push(left[i++])
        } else {
          result.push(right[j++])
        }
      }
      return [...result, ...left.slice(i), ...right.slice(j)]
    }
    const mergeSortRec = async (arr: number[]): Promise<number[]> => {
      if (arr.length <= 1) return arr
      const mid = Math.floor(arr.length / 2)
      const left = await mergeSortRec(arr.slice(0, mid))
      const right = await mergeSortRec(arr.slice(mid))
      const merged = await merge(left, right)
      setArray([...merged])
      await sleep(40)
      return merged
    }
    await mergeSortRec(arr)
    setComparing(null)
    setSorting(false)
  }

  const startSort = async () => {
    if (sorting) return
    abortRef.current = false
    if (selectedAlgo === "bubble") await bubbleSort()
    else if (selectedAlgo === "quick") await quickSort()
    else await mergeSort()
  }

  const handleRandomize = () => {
    if (sorting) return
    abortRef.current = true
    setTimeout(() => {
      generateArray()
      abortRef.current = false
    }, 50)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          {(["bubble", "quick", "merge"] as SortingAlgorithm[]).map(algo => (
            <button
              key={algo}
              onClick={() => setSelectedAlgo(algo)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${selectedAlgo === algo ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"}`}
            >
              {algo} sort
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRandomize}
            disabled={sorting}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted hover:bg-muted/80 disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Randomize
          </button>
          <button
            onClick={startSort}
            disabled={sorting}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" /> Sort
          </button>
        </div>
      </div>
      <div className="flex items-end justify-center h-48 gap-1">
        {array.map((value, idx) => (
          <div
            key={idx}
            className="w-6 rounded-t transition-all duration-100"
            style={{
              height: `${value * 2.5}px`,
              backgroundColor: getBarColor(idx),
              opacity: 0.8,
            }}
          />
        ))}
      </div>
    </div>
  )
}

function LinkedListVisual() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 p-4">
      {["Head", "Node A", "Node B", "Node C", "null"].map((label, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className="px-3 py-2 rounded-lg border border-border bg-card text-xs font-mono">{label}</div>
          {i < 4 && <span className="text-muted-foreground text-sm">→</span>}
        </div>
      ))}
    </div>
  )
}

function BinaryTreeVisual() {
  return (
    <div className="flex flex-col items-center space-y-2 p-2">
      <div className="px-4 py-2 rounded-lg border border-border bg-primary/10 text-primary font-mono text-sm">Root (10)</div>
      <div className="flex gap-8">
        <div className="px-3 py-1.5 rounded border border-border bg-card text-xs">Left (5)</div>
        <div className="px-3 py-1.5 rounded border border-border bg-card text-xs">Right (15)</div>
      </div>
      <div className="flex gap-4">
        <div className="px-2 py-1 rounded border border-border bg-muted text-[10px]">3</div>
        <div className="px-2 py-1 rounded border border-border bg-muted text-[10px]">7</div>
        <div className="px-2 py-1 rounded border border-border bg-muted text-[10px]">12</div>
        <div className="px-2 py-1 rounded border border-border bg-muted text-[10px]">18</div>
      </div>
    </div>
  )
}

// ----- Main Component -----
export function DsaApp() {
  const [activeTab, setActiveTab] = useState<"patterns" | "algorithms" | "complexity">("patterns")

  const designPatterns = [ /* unchanged, same as your original */ ]
  const algorithms = [ /* unchanged, same as your original */ ]
  const complexityReference = [ /* unchanged, same as your original */ ]

  // (paste the same data arrays here – they are unchanged)
  // For brevity I'm not repeating them, but they must be included.
  // You can copy the original arrays from your previous code.

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 shrink-0 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary">
            <BookOpen className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Design Patterns & Algorithms</h2>
            <p className="text-xs text-muted-foreground">Learn, visualize, and master DSA</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted">
          <Code2 className="w-3 h-3 text-primary" />
          <span className="text-xs text-muted-foreground">TypeScript • JavaScript</span>
        </div>
      </div>

      {/* Tabs - same as before */}
      <div className="flex gap-1 px-5 pt-3 border-b border-border">
        <button onClick={() => setActiveTab("patterns")} className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-t-lg transition-all ${activeTab === "patterns" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:bg-muted/50"}`}>
          <Layers className="w-3.5 h-3.5" /> Design Patterns
        </button>
        <button onClick={() => setActiveTab("algorithms")} className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-t-lg transition-all ${activeTab === "algorithms" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:bg-muted/50"}`}>
          <SortAsc className="w-3.5 h-3.5" /> Algorithms & Sorting
        </button>
        <button onClick={() => setActiveTab("complexity")} className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-t-lg transition-all ${activeTab === "complexity" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:bg-muted/50"}`}>
          <BarChart3 className="w-3.5 h-3.5" /> Complexity
        </button>
      </div>

      {/* Content - same structure, but fixed SortingVisualizer inside algorithms tab */}
      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === "patterns" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-primary" />
                Gang of Four Patterns
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Classic design patterns that solve recurring software design problems.
              </p>
              <div className="space-y-3">
                {designPatterns.map((pattern, i) => (
                  <PatternCard key={i} {...pattern} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "algorithms" && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                <SortAsc className="w-4 h-4 text-primary" />
                Sorting Visualizer
              </h3>
              <SortingVisualizer />
              <p className="text-xs text-muted-foreground mt-3">Watch Bubble, Quick, and Merge sort in action.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-border bg-card p-4">
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2"><GitBranch className="w-3.5 h-3.5" /> Linked List</h4>
                <LinkedListVisual />
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2"><TreePine className="w-3.5 h-3.5" /> Binary Tree</h4>
                <BinaryTreeVisual />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" />
                Common Algorithms (Code)
              </h3>
              <div className="space-y-6">
                {algorithms.map((algo, idx) => (
                  <div key={idx}>
                    <h4 className="text-sm font-semibold text-foreground">{algo.name}</h4>
                    <p className="text-xs text-muted-foreground mb-1">{algo.description}</p>
                    <CodeBlock code={algo.code} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "complexity" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Big O Complexity Reference
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted">
                    <tr className="border-b border-border">
                      <th className="text-left p-2 font-semibold text-foreground">Operation</th>
                      <th className="text-left p-2 font-semibold text-foreground">Best</th>
                      <th className="text-left p-2 font-semibold text-foreground">Average</th>
                      <th className="text-left p-2 font-semibold text-foreground">Worst</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {complexityReference.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2 text-foreground">{item.operation}</td>
                        <td className="p-2 font-mono text-primary">{item.best}</td>
                        <td className="p-2 font-mono text-primary">{item.avg}</td>
                        <td className="p-2 font-mono text-primary">{item.worst}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
                💡 <strong>Tip:</strong> O(log n) is very efficient; O(n²) should be avoided for large datasets.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Default export for dynamic imports in your desktop
export default DsaApp