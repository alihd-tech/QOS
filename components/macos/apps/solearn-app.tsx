"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Code2,
  Database,
  ExternalLink,
  GraduationCap,
  Layers,
  Play,
  Search,
  Server,
  Settings,
  Shield,
  Star,
  Terminal,
  Trophy,
  User,
  Wallet,
  Zap,
  CheckCircle2,
  Clock,
  Target,
  Smartphone,
  Globe,
  ArrowRight,
  Activity,
  Award,
  Brain,
  Lightbulb,
  Rocket,
  TrendingUp,
  Sparkles,
  Coffee,
  LineChart,
  LayoutGrid,
  Menu,
  X,
} from "lucide-react"

// Import existing education components (assumed theme‑compatible)
import { OverviewSection } from "@/components/macos/apps/education/overview"
import { MobileWalletSection } from "@/components/macos/apps/education/mobile-wallet"

interface Course {
  id: string
  title: string
  description: string
  level: "beginner" | "intermediate" | "advanced"
  duration: string
  progress: number
  category: string
  icon: any
  lessons: number
  enrolled: number
  rating: number
  instructor: string
  tags: string[]
  isCompleted: boolean
  isFavorite: boolean
  featured?: boolean
  trending?: boolean
}

interface LearningPath {
  id: string
  title: string
  description: string
  courses: string[]
  totalDuration: string
  difficulty: "beginner" | "intermediate" | "advanced"
  progress: number
  icon: any
  color: string
}

export function SolearnApp() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const userProgress = {
    totalCourses: 18,
    completedCourses: 9,
    totalHours: 78,
    currentStreak: 14,
    level: "Advanced Beginner",
    xp: 4850,
    nextLevelXp: 6000,
    recentActivity: [
      { id: 1, title: "Completed: Solana Fundamentals", date: "2 hours ago", xp: 150 },
      { id: 2, title: "Started: Token Program Deep Dive", date: "Yesterday", xp: 0 },
      { id: 3, title: "Earned badge: RPC Master", date: "3 days ago", xp: 200 },
    ],
  }

  const categories = [
    { id: "all", name: "All Courses", icon: BookOpen },
    { id: "fundamentals", name: "Fundamentals", icon: Layers },
    { id: "wallet", name: "Wallet & Auth", icon: Wallet },
    { id: "rpc", name: "RPC & Infrastructure", icon: Server },
    { id: "transactions", name: "Transactions", icon: Zap },
    { id: "programs", name: "Programs (Anchor)", icon: Terminal },
    { id: "mobile", name: "Mobile (MWA)", icon: Smartphone },
    { id: "defi", name: "DeFi & Tokens", icon: TrendingUp },
    { id: "nft", name: "NFTs & Metaplex", icon: ImageIcon },
  ]

  const courses: Course[] = [
    {
      id: "1",
      title: "Solana Fundamentals",
      description: "Core concepts: accounts, rent, transactions, and the Solana runtime.",
      level: "beginner",
      duration: "5 hours",
      progress: 100,
      category: "fundamentals",
      icon: BookOpen,
      lessons: 14,
      enrolled: 3250,
      rating: 4.9,
      instructor: "Alex Chen",
      tags: ["Accounts", "Transactions", "CLI"],
      isCompleted: true,
      isFavorite: true,
      featured: true,
    },
    {
      id: "2",
      title: "Wallet Adapter Integration",
      description: "Connect any wallet (Phantom, Backpack, Solflare) to your dApp with one line.",
      level: "intermediate",
      duration: "4 hours",
      progress: 75,
      category: "wallet",
      icon: Wallet,
      lessons: 10,
      enrolled: 2890,
      rating: 4.8,
      instructor: "Sarah Johnson",
      tags: ["React", "Wallet", "Auth"],
      isCompleted: false,
      isFavorite: true,
      trending: true,
    },
    {
      id: "3",
      title: "RPC Performance & Best Practices",
      description: "Optimize RPC endpoints, handle rate limits, and use geyser plugins.",
      level: "intermediate",
      duration: "3.5 hours",
      progress: 60,
      category: "rpc",
      icon: Server,
      lessons: 8,
      enrolled: 1675,
      rating: 4.7,
      instructor: "Mike Rodriguez",
      tags: ["QuickNode", "Helius", "Performance"],
      isCompleted: false,
      isFavorite: false,
    },
    {
      id: "4",
      title: "Mobile Wallet Adapter (MWA)",
      description: "Deep links, universal links, and mobile‑first wallet connection.",
      level: "advanced",
      duration: "6 hours",
      progress: 30,
      category: "mobile",
      icon: Smartphone,
      lessons: 16,
      enrolled: 1120,
      rating: 4.9,
      instructor: "Emma Davis",
      tags: ["React Native", "Deeplinks", "MWA"],
      isCompleted: false,
      isFavorite: false,
    },
    {
      id: "5",
      title: "Advanced Transactions & CPI",
      description: "Build complex transactions, cross‑program invocations, and versioned txs.",
      level: "advanced",
      duration: "5.5 hours",
      progress: 20,
      category: "transactions",
      icon: Zap,
      lessons: 12,
      enrolled: 980,
      rating: 4.8,
      instructor: "David Kim",
      tags: ["CPI", "Versioned Txs", "Simulate"],
      isCompleted: false,
      isFavorite: true,
    },
    {
      id: "6",
      title: "Anchor Framework Deep Dive",
      description: "Write, test, and deploy Solana programs using Anchor.",
      level: "advanced",
      duration: "8 hours",
      progress: 0,
      category: "programs",
      icon: Terminal,
      lessons: 20,
      enrolled: 1340,
      rating: 4.9,
      instructor: "Lisa Park",
      tags: ["Anchor", "Rust", "PDAs"],
      isCompleted: false,
      isFavorite: false,
      featured: true,
    },
    {
      id: "7",
      title: "Token Program & SPL Tokens",
      description: "Create, mint, transfer, and manage SPL tokens programmatically.",
      level: "intermediate",
      duration: "4 hours",
      progress: 45,
      category: "defi",
      icon: TrendingUp,
      lessons: 9,
      enrolled: 2100,
      rating: 4.7,
      instructor: "Olivia Wang",
      tags: ["SPL", "Token Metadata", "Mint"],
      isCompleted: false,
      isFavorite: false,
      trending: true,
    },
    {
      id: "8",
      title: "Metaplex & NFTs",
      description: "Launch NFT collections, use Candy Machine, and build NFT marketplaces.",
      level: "intermediate",
      duration: "7 hours",
      progress: 0,
      category: "nft",
      icon: ImageIcon,
      lessons: 18,
      enrolled: 1850,
      rating: 4.8,
      instructor: "James Lee",
      tags: ["Metaplex", "Candy Machine", "Bubblegum"],
      isCompleted: false,
      isFavorite: true,
    },
  ]

  const learningPaths: LearningPath[] = [
    {
      id: "1",
      title: "Full‑Stack Solana Developer",
      description: "From zero to building production dApps: fundamentals, wallets, RPC, and programs.",
      courses: ["1", "2", "3", "6"],
      totalDuration: "22 hours",
      difficulty: "beginner",
      progress: 78,
      icon: Rocket,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "2",
      title: "Mobile dApp Expert",
      description: "Master mobile development with MWA, React Native, and Solana Mobile Stack.",
      courses: ["1", "2", "4"],
      totalDuration: "15 hours",
      difficulty: "advanced",
      progress: 55,
      icon: Smartphone,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "3",
      title: "DeFi & Token Engineer",
      description: "Build tokens, liquidity pools, and DeFi protocols on Solana.",
      courses: ["1", "5", "7", "6"],
      totalDuration: "22.5 hours",
      difficulty: "advanced",
      progress: 32,
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "4",
      title: "NFT Creator & Marketplace Dev",
      description: "Launch NFT collections and build custom marketplaces.",
      courses: ["1", "8", "6"],
      totalDuration: "16 hours",
      difficulty: "intermediate",
      progress: 45,
      icon: ImageIcon,
      color: "from-orange-500 to-red-500",
    },
  ]

  const filteredCourses = courses.filter((course) => {
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const featuredCourses = courses.filter((c) => c.featured)
  const trendingCourses = courses.filter((c) => c.trending)
  const continueCourses = courses.filter((c) => c.progress > 0 && c.progress < 100)

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
      case "intermediate":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
      case "advanced":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  // Dashboard view
  const DashboardView = () => (
    <div className="space-y-8">
      {/* Hero / Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-background border border-border p-6 md:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20">Beta Access</Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Welcome back, Developer
            </h1>
            <p className="text-muted-foreground max-w-xl">
              Master Solana development with hands‑on courses, real‑world projects, and expert guidance.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Resume Learning
            </Button>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Rocket className="h-4 w-4" />
              Explore Paths
            </Button>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Courses completed</p>
              <p className="text-2xl font-bold">
                {userProgress.completedCourses}/{userProgress.totalCourses}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Learning hours</p>
              <p className="text-2xl font-bold">{userProgress.totalHours}h</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Day streak</p>
              <p className="text-2xl font-bold">{userProgress.currentStreak}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
              <Target className="h-5 w-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">XP / Next level</p>
              <p className="text-2xl font-bold">{userProgress.xp}</p>
              <Progress value={(userProgress.xp / userProgress.nextLevelXp) * 100} className="h-1 mt-1" />
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Brain className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two‑column layout: Learning Paths + Continue Learning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Learning Paths (takes 2/3) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Learning Paths</h2>
            <Button variant="ghost" size="sm" className="gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {learningPaths.slice(0, 2).map((path) => (
              <Card
                key={path.id}
                className="bg-card border-border hover:shadow-md transition-all cursor-pointer group"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`h-10 w-10 rounded-lg bg-gradient-to-br ${path.color} flex items-center justify-center`}
                    >
                      <path.icon className="h-5 w-5 text-white" />
                    </div>
                    <Badge className={getDifficultyColor(path.difficulty)} variant="outline">
                      {path.difficulty}
                    </Badge>
                  </div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {path.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {path.description}
                  </p>
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{path.totalDuration}</span>
                      <span>{path.progress}% complete</span>
                    </div>
                    <Progress value={path.progress} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Continue Learning (1/3) */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Continue Learning</h2>
          {continueCourses.length > 0 ? (
            <div className="space-y-3">
              {continueCourses.slice(0, 2).map((course) => (
                <Card key={course.id} className="bg-card border-border hover:shadow-sm transition-shadow">
                  <CardContent className="p-3 flex gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <course.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{course.title}</h4>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{course.progress}%</span>
                        <span>{course.duration}</span>
                      </div>
                      <Progress value={course.progress} className="h-1 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-muted/20 border-dashed">
              <CardContent className="p-6 text-center text-muted-foreground text-sm">
                No courses in progress. Start one!
              </CardContent>
            </Card>
          )}
        </div>
      </div>
 
    </div>
  )

  // All Courses view
  const CoursesView = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">All Courses</h2>
          <p className="text-sm text-muted-foreground">
            {filteredCourses.length} courses available
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses, tags, or instructors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
            className="gap-2"
          >
            <cat.icon className="h-3.5 w-3.5" />
            {cat.name}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCourses.map((course) => (
          <CourseCard key={course.id} course={course} getDifficultyColor={getDifficultyColor} />
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground">No courses match your filters.</p>
        </div>
      )}
    </div>
  )

  // Placeholder for other sections – they are imported but we keep them as is
  const ReferenceView = () => <OverviewSection onNavigate={setActiveSection} />
  const MobileWalletView = () => <MobileWalletSection />

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardView />
      case "courses":
        return <CoursesView />
      case "reference":
        return <ReferenceView />
      case "mobile-wallet":
        return <MobileWalletView />
      default:
        return <DashboardView />
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* macOS‑style title bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2">
          
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden -ml-2"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium hidden sm:inline">Solearn</span>
          <Badge variant="outline" className="text-xs">
            Solana Dev
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Bell className="h-4 w-4" />
          </Button> 
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar – responsive with Tailwind */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-20 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-bold">Solearn</h1>
                  <p className="text-xs text-muted-foreground">v2.0 – Quantum</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-3 space-y-1">
              {[
                { id: "dashboard", name: "Dashboard", icon: Activity },
                { id: "courses", name: "All Courses", icon: BookOpen },
                { id: "reference", name: "Dev Reference", icon: Code2 },
                { id: "mobile-wallet", name: "Mobile Wallet", icon: Smartphone },
              ].map((item) => (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3"
                  onClick={() => setActiveSection(item.id)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Button>
              ))}
            </nav>

            {/* User progress footer */}
            <div className="p-4 border-t border-border">
              <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium">{userProgress.level}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">XP</span>
                    <span>{userProgress.xp}/{userProgress.nextLevelXp}</span>
                  </div>
                  <Progress value={(userProgress.xp / userProgress.nextLevelXp) * 100} className="h-1.5" />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-10 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 md:p-6">{renderContent()}</div>
          </ScrollArea>
        </main>
      </div>
    </div>
  )
}

// Helper component for course cards (used in both Dashboard and Courses)
function CourseCard({ course, getDifficultyColor }: { course: Course; getDifficultyColor: (level: string) => string }) {
  return (
    <Card className="bg-card border-border hover:shadow-md transition-all group cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
              <course.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div>
              <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
                {course.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">{course.instructor}</p>
            </div>
          </div>
          {course.isFavorite && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
        </div>

        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{course.description}</p>

        <div className="flex flex-wrap gap-1 mt-3">
          {course.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <Badge className={getDifficultyColor(course.level)} variant="outline">
              {course.level}
            </Badge>
            <span className="text-xs text-muted-foreground">{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
            <span className="text-xs font-medium">{course.rating}</span>
          </div>
        </div>

        {course.progress > 0 && course.progress < 100 && (
          <div className="mt-3">
            <Progress value={course.progress} className="h-1.5" />
            <p className="text-right text-[10px] text-muted-foreground mt-1">{course.progress}%</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Helper icon for NFT category (since lucide doesn't have an image icon)
function ImageIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="2.5"></circle>
      <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
  )
}

// Also add Bell icon if not already present in lucide-react (it is)
import { Bell } from "lucide-react"