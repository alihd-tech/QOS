"use client"

import { useState, useEffect } from "react"
import { 
  Search, 
  Globe, 
  TrendingUp, 
  Clock, 
  Bookmark, 
  Share, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Settings,
  User,
  Heart,
  MessageCircle,
  Eye,
  Calendar,
  Tag,
  MapPin,
  Star
} from "lucide-react"

interface NewsArticle {
  id: string
  title: string
  summary: string
  content: string
  author: string
  source: string
  category: string
  publishedAt: string
  imageUrl: string
  url: string
  readTime: number
  views: number
  likes: number
  comments: number
  isBookmarked: boolean
  tags: string[]
  location?: string
}

interface NewsSource {
  id: string
  name: string
  logo: string
  category: string
  isActive: boolean
}

export function NewsApp() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [bookmarkedArticles, setBookmarkedArticles] = useState<string[]>([])

  const categories = [
    { id: 'all', name: 'All News', icon: Globe },
    { id: 'breaking', name: 'Breaking', icon: TrendingUp },
    { id: 'technology', name: 'Technology', icon: Globe },
    { id: 'business', name: 'Business', icon: TrendingUp },
    { id: 'sports', name: 'Sports', icon: Globe },
    { id: 'entertainment', name: 'Entertainment', icon: Star },
    { id: 'health', name: 'Health', icon: Heart },
    { id: 'science', name: 'Science', icon: Globe },
    { id: 'politics', name: 'Politics', icon: Globe },
    { id: 'world', name: 'World', icon: MapPin }
  ]

  const sources: NewsSource[] = [
    { id: 'bbc', name: 'BBC News', logo: '🌐', category: 'general', isActive: true },
    { id: 'cnn', name: 'CNN', logo: '📺', category: 'general', isActive: true },
    { id: 'techcrunch', name: 'TechCrunch', logo: '💻', category: 'technology', isActive: true },
    { id: 'reuters', name: 'Reuters', logo: '📰', category: 'business', isActive: true },
    { id: 'espn', name: 'ESPN', logo: '⚽', category: 'sports', isActive: true },
    { id: 'variety', name: 'Variety', logo: '🎬', category: 'entertainment', isActive: true }
  ]

  // Sample news data
  useEffect(() => {
    const sampleArticles: NewsArticle[] = [
      {
        id: '1',
        title: 'Revolutionary AI Technology Transforms Healthcare Industry',
        summary: 'New artificial intelligence breakthrough promises to revolutionize medical diagnosis and treatment planning across hospitals worldwide.',
        content: 'A groundbreaking artificial intelligence system has been developed that can analyze medical images with unprecedented accuracy, potentially transforming how doctors diagnose and treat patients. The technology, developed by researchers at leading universities, uses advanced machine learning algorithms to detect patterns in medical scans that might be missed by human eyes...',
        author: 'Dr. Sarah Johnson',
        source: 'TechCrunch',
        category: 'technology',
        publishedAt: '2024-01-15T10:30:00Z',
        imageUrl: 'https://images.pexels.com/photos/3825581/pexels-photo-3825581.jpeg?auto=compress&cs=tinysrgb&w=800',
        url: 'https://example.com/ai-healthcare',
        readTime: 5,
        views: 12500,
        likes: 342,
        comments: 89,
        isBookmarked: false,
        tags: ['AI', 'Healthcare', 'Technology', 'Innovation'],
        location: 'San Francisco, CA'
      },
      {
        id: '2',
        title: 'Global Climate Summit Reaches Historic Agreement',
        summary: 'World leaders unite on ambitious climate action plan with binding commitments for carbon neutrality by 2050.',
        content: 'In a historic moment for environmental policy, representatives from 195 countries have reached a comprehensive agreement on climate action. The summit, held over five days of intensive negotiations, resulted in binding commitments that go beyond previous accords...',
        author: 'Michael Chen',
        source: 'Reuters',
        category: 'world',
        publishedAt: '2024-01-15T08:15:00Z',
        imageUrl: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=800',
        url: 'https://example.com/climate-summit',
        readTime: 7,
        views: 8900,
        likes: 567,
        comments: 123,
        isBookmarked: true,
        tags: ['Climate', 'Environment', 'Politics', 'Global'],
        location: 'Geneva, Switzerland'
      },
      {
        id: '3',
        title: 'Stock Markets Surge Following Economic Recovery Data',
        summary: 'Major indices hit record highs as unemployment drops and consumer confidence reaches five-year peak.',
        content: 'Financial markets experienced significant gains today following the release of encouraging economic data. The unemployment rate fell to its lowest level in five years, while consumer confidence surveys showed marked improvement...',
        author: 'Emma Rodriguez',
        source: 'BBC News',
        category: 'business',
        publishedAt: '2024-01-15T06:45:00Z',
        imageUrl: 'https://images.pexels.com/photos/590041/pexels-photo-590041.jpeg?auto=compress&cs=tinysrgb&w=800',
        url: 'https://example.com/stock-surge',
        readTime: 4,
        views: 15600,
        likes: 234,
        comments: 67,
        isBookmarked: false,
        tags: ['Finance', 'Economy', 'Markets', 'Business'],
        location: 'New York, NY'
      },
      {
        id: '4',
        title: 'Championship Final Breaks Viewership Records',
        summary: 'Historic sports finale draws largest global audience in tournament history with thrilling overtime victory.',
        content: 'Last night\'s championship final will be remembered as one of the greatest games in sports history. The match, which went into double overtime, captivated audiences worldwide and broke multiple viewership records...',
        author: 'James Wilson',
        source: 'ESPN',
        category: 'sports',
        publishedAt: '2024-01-14T23:30:00Z',
        imageUrl: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800',
        url: 'https://example.com/championship-final',
        readTime: 6,
        views: 22100,
        likes: 891,
        comments: 245,
        isBookmarked: true,
        tags: ['Sports', 'Championship', 'Records', 'Entertainment'],
        location: 'Los Angeles, CA'
      },
      {
        id: '5',
        title: 'Breakthrough in Quantum Computing Achieved',
        summary: 'Scientists demonstrate quantum supremacy with new processor that solves complex problems in seconds.',
        content: 'A team of quantum physicists has achieved a major breakthrough in quantum computing, developing a processor that can solve certain complex mathematical problems exponentially faster than traditional computers...',
        author: 'Dr. Lisa Park',
        source: 'TechCrunch',
        category: 'science',
        publishedAt: '2024-01-14T16:20:00Z',
        imageUrl: 'https://images.pexels.com/photos/2004161/pexels-photo-2004161.jpeg?auto=compress&cs=tinysrgb&w=800',
        url: 'https://example.com/quantum-breakthrough',
        readTime: 8,
        views: 9800,
        likes: 445,
        comments: 156,
        isBookmarked: false,
        tags: ['Quantum', 'Computing', 'Science', 'Innovation'],
        location: 'Cambridge, MA'
      },
      {
        id: '6',
        title: 'New Streaming Platform Launches with Exclusive Content',
        summary: 'Entertainment giant unveils revolutionary streaming service featuring original series and interactive experiences.',
        content: 'The entertainment industry sees another major player enter the streaming wars with the launch of a new platform that promises to redefine how we consume digital content. The service features cutting-edge technology...',
        author: 'Rachel Green',
        source: 'Variety',
        category: 'entertainment',
        publishedAt: '2024-01-14T14:10:00Z',
        imageUrl: 'https://images.pexels.com/photos/1040160/pexels-photo-1040160.jpeg?auto=compress&cs=tinysrgb&w=800',
        url: 'https://example.com/streaming-launch',
        readTime: 5,
        views: 7200,
        likes: 298,
        comments: 78,
        isBookmarked: false,
        tags: ['Streaming', 'Entertainment', 'Technology', 'Media'],
        location: 'Hollywood, CA'
      }
    ]
    
    setArticles(sampleArticles)
    setBookmarkedArticles(['2', '4'])
  }, [])

  const filteredArticles = articles.filter(article => {
    const matchesCategory = activeCategory === 'all' || article.category === activeCategory
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.author.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleRefresh = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const toggleBookmark = (articleId: string) => {
    setBookmarkedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    )
    
    setArticles(prev => prev.map(article => 
      article.id === articleId 
        ? { ...article, isBookmarked: !article.isBookmarked }
        : article
    ))
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="flex flex-col h-full bg-white">
       

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Categories</h3>
                <div className="space-y-1">
                  {categories.map((category) => {
                    const Icon = category.icon
                    return (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeCategory === category.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{category.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Sources */}
              <div className="p-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Sources</h3>
                <div className="space-y-2">
                  {sources.map((source) => (
                    <div key={source.id} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={source.isActive}
                        onChange={() => {}}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-lg">{source.logo}</span>
                      <span className="text-sm text-gray-600">{source.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedArticle ? (
            /* Article Detail View */
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto p-6">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to articles</span>
                </button>

                <article className="space-y-6">
                  <header className="space-y-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                        {selectedArticle.category.toUpperCase()}
                      </span>
                      <span>{selectedArticle.source}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(selectedArticle.publishedAt)}</span>
                      <span>•</span>
                      <span>{selectedArticle.readTime} min read</span>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                      {selectedArticle.title}
                    </h1>

                    <p className="text-xl text-gray-600 leading-relaxed">
                      {selectedArticle.summary}
                    </p>

                    <div className="flex items-center justify-between py-4 border-y border-gray-200">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{selectedArticle.author}</span>
                        </div>
                        {selectedArticle.location && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{selectedArticle.location}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => toggleBookmark(selectedArticle.id)}
                          className={`p-2 rounded-full ${
                            selectedArticle.isBookmarked
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200">
                          <Share className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </header>

                  <div className="space-y-6">
                    <img
                      src={selectedArticle.imageUrl}
                      alt={selectedArticle.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />

                    <div className="prose prose-lg max-w-none">
                      <p className="text-gray-700 leading-relaxed">
                        {selectedArticle.content}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {selectedArticle.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center space-x-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                          <Tag className="w-3 h-3" />
                          <span>{tag}</span>
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between py-4 border-t border-gray-200">
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Eye className="w-4 h-4" />
                          <span>{formatNumber(selectedArticle.views)} views</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Heart className="w-4 h-4" />
                          <span>{formatNumber(selectedArticle.likes)} likes</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MessageCircle className="w-4 h-4" />
                          <span>{selectedArticle.comments} comments</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          ) : (
            /* Articles List View */
            <>
              {/* Toolbar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {activeCategory === 'all' ? 'All News' : categories.find(c => c.id === activeCategory)?.name}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {filteredArticles.length} articles
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                      <div className="bg-current rounded-sm"></div>
                      <div className="bg-current rounded-sm"></div>
                      <div className="bg-current rounded-sm"></div>
                      <div className="bg-current rounded-sm"></div>
                    </div>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <div className="w-4 h-4 flex flex-col space-y-1">
                      <div className="h-0.5 bg-current rounded"></div>
                      <div className="h-0.5 bg-current rounded"></div>
                      <div className="h-0.5 bg-current rounded"></div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Articles Grid/List */}
              <div className="flex-1 overflow-y-auto p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                      <p className="text-gray-600">Loading latest news...</p>
                    </div>
                  </div>
                ) : filteredArticles.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No articles found</h3>
                      <p className="text-gray-600">Try adjusting your search or category filters</p>
                    </div>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                    {filteredArticles.map((article) => (
                      <article
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className={`cursor-pointer group ${
                          viewMode === 'grid'
                            ? 'bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow'
                            : 'flex space-x-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow'
                        }`}
                      >
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className={viewMode === 'grid' ? 'w-full h-48 object-cover' : 'w-24 h-24 object-cover rounded-lg flex-shrink-0'}
                        />
                        
                        <div className={viewMode === 'grid' ? 'p-4' : 'flex-1 min-w-0'}>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                              {article.category.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500">{formatTimeAgo(article.publishedAt)}</span>
                          </div>

                          <h3 className={`font-semibold text-gray-900 group-hover:text-blue-600 transition-colors ${
                            viewMode === 'grid' ? 'text-lg mb-2 line-clamp-2' : 'text-base mb-1 line-clamp-1'
                          }`}>
                            {article.title}
                          </h3>

                          <p className={`text-gray-600 ${viewMode === 'grid' ? 'text-sm line-clamp-3 mb-3' : 'text-sm line-clamp-2 mb-2'}`}>
                            {article.summary}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>{article.source}</span>
                              <span>•</span>
                              <span>{article.readTime} min</span>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleBookmark(article.id)
                              }}
                              className={`p-1 rounded ${
                                bookmarkedArticles.includes(article.id)
                                  ? 'text-blue-600'
                                  : 'text-gray-400 hover:text-gray-600'
                              }`}
                            >
                              <Bookmark className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}