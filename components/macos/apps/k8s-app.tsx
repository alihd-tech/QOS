"use client"

import { useState, useRef, useEffect } from "react"
import {
  BookOpen,
  Terminal,
  Server,
  Box,
  Copy,
  Check,
  Cpu,
  Network,
  Shield,
  Container,
  Coffee,
  HelpCircle,
  Play,
  Trash2,
  Code,
  LayoutGrid,
  List,
  Zap,
  Search,
} from "lucide-react"

const mockPods = [
  { name: "nginx-pod", namespace: "default", status: "Running", ready: "1/1", restarts: 0, age: "2d" },
  { name: "redis-pod", namespace: "default", status: "Running", ready: "1/1", restarts: 1, age: "5h" },
  { name: "busybox", namespace: "kube-system", status: "Running", ready: "1/1", restarts: 0, age: "10d" },
]

const mockDeployments = [
  { name: "nginx-deploy", namespace: "default", ready: "3/3", upToDate: 3, available: 3, age: "2d" },
  { name: "redis-deploy", namespace: "default", ready: "1/1", upToDate: 1, available: 1, age: "5h" },
]

const mockServices = [
  { name: "nginx-svc", namespace: "default", type: "ClusterIP", clusterIP: "10.96.0.1", externalIP: "<none>", ports: "80/TCP", age: "2d" },
  { name: "redis-svc", namespace: "default", type: "ClusterIP", clusterIP: "10.96.0.2", externalIP: "<none>", ports: "6379/TCP", age: "5h" },
]

const mockNodes = [
  { name: "control-plane", status: "Ready", roles: "control-plane", age: "30d", version: "v1.28.0" },
  { name: "worker-1", status: "Ready", roles: "worker", age: "30d", version: "v1.28.0" },
  { name: "worker-2", status: "Ready", roles: "worker", age: "29d", version: "v1.28.0" },
]

// ----- Kubectl Playground -----
function KubectlTerminal() {
  const [history, setHistory] = useState<{ type: "command" | "output"; content: string }[]>([
    { type: "output", content: "Welcome to Kubectl Playground! 🚀\nType 'help' to see available commands.\n" },
  ])
  const [input, setInput] = useState("")
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight
  }, [history])

  const execute = (cmd: string): string => {
    const t = cmd.trim().toLowerCase()
    if (t === "clear") return "CLEAR"
    if (t === "help") return `Available commands:
  kubectl get pods
  kubectl get deployments
  kubectl get services
  kubectl get nodes
  kubectl get all
  kubectl describe pod nginx-pod
  kubectl logs nginx-pod
  kubectl version
  clear
  help`
    if (t === "kubectl get pods") return "NAME         READY   STATUS    RESTARTS   AGE\nnginx-pod    1/1     Running   0          2d\nredis-pod    1/1     Running   1          5h\nbusybox      1/1     Running   0          10d"
    if (t === "kubectl get deployments") return "NAME           READY   UP-TO-DATE   AVAILABLE   AGE\nnginx-deploy   3/3     3            3           2d\nredis-deploy   1/1     1            1           5h"
    if (t === "kubectl get services") return "NAME         TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)    AGE\nnginx-svc    ClusterIP   10.96.0.1    <none>        80/TCP     2d\nredis-svc    ClusterIP   10.96.0.2    <none>        6379/TCP   5h"
    if (t === "kubectl get nodes") return "NAME           STATUS   ROLES           AGE   VERSION\ncontrol-plane  Ready    control-plane   30d   v1.28.0\nworker-1       Ready    worker          30d   v1.28.0\nworker-2       Ready    worker          29d   v1.28.0"
    if (t === "kubectl get all") return "pods:\nnginx-pod (Running)\nredis-pod (Running)\n\ndeployments:\nnginx-deploy\nredis-deploy\n\nservices:\nnginx-svc\nredis-svc"
    if (t === "kubectl describe pod nginx-pod") return `Name:             nginx-pod\nNamespace:        default\nNode:             worker-1/10.0.0.2\nStatus:           Running\nIP:               10.244.1.2\nContainers:\n  nginx: Running\nConditions:       Ready True\nRestart Count:    0`
    if (t === "kubectl logs nginx-pod") return `2024/01/01 10:00:05 [notice] 1#1: using the "epoll" event method\n2024/01/01 10:00:05 [notice] 1#1: nginx/1.25.0`
    if (t === "kubectl version") return `Client Version: v1.28.0\nServer Version: v1.28.0`
    return `Error: unknown command "${cmd}"\nType 'help' for available commands.`
  }

  const handleCommand = () => {
    if (!input.trim()) return
    const cmd = input.trim()
    setHistory(prev => [...prev, { type: "command", content: `$ ${cmd}` }])
    const out = execute(cmd)
    if (out === "CLEAR") setHistory([])
    else setHistory(prev => [...prev, { type: "output", content: out }])
    setInput("")
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  return (
    <div className="rounded-xl overflow-hidden border border-border bg-secondary">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted">
        <Terminal className="w-4 h-4 text-primary" />
        <span className="text-xs font-mono text-foreground">kubectl@kind-k8s-learning</span>
      </div>
      <div ref={terminalRef} className="h-[280px] overflow-y-auto p-3 font-mono text-xs text-secondary-foreground" onClick={() => inputRef.current?.focus()}>
        {history.map((item, idx) => (
          <div key={idx} className="mb-1">
            {item.type === "command" ? <span className="text-primary">{item.content}</span> : <pre className="whitespace-pre-wrap">{item.content}</pre>}
          </div>
        ))}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-primary">$</span>
          <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleCommand()} className="flex-1 bg-transparent outline-none font-mono text-xs text-foreground" placeholder="Type kubectl command..." autoFocus />
        </div>
      </div>
    </div>
  )
}

// ----- Interactive Lab -----
function InteractiveLab() {
  const [deploymentCreated, setDeploymentCreated] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showYaml, setShowYaml] = useState(false)
  const yamlExample = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.25
        ports:
        - containerPort: 80`

  const handleDeploy = () => { setCreating(true); setTimeout(() => { setDeploymentCreated(true); setCreating(false); }, 1500) }
  const handleDelete = () => { setDeleting(true); setTimeout(() => { setDeploymentCreated(false); setDeleting(false); }, 800) }

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl overflow-hidden border border-border">
          <div className="flex justify-between items-center px-4 py-2 border-b border-border bg-muted">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-foreground">nginx-deployment.yaml</span>
            </div>
            <button onClick={() => setShowYaml(!showYaml)} className="text-xs px-2 py-0.5 rounded text-primary hover:bg-primary/10">{showYaml ? "Hide" : "Show"}</button>
          </div>
          {showYaml && <pre className="p-3 text-xs font-mono overflow-x-auto bg-muted/20 text-foreground">{yamlExample}</pre>}
          {!showYaml && <div className="p-6 text-center text-muted-foreground text-sm">Click "Show" to view the YAML manifest for an Nginx Deployment</div>}
        </div>
        <div className="rounded-xl p-5 border border-border bg-card">
          <div className="flex items-center gap-2 mb-4">
            <Container className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Deployment Simulator</h3>
          </div>
          {!deploymentCreated ? (
            <div>
              <p className="text-sm text-muted-foreground mb-4">Deploy an Nginx application with 3 replicas.</p>
              <button onClick={handleDeploy} disabled={creating} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                {creating ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                {creating ? "Deploying..." : "Deploy Nginx"}
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Deployment Created!</span>
                </div>
                <p className="text-xs text-muted-foreground">nginx-deployment • 3 replicas • Available: 3</p>
              </div>
              <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20">
                {deleting ? <div className="w-3.5 h-3.5 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                {deleting ? "Deleting..." : "Delete Deployment"}
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-2 border-b border-border bg-muted">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">Simulated Cluster Resources</span>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div><p className="font-medium text-muted-foreground mb-2">Pods</p>{mockPods.map(pod => <div key={pod.name} className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /><span className="text-foreground">{pod.name}</span><span className="text-green-600 dark:text-green-400">Running</span></div>)}</div>
            <div><p className="font-medium text-muted-foreground mb-2">Deployments</p>{mockDeployments.map(deploy => <div key={deploy.name} className="flex items-center gap-2"><Box className="w-3 h-3 text-primary" /><span className="text-foreground">{deploy.name}</span><span className="text-muted-foreground">ready {deploy.ready}</span></div>)}</div>
            <div><p className="font-medium text-muted-foreground mb-2">Services</p>{mockServices.map(svc => <div key={svc.name} className="flex items-center gap-2"><Network className="w-3 h-3 text-primary" /><span className="text-foreground">{svc.name}</span><span className="text-muted-foreground">{svc.clusterIP}</span></div>)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ----- Concept Card -----
function ConceptCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="p-4 rounded-xl border border-border bg-card hover:shadow-md transition-all cursor-pointer">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10"><Icon className="w-4 h-4 text-primary" /></div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

// ----- Cheatsheet -----
function Cheatsheet() {
  const commands = [
    { cmd: "kubectl get pods", desc: "List all pods" },
    { cmd: "kubectl get deployments", desc: "List deployments" },
    { cmd: "kubectl get services", desc: "List services" },
    { cmd: "kubectl get nodes", desc: "List cluster nodes" },
    { cmd: "kubectl describe pod <name>", desc: "Show detailed pod information" },
    { cmd: "kubectl logs <pod-name>", desc: "View pod logs" },
    { cmd: "kubectl exec -it <pod> -- /bin/bash", desc: "Execute command in a pod" },
    { cmd: "kubectl apply -f <file.yaml>", desc: "Apply configuration" },
  ]
  const [copied, setCopied] = useState<number | null>(null)
  const copy = (text: string, idx: number) => { navigator.clipboard.writeText(text); setCopied(idx); setTimeout(() => setCopied(null), 2000) }
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-2 border-b border-border bg-muted flex items-center gap-2">
        <List className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-medium text-foreground">Essential kubectl Commands</span>
      </div>
      <div className="divide-y divide-border">
        {commands.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center p-3 hover:bg-muted/30">
            <div>
              <code className="text-xs font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">{item.cmd}</code>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </div>
            <button onClick={() => copy(item.cmd, idx)} className="p-1.5 rounded-lg hover:bg-muted">
              {copied === idx ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ----- Main K8sApp -----
export function K8sApp() {
  const [activeTab, setActiveTab] = useState<"overview" | "concepts" | "interactive" | "playground" | "cheatsheet">("overview")
  const tabs = [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "concepts", label: "Concepts", icon: Server },
    { id: "interactive", label: "Interactive Lab", icon: Zap },
    { id: "playground", label: "Kubectl Playground", icon: Terminal },
    { id: "cheatsheet", label: "Cheatsheet", icon: HelpCircle },
  ] as const

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center justify-between px-5 py-3 shrink-0 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary">
            <Container className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Kubernetes Learning Hub</h2>
            <p className="text-xs text-muted-foreground">Learn, practice, and master Kubernetes</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted">
          <Cpu className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Simulated Cluster • v1.28</span>
        </div>
      </div>

      <div className="flex gap-1 px-5 pt-3 border-b border-border">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-t-lg transition-all ${isActive ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:bg-muted/50"}`}>
              <Icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="rounded-2xl p-6 relative overflow-hidden bg-gradient-to-br from-primary/20 to-background border border-primary/20">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Container className="w-5 h-5 text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">Welcome</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Master Kubernetes</h3>
                <p className="text-sm text-muted-foreground max-w-[500px]">Interactive lessons, a real kubectl playground, and hands-on labs.</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl p-4 text-center border border-border bg-card"><BookOpen className="w-5 h-5 mx-auto mb-2 text-primary" /><p className="text-xl font-bold text-foreground">10+</p><p className="text-xs text-muted-foreground">Core Concepts</p></div>
              <div className="rounded-xl p-4 text-center border border-border bg-card"><Terminal className="w-5 h-5 mx-auto mb-2 text-primary" /><p className="text-xl font-bold text-foreground">30+</p><p className="text-xs text-muted-foreground">kubectl Commands</p></div>
              <div className="rounded-xl p-4 text-center border border-border bg-card"><Zap className="w-5 h-5 mx-auto mb-2 text-primary" /><p className="text-xl font-bold text-foreground">Interactive</p><p className="text-xs text-muted-foreground">Hands-on Labs</p></div>
            </div>
            <div className="rounded-xl p-5 border border-border bg-card">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-foreground"><Coffee className="w-4 h-4" /> Quick Start</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm"><div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-primary text-primary-foreground">1</div><span className="text-foreground">Explore Kubernetes Concepts</span></div>
                <div className="flex items-center gap-3 text-sm"><div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-primary text-primary-foreground">2</div><span className="text-foreground">Try the Interactive Lab to deploy an app</span></div>
                <div className="flex items-center gap-3 text-sm"><div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-primary text-primary-foreground">3</div><span className="text-foreground">Practice with kubectl commands in the playground</span></div>
              </div>
            </div>
          </div>
        )}
        {activeTab === "concepts" && (
          <div className="grid md:grid-cols-2 gap-4">
            <ConceptCard icon={Box} title="Pods" description="Smallest deployable units, encapsulating one or more containers." />
            <ConceptCard icon={Server} title="Deployments" description="Manage replica sets and declarative updates for pods." />
            <ConceptCard icon={Network} title="Services" description="Stable network endpoint to access a set of pods." />
            <ConceptCard icon={Shield} title="ConfigMaps & Secrets" description="Decouple configuration from container images." />
            <ConceptCard icon={Container} title="Namespaces" description="Virtual clusters for resource isolation." />
            <ConceptCard icon={Cpu} title="Nodes" description="Worker machines in the cluster." />
          </div>
        )}
        {activeTab === "interactive" && <InteractiveLab />}
        {activeTab === "playground" && (
          <div className="space-y-4">
            <div className="rounded-xl p-4 bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-2"><Terminal className="w-4 h-4 text-primary" /><span className="text-sm font-medium text-foreground">Try real kubectl commands</span></div>
              <p className="text-xs text-muted-foreground">Type <code className="px-1 rounded bg-muted">kubectl get pods</code> or <code className="px-1 rounded bg-muted">kubectl get nodes</code>.</p>
            </div>
            <KubectlTerminal />
            <div className="flex flex-wrap gap-2 justify-center">
              {["kubectl get pods", "kubectl get deployments", "kubectl get services", "kubectl get nodes", "clear"].map(s => (
                <button key={s} className="px-3 py-1 rounded-full text-xs bg-muted hover:bg-muted/80 text-foreground" onClick={() => { const inp = document.querySelector(".kubectl-terminal-input") as HTMLInputElement; if (inp) { inp.value = s; inp.dispatchEvent(new Event("change", { bubbles: true })) } }}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {activeTab === "cheatsheet" && <Cheatsheet />}
      </div>
    </div>
  )
}

export default K8sApp