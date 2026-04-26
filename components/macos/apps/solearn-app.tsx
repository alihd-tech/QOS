"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
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
} from "lucide-react" 

// Import education components
import { OverviewSection } from "@/components/macos/apps/education/overview"
import { MobileWalletSection } from "@/components/macos/apps/education/mobile-wallet"

interface Course {
  id: string
  title: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced'
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
}

interface LearningPath {
  id: string
  title: string
  description: string
  courses: string[]
  totalDuration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  progress: number
  icon: any
}

export function SolearnApp() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [userProgress, setUserProgress] = useState({
    totalCourses: 12,
    completedCourses: 8,
    totalHours: 45,
    currentStreak: 7,
    level: 'Intermediate',
    xp: 2450,
    nextLevelXp: 3000,
  })

  const categories = [
    { id: 'all', name: 'All Courses', icon: BookOpen },
    { id: 'fundamentals', name: 'Fundamentals', icon: Layers },
    { id: 'wallet', name: 'Wallet Integration', icon: Wallet },
    { id: 'rpc', name: 'RPC & Connections', icon: Server },
    { id: 'transactions', name: 'Transactions', icon: Zap },
    { id: 'programs', name: 'Programs', icon: Terminal },
    { id: 'mobile', name: 'Mobile Development', icon: Smartphone },
    { id: 'advanced', name: 'Advanced Topics', icon: Code2 },
  ]

  const courses: Course[] = [
    {
      id: '1',
      title: 'Solana Fundamentals',
      description: 'Learn the basics of Solana blockchain, accounts, and transactions',
      level: 'beginner',
      duration: '4 hours',
      progress: 100,
      category: 'fundamentals',
      icon: BookOpen,
      lessons: 12,
      enrolled: 1250,
      rating: 4.8,
      instructor: 'Alex Chen',
      tags: ['Blockchain', 'Accounts', 'Transactions'],
      isCompleted: true,
      isFavorite: true,
    },
    {
      id: '2',
      title: 'Wallet Adapter Integration',
      description: 'Complete guide to integrating wallet adapters in your dApps',
      level: 'intermediate',
      duration: '3 hours',
      progress: 75,
      category: 'wallet',
      icon: Wallet,
      lessons: 8,
      enrolled: 890,
      rating: 4.9,
      instructor: 'Sarah Johnson',
      tags: ['Wallet', 'React', 'Integration'],
      isCompleted: false,
      isFavorite: true,
    },
    {
      id: '3',
      title: 'RPC Configuration & Best Practices',
      description: 'Master RPC endpoints, connection management, and performance optimization',
      level: 'intermediate',
      duration: '2.5 hours',
      progress: 60,
      category: 'rpc',
      icon: Server,
      lessons: 6,
      enrolled: 675,
      rating: 4.7,
      instructor: 'Mike Rodriguez',
      tags: ['RPC', 'Performance', 'QuickNode'],
      isCompleted: false,
      isFavorite: false,
    },
    {
      id: '4',
      title: 'Mobile Wallet Adapter',
      description: 'Build mobile dApps with MWA, deeplinks, and universal links',
      level: 'advanced',
      duration: '5 hours',
      progress: 30,
      category: 'mobile',
      icon: Smartphone,
      lessons: 15,
      enrolled: 420,
      rating: 4.9,
      instructor: 'Emma Davis',
      tags: ['Mobile', 'MWA', 'Deeplinks'],
      isCompleted: false,
      isFavorite: false,
    },
    {
      id: '5',
      title: 'Transaction Building & Signing',
      description: 'Create, sign, and send transactions with proper error handling',
      level: 'intermediate',
      duration: '3.5 hours',
      progress: 90,
      category: 'transactions',
      icon: Zap,
      lessons: 10,
      enrolled: 780,
      rating: 4.8,
      instructor: 'David Kim',
      tags: ['Transactions', 'Signing', 'Error Handling'],
      isCompleted: false,
      isFavorite: true,
    },
    {
      id: '6',
      title: 'Program Interaction & IDL',
      description: 'Call on-chain programs, parse IDLs, and handle instructions',
      level: 'advanced',
      duration: '4.5 hours',
      progress: 0,
      category: 'programs',
      icon: Terminal,
      lessons: 13,
      enrolled: 340,
      rating: 4.6,
      instructor: 'Lisa Park',
      tags: ['Programs', 'IDL', 'Anchor'],
      isCompleted: false,
      isFavorite: false,
    },
  ]

  const learningPaths: LearningPath[] = [
    {
      id: '1',
      title: 'Solana Developer Fundamentals',
      description: 'Complete beginner to intermediate Solana development path',
      courses: ['1', '2', '3'],
      totalDuration: '9.5 hours',
      difficulty: 'beginner',
      progress: 78,
      icon: Rocket,
    },
    {
      id: '2',
      title: 'Mobile dApp Development',
      description: 'Specialized path for building mobile Solana applications',
      courses: ['1', '2', '4'],
      totalDuration: '12 hours',
      difficulty: 'advanced',
      progress: 55,
      icon: Smartphone,
    },
    {
      id: '3',
      title: 'Advanced Program Integration',
      description: 'Master complex program interactions and transaction patterns',
      courses: ['5', '6'],
      totalDuration: '8 hours',
      difficulty: 'advanced',
      progress: 45,
      icon: Terminal,
    },
  ]

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-600 bg-green-100 border-green-200'
      case 'intermediate': return 'text-amber-600 bg-amber-100 border-amber-200'
      case 'advanced': return 'text-red-600 bg-red-100 border-red-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-6">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-xl shadow-primary/30">
              <GraduationCap className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Welcome to Solearn</h1>
              <p className="text-muted-foreground">Your Solana Development Learning Platform</p>
            </div>
          </div>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            Master Solana blockchain development with hands-on courses, interactive tutorials, 
            and real-world projects. From wallet integration to advanced program interactions.
          </p>
        </div>
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-primary/8 blur-3xl" />
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <Badge variant="secondary" className="text-xs">{userProgress.level}</Badge>
            </div>
            <p className="text-2xl font-bold">{userProgress.completedCourses}/{userProgress.totalCourses}</p>
            <p className="text-sm text-muted-foreground">Courses Completed</p>
            <Progress value={(userProgress.completedCourses / userProgress.totalCourses) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <Badge variant="secondary" className="text-xs">Total</Badge>
            </div>
            <p className="text-2xl font-bold">{userProgress.totalHours}h</p>
            <p className="text-sm text-muted-foreground">Learning Time</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-5 w-5 text-green-500" />
              <Badge variant="secondary" className="text-xs">Streak</Badge>
            </div>
            <p className="text-2xl font-bold">{userProgress.currentStreak}</p>
            <p className="text-sm text-muted-foreground">Days Active</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Star className="h-5 w-5 text-purple-500" />
              <Badge variant="secondary" className="text-xs">XP</Badge>
            </div>
            <p className="text-2xl font-bold">{userProgress.xp}</p>
            <p className="text-sm text-muted-foreground">Experience Points</p>
            <Progress value={(userProgress.xp / userProgress.nextLevelXp) * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Learning Paths */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Learning Paths</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {learningPaths.map((path) => (
            <Card key={path.id} className="bg-card border-border hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                    <path.icon className="h-5 w-5 text-primary" />
                  </div>
                  <Badge className={getDifficultyColor(path.difficulty)} variant="outline">
                    {path.difficulty}
                  </Badge>
                </div>
                <h3 className="font-semibold mb-2">{path.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{path.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{path.totalDuration}</span>
                    <span className="text-muted-foreground">{path.progress}% complete</span>
                  </div>
                  <Progress value={path.progress} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Continue Learning */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Continue Learning</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.filter(course => course.progress > 0 && course.progress < 100).slice(0, 2).map((course) => (
            <Card key={course.id} className="bg-card border-border hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <course.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1">{course.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{course.description}</p>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">{course.progress}% complete</span>
                      <span className="text-muted-foreground">{course.duration}</span>
                    </div>
                    <Progress value={course.progress} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )

  const renderCourses = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">All Courses</h2>
          <p className="text-muted-foreground">Explore our comprehensive Solana development curriculum</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="gap-2"
          >
            <category.icon className="h-4 w-4" />
            {category.name}
          </Button>
        ))}
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="bg-card border-border hover:shadow-lg transition-all duration-300 cursor-pointer group">
            <CardContent className="p-0">
              <div className="p-5 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <course.icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex gap-1">
                    {course.isFavorite && <Star className="h-4 w-4 text-amber-500 fill-current" />}
                    {course.isCompleted && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  </div>
                </div>
                
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{course.description}</p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {course.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{course.progress}% complete</span>
                    <span className="text-muted-foreground">{course.duration}</span>
                  </div>
                  {course.progress > 0 && <Progress value={course.progress} />}
                </div>
              </div>

              <div className="px-5 py-3 bg-muted/30 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <Badge className={getDifficultyColor(course.level)} variant="outline">
                      {course.level}
                    </Badge>
                    <span className="text-muted-foreground">{course.lessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-amber-500 fill-current" />
                    <span className="text-muted-foreground">{course.rating}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderReference = () => (
    <div className="space-y-6">
      <OverviewSection onNavigate={setActiveSection} />
    </div>
  )

  const renderMobileWallet = () => (
    <div className="space-y-6">
      <MobileWalletSection />
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return renderDashboard()
      case 'courses': return renderCourses()
      case 'reference': return renderReference()
      case 'mobile-wallet': return renderMobileWallet()
      default: return renderDashboard()
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="flex-1 text-center">
          <span className="text-sm font-medium">Solearn - Solana Development Education</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <User className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-muted/20 border-r border-border flex flex-col">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Solearn</h1>
                <p className="text-xs text-muted-foreground">Learn Solana Dev</p>
              </div>
            </div>

            <nav className="space-y-1">
              {[
                { id: 'dashboard', name: 'Dashboard', icon: Activity },
                { id: 'courses', name: 'All Courses', icon: BookOpen },
                { id: 'reference', name: 'Dev Reference', icon: Code2 },
                { id: 'mobile-wallet', name: 'Mobile Wallet', icon: Smartphone },
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
          </div>

          {/* User Progress */}
          <div className="mt-auto p-4 border-t border-border">
            <div className="bg-card rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Level Progress</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{userProgress.level}</span>
                  <span>{userProgress.xp}/{userProgress.nextLevelXp} XP</span>
                </div>
                <Progress value={(userProgress.xp / userProgress.nextLevelXp) * 100} className="h-2" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6">
              {renderContent()}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}