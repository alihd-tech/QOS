"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Activity,
  ArrowRight,
  BookOpen,
  Code2,
  Database,
  ExternalLink,
  Layers,
  Server,
  Shield,
  Terminal,
  Wallet,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface OverviewSectionProps {
  onNavigate?: (section: string) => void
}

export function OverviewSection({ onNavigate }: OverviewSectionProps) { 

  const quickLinks = [
    {
      title: "RPC Configuration",
      description: "Configure custom RPC endpoints for QuickNode, Alchemy, or public nodes",
      icon: Server,
      section: "rpc-config",
      badge: "Essential",
    },
    {
      title: "Wallet Integration",
      description: "Complete wallet-adapter setup with Phantom, Solflare, and more",
      icon: Wallet,
      section: "wallet",
      badge: "Popular",
    },
    {
      title: "Connection Patterns",
      description: "Best practices for managing Solana connections",
      icon: Database,
      section: "connection",
    },
    {
      title: "Transaction Building",
      description: "Create, sign, and send transactions with proper error handling",
      icon: Zap,
      section: "transactions",
    },
    {
      title: "Account Management",
      description: "Fetch and parse account data, PDAs, and token accounts",
      icon: Layers,
      section: "accounts",
    },
    {
      title: "Program Interaction",
      description: "Call on-chain programs and handle instructions",
      icon: Terminal,
      section: "programs",
    },
  ]

  const referenceCategories = [
    {
      title: "Wallet Adapters",
      description: "Browser extension and hardware wallet integration patterns",
      icon: Shield,
      section: "wallet-adapters",
      color: "text-primary",
    },
    {
      title: "RPC Methods",
      description: "Complete JSON-RPC method reference with examples",
      icon: Code2,
      section: "rpc-methods",
      color: "text-blue-400",
    },
    {
      title: "Web3.js",
      description: "Solana JavaScript SDK patterns and utilities",
      icon: BookOpen,
      section: "web3js",
      color: "text-amber-400",
    },
    {
      title: "Anchor Framework",
      description: "IDL parsing, program calls, and account deserialization",
      icon: Terminal,
      section: "anchor",
      color: "text-emerald-400",
    },
  ]

  const externalResources = [
    { name: "Solana Docs", url: "https://solana.com/docs" },
    { name: "Solana Cookbook", url: "https://solanacookbook.com" },
    { name: "Anchor Book", url: "https://www.anchor-lang.com" },
    { name: "QuickNode Guides", url: "https://www.quicknode.com/guides/solana-development" },
  ]

  const handleNavigate = (section: string) => {
    if (onNavigate) {
      onNavigate(section)
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-5 sm:p-8">
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-xl shadow-primary/30">
              <Activity className="h-6 w-6 sm:h-7 sm:w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-balance">SolDev Suite</h1>
              <p className="text-muted-foreground text-sm sm:text-base">Solana Developer Reference Dashboard</p>
            </div>
          </div>
          <p className="text-muted-foreground max-w-2xl leading-relaxed text-sm sm:text-base">
            Your comprehensive toolkit for Solana blockchain development. From RPC configuration
            and wallet integration to advanced transaction patterns and program interactions.
          </p>
           
        </div>

        {/* Background decoration */}
        <div className="absolute -right-12 -top-12 h-48 sm:h-64 w-48 sm:w-64 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -right-6 -bottom-6 h-24 sm:h-32 w-24 sm:w-32 rounded-full bg-primary/10 blur-2xl" />
      </div>

      {/* Quick Access Grid */}
      <div>
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {quickLinks.map((link) => (
            <Card
              key={link.section}
              className="bg-card/80 backdrop-blur-sm border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer group"
              onClick={() => handleNavigate(link.section)}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/15 transition-colors duration-300">
                    <link.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                  </div>
                  {link.badge && (
                    <Badge variant="secondary" className="text-[10px] sm:text-xs bg-primary/10 text-primary border-0">
                      {link.badge}
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-sm sm:text-base group-hover:text-primary transition-colors duration-300">
                  {link.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{link.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Reference Section */}
      <div>
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Developer Reference</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {referenceCategories.map((category) => (
            <Card
              key={category.section}
              className="bg-card/80 backdrop-blur-sm border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer group"
              onClick={() => handleNavigate(category.section)}
            >
              <CardContent className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/15 transition-colors duration-300 flex-shrink-0">
                  <category.icon className={cn("h-5 w-5 sm:h-6 sm:w-6", category.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base group-hover:text-primary transition-colors duration-300">
                    {category.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{category.description}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 hidden sm:block" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* External Resources */}
      <Card className="bg-card/80 backdrop-blur-sm border-border">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">External Resources</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Official documentation and community guides</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {externalResources.map((resource) => (
              <Button 
                key={resource.name} 
                variant="outline" 
                size="sm" 
                className="text-xs sm:text-sm h-8 sm:h-9 bg-transparent hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
                asChild
              >
                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                  {resource.name}
                  <ExternalLink className="h-3 w-3 ml-1.5 sm:ml-2" />
                </a>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
