"use client"

import { useState, useRef, useEffect } from "react"
import { QrCode, Camera, Upload, Download, Copy, Share, Settings, Scan, FileText, Link, Wifi, Phone, Mail, MapPin, CreditCard, Calendar, User, Smartphone, Monitor, Palette, Eye, EyeOff, RotateCcw, Save, History, Trash2, ExternalLink, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, Info, Zap, Image as ImageIcon, FileImage, ScanLine } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface QRCodeData {
  id: string
  type: 'text' | 'url' | 'wifi' | 'phone' | 'email' | 'location' | 'vcard' | 'event'
  content: string
  displayText: string
  createdAt: string
  scannedAt?: string
  customization: {
    size: number
    errorCorrection: 'L' | 'M' | 'Q' | 'H'
    foregroundColor: string
    backgroundColor: string
    logoUrl?: string
    style: 'square' | 'rounded' | 'dots'
  }
}

interface ScanResult {
  id: string
  content: string
  type: string
  timestamp: string
  confidence: number
  source: 'camera' | 'upload'
}

export function QRCodeApp() {
  const [activeTab, setActiveTab] = useState<'generate' | 'scan' | 'history'>('generate')
  const [qrType, setQrType] = useState<QRCodeData['type']>('text')
  const [qrContent, setQrContent] = useState('')
  const [generatedQR, setGeneratedQR] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [scanResults, setScanResults] = useState<ScanResult[]>([])
  const [qrHistory, setQrHistory] = useState<QRCodeData[]>([])
  const [showPreview, setShowPreview] = useState(true)
  
  // Customization options
  const [qrSize, setQrSize] = useState([256])
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M')
  const [foregroundColor, setForegroundColor] = useState('#000000')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [qrStyle, setQrStyle] = useState<'square' | 'rounded' | 'dots'>('square')
  const [logoFile, setLogoFile] = useState<File | null>(null)

  // Form data for different QR types
  const [formData, setFormData] = useState({
    text: '',
    url: '',
    wifi: { ssid: '', password: '', security: 'WPA', hidden: false },
    phone: '',
    email: { address: '', subject: '', body: '' },
    location: { lat: '', lng: '', label: '' },
    vcard: { name: '', phone: '', email: '', organization: '', url: '' },
    event: { title: '', start: '', end: '', location: '', description: '' }
  })

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  // QR Code types configuration
  const qrTypes = [
    { value: 'text', label: 'Plain Text', icon: FileText, description: 'Simple text content' },
    { value: 'url', label: 'Website URL', icon: Link, description: 'Web links and URLs' },
    { value: 'wifi', label: 'WiFi Network', icon: Wifi, description: 'WiFi connection details' },
    { value: 'phone', label: 'Phone Number', icon: Phone, description: 'Phone numbers for calling' },
    { value: 'email', label: 'Email', icon: Mail, description: 'Email addresses with subject' },
    { value: 'location', label: 'Location', icon: MapPin, description: 'GPS coordinates' },
    { value: 'vcard', label: 'Contact Card', icon: User, description: 'Contact information' },
    { value: 'event', label: 'Calendar Event', icon: Calendar, description: 'Calendar events' }
  ]

  // Generate QR Code using a QR library simulation
  const generateQRCode = async () => {
    setIsGenerating(true)
    
    try {
      let content = ''
      
      switch (qrType) {
        case 'text':
          content = formData.text
          break
        case 'url':
          content = formData.url.startsWith('http') ? formData.url : `https://${formData.url}`
          break
        case 'wifi':
          content = `WIFI:T:${formData.wifi.security};S:${formData.wifi.ssid};P:${formData.wifi.password};H:${formData.wifi.hidden ? 'true' : 'false'};;`
          break
        case 'phone':
          content = `tel:${formData.phone}`
          break
        case 'email':
          content = `mailto:${formData.email.address}?subject=${encodeURIComponent(formData.email.subject)}&body=${encodeURIComponent(formData.email.body)}`
          break
        case 'location':
          content = `geo:${formData.location.lat},${formData.location.lng}?q=${encodeURIComponent(formData.location.label)}`
          break
        case 'vcard':
          content = `BEGIN:VCARD\nVERSION:3.0\nFN:${formData.vcard.name}\nTEL:${formData.vcard.phone}\nEMAIL:${formData.vcard.email}\nORG:${formData.vcard.organization}\nURL:${formData.vcard.url}\nEND:VCARD`
          break
        case 'event':
          content = `BEGIN:VEVENT\nSUMMARY:${formData.event.title}\nDTSTART:${formData.event.start}\nDTEND:${formData.event.end}\nLOCATION:${formData.event.location}\nDESCRIPTION:${formData.event.description}\nEND:VEVENT`
          break
      }

      // Simulate QR code generation (in real app, use QRCode.js or similar)
      const qrData = await generateQRDataURL(content)
      setGeneratedQR(qrData)
      
      // Save to history
      const newQR: QRCodeData = {
        id: Date.now().toString(),
        type: qrType,
        content,
        displayText: getDisplayText(qrType, content),
        createdAt: new Date().toISOString(),
        customization: {
          size: qrSize[0],
          errorCorrection,
          foregroundColor,
          backgroundColor,
          style: qrStyle
        }
      }
      
      setQrHistory(prev => [newQR, ...prev.slice(0, 19)]) // Keep last 20
      
    } catch (error) {
      console.error('QR generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Simulate QR code generation
  const generateQRDataURL = async (content: string): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real implementation, this would use QRCode.js or similar
        // For demo, we'll create a simple colored square
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        const size = qrSize[0]
        
        canvas.width = size
        canvas.height = size
        
        // Background
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, size, size)
        
        // QR pattern simulation
        ctx.fillStyle = foregroundColor
        const moduleSize = size / 25
        
        for (let i = 0; i < 25; i++) {
          for (let j = 0; j < 25; j++) {
            if (Math.random() > 0.5) {
              if (qrStyle === 'rounded') {
                ctx.beginPath()
                ctx.roundRect(i * moduleSize, j * moduleSize, moduleSize * 0.9, moduleSize * 0.9, moduleSize * 0.2)
                ctx.fill()
              } else if (qrStyle === 'dots') {
                ctx.beginPath()
                ctx.arc(i * moduleSize + moduleSize/2, j * moduleSize + moduleSize/2, moduleSize * 0.4, 0, 2 * Math.PI)
                ctx.fill()
              } else {
                ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize * 0.9, moduleSize * 0.9)
              }
            }
          }
        }
        
        resolve(canvas.toDataURL())
      }, 500)
    })
  }

  const getDisplayText = (type: QRCodeData['type'], content: string): string => {
    switch (type) {
      case 'url': return content.length > 50 ? content.substring(0, 50) + '...' : content
      case 'wifi': return `WiFi: ${formData.wifi.ssid}`
      case 'phone': return `Phone: ${formData.phone}`
      case 'email': return `Email: ${formData.email.address}`
      case 'location': return `Location: ${formData.location.label || 'GPS Coordinates'}`
      case 'vcard': return `Contact: ${formData.vcard.name}`
      case 'event': return `Event: ${formData.event.title}`
      default: return content.length > 50 ? content.substring(0, 50) + '...' : content
    }
  }

  // Camera scanning
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      setCameraStream(stream)
      setIsScanning(true)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Camera access failed:', error)
    }
  }

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
    setIsScanning(false)
  }

  // File upload scanning
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      // Simulate QR code scanning from image
      const result = await scanQRFromFile(file)
      if (result) {
        const scanResult: ScanResult = {
          id: Date.now().toString(),
          content: result,
          type: detectQRType(result),
          timestamp: new Date().toISOString(),
          confidence: 0.95,
          source: 'upload'
        }
        setScanResults(prev => [scanResult, ...prev.slice(0, 19)])
      }
    } catch (error) {
      console.error('File scan failed:', error)
    }
  }

  const scanQRFromFile = async (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      // Simulate QR scanning - in real app use jsQR or similar
      setTimeout(() => {
        const sampleResults = [
          'https://example.com/sample-url',
          'Sample QR Code Content',
          'WIFI:T:WPA;S:MyNetwork;P:password123;H:false;;',
          'mailto:test@example.com?subject=Hello',
          'tel:+1234567890'
        ]
        resolve(sampleResults[Math.floor(Math.random() * sampleResults.length)])
      }, 1000)
    })
  }

  const detectQRType = (content: string): string => {
    if (content.startsWith('http')) return 'URL'
    if (content.startsWith('WIFI:')) return 'WiFi'
    if (content.startsWith('mailto:')) return 'Email'
    if (content.startsWith('tel:')) return 'Phone'
    if (content.startsWith('geo:')) return 'Location'
    if (content.includes('BEGIN:VCARD')) return 'Contact'
    if (content.includes('BEGIN:VEVENT')) return 'Event'
    return 'Text'
  }

  // Download QR code
  const downloadQR = () => {
    if (!generatedQR) return
    
    const link = document.createElement('a')
    link.download = `qr-code-${Date.now()}.png`
    link.href = generatedQR
    link.click()
  }

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const renderGenerateTab = () => (
    <div className="space-y-6">
      {/* QR Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">QR Code Type</CardTitle>
          <CardDescription>Choose what type of content to encode</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {qrTypes.map((type) => (
              <Button
                key={type.value}
                variant={qrType === type.value ? "default" : "outline"}
                className="h-auto p-3 flex flex-col gap-2"
                onClick={() => setQrType(type.value as QRCodeData['type'])}
              >
                <type.icon className="h-5 w-5" />
                <div className="text-center">
                  <div className="text-sm font-medium">{type.label}</div>
                  <div className="text-xs text-muted-foreground">{type.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Input */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Content</CardTitle>
            <CardDescription>Enter the information to encode</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {qrType === 'text' && (
              <div>
                <Label htmlFor="text-content">Text Content</Label>
                <Textarea
                  id="text-content"
                  placeholder="Enter your text here..."
                  value={formData.text}
                  onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                  rows={4}
                />
              </div>
            )}

            {qrType === 'url' && (
              <div>
                <Label htmlFor="url-content">Website URL</Label>
                <Input
                  id="url-content"
                  placeholder="https://example.com"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                />
              </div>
            )}

            {qrType === 'wifi' && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="wifi-ssid">Network Name (SSID)</Label>
                  <Input
                    id="wifi-ssid"
                    placeholder="MyWiFiNetwork"
                    value={formData.wifi.ssid}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      wifi: { ...prev.wifi, ssid: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="wifi-password">Password</Label>
                  <Input
                    id="wifi-password"
                    type="password"
                    placeholder="WiFi password"
                    value={formData.wifi.password}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      wifi: { ...prev.wifi, password: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="wifi-security">Security Type</Label>
                  <Select
                    value={formData.wifi.security}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      wifi: { ...prev.wifi, security: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WPA">WPA/WPA2</SelectItem>
                      <SelectItem value="WEP">WEP</SelectItem>
                      <SelectItem value="nopass">Open Network</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="wifi-hidden"
                    checked={formData.wifi.hidden}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      wifi: { ...prev.wifi, hidden: checked }
                    }))}
                  />
                  <Label htmlFor="wifi-hidden">Hidden Network</Label>
                </div>
              </div>
            )}

            {qrType === 'phone' && (
              <div>
                <Label htmlFor="phone-number">Phone Number</Label>
                <Input
                  id="phone-number"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            )}

            {qrType === 'email' && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="email-address">Email Address</Label>
                  <Input
                    id="email-address"
                    type="email"
                    placeholder="contact@example.com"
                    value={formData.email.address}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      email: { ...prev.email, address: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email-subject">Subject (Optional)</Label>
                  <Input
                    id="email-subject"
                    placeholder="Email subject"
                    value={formData.email.subject}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      email: { ...prev.email, subject: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email-body">Message (Optional)</Label>
                  <Textarea
                    id="email-body"
                    placeholder="Email message"
                    value={formData.email.body}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      email: { ...prev.email, body: e.target.value }
                    }))}
                    rows={3}
                  />
                </div>
              </div>
            )}

            {qrType === 'location' && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="location-lat">Latitude</Label>
                  <Input
                    id="location-lat"
                    placeholder="37.7749"
                    value={formData.location.lat}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      location: { ...prev.location, lat: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="location-lng">Longitude</Label>
                  <Input
                    id="location-lng"
                    placeholder="-122.4194"
                    value={formData.location.lng}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      location: { ...prev.location, lng: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="location-label">Location Label (Optional)</Label>
                  <Input
                    id="location-label"
                    placeholder="San Francisco, CA"
                    value={formData.location.label}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      location: { ...prev.location, label: e.target.value }
                    }))}
                  />
                </div>
              </div>
            )}

            {qrType === 'vcard' && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="vcard-name">Full Name</Label>
                  <Input
                    id="vcard-name"
                    placeholder="John Doe"
                    value={formData.vcard.name}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      vcard: { ...prev.vcard, name: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="vcard-phone">Phone Number</Label>
                  <Input
                    id="vcard-phone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.vcard.phone}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      vcard: { ...prev.vcard, phone: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="vcard-email">Email</Label>
                  <Input
                    id="vcard-email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.vcard.email}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      vcard: { ...prev.vcard, email: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="vcard-org">Organization</Label>
                  <Input
                    id="vcard-org"
                    placeholder="Company Name"
                    value={formData.vcard.organization}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      vcard: { ...prev.vcard, organization: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="vcard-url">Website</Label>
                  <Input
                    id="vcard-url"
                    placeholder="https://example.com"
                    value={formData.vcard.url}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      vcard: { ...prev.vcard, url: e.target.value }
                    }))}
                  />
                </div>
              </div>
            )}

            {qrType === 'event' && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="event-title">Event Title</Label>
                  <Input
                    id="event-title"
                    placeholder="Meeting Title"
                    value={formData.event.title}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      event: { ...prev.event, title: e.target.value }
                    }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="event-start">Start Date/Time</Label>
                    <Input
                      id="event-start"
                      type="datetime-local"
                      value={formData.event.start}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        event: { ...prev.event, start: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="event-end">End Date/Time</Label>
                    <Input
                      id="event-end"
                      type="datetime-local"
                      value={formData.event.end}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        event: { ...prev.event, end: e.target.value }
                      }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="event-location">Location</Label>
                  <Input
                    id="event-location"
                    placeholder="Conference Room A"
                    value={formData.event.location}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      event: { ...prev.event, location: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="event-description">Description</Label>
                  <Textarea
                    id="event-description"
                    placeholder="Event description"
                    value={formData.event.description}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      event: { ...prev.event, description: e.target.value }
                    }))}
                    rows={3}
                  />
                </div>
              </div>
            )}

            <Button 
              onClick={generateQRCode} 
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4 mr-2" />
                  Generate QR Code
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Customization & Preview */}
        <div className="space-y-6">
          {/* Customization */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customization</CardTitle>
              <CardDescription>Customize the appearance of your QR code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Size: {qrSize[0]}px</Label>
                <Slider
                  value={qrSize}
                  onValueChange={setQrSize}
                  min={128}
                  max={512}
                  step={32}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="error-correction">Error Correction</Label>
                <Select value={errorCorrection} onValueChange={(value: any) => setErrorCorrection(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Low (7%)</SelectItem>
                    <SelectItem value="M">Medium (15%)</SelectItem>
                    <SelectItem value="Q">Quartile (25%)</SelectItem>
                    <SelectItem value="H">High (30%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="fg-color">Foreground Color</Label>
                  <Input
                    id="fg-color"
                    type="color"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div>
                  <Label htmlFor="bg-color">Background Color</Label>
                  <Input
                    id="bg-color"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>

              <div>
                <Label>Style</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[
                    { value: 'square', label: 'Square' },
                    { value: 'rounded', label: 'Rounded' },
                    { value: 'dots', label: 'Dots' }
                  ].map((style) => (
                    <Button
                      key={style.value}
                      variant={qrStyle === style.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setQrStyle(style.value as any)}
                    >
                      {style.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="logo-upload">Logo (Optional)</Label>
                <div className="mt-2">
                  <Button
                    variant="outline"
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {logoFile ? logoFile.name : 'Upload Logo'}
                  </Button>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {showPreview && generatedQR && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preview</CardTitle>
                <CardDescription>Your generated QR code</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    <img
                      src={generatedQR}
                      alt="Generated QR Code"
                      className="max-w-full h-auto"
                      style={{ width: qrSize[0], height: qrSize[0] }}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={downloadQR} size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button 
                      onClick={() => copyToClipboard(generatedQR)} 
                      variant="outline" 
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )

  const renderScanTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera Scanner */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Camera Scanner</CardTitle>
            <CardDescription>Use your camera to scan QR codes in real-time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
              {isScanning ? (
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-primary rounded-lg">
                      <ScanLine className="w-full h-1 text-primary animate-pulse" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Camera preview will appear here</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              {!isScanning ? (
                <Button onClick={startCamera} className="flex-1">
                  <Camera className="w-4 h-4 mr-2" />
                  Start Camera
                </Button>
              ) : (
                <Button onClick={stopCamera} variant="destructive" className="flex-1">
                  <Eye className="w-4 h-4 mr-2" />
                  Stop Camera
                </Button>
              )}
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Camera Access</AlertTitle>
              <AlertDescription>
                Allow camera access to scan QR codes. Position the QR code within the scanning area.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* File Upload Scanner */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">File Upload Scanner</CardTitle>
            <CardDescription>Upload an image containing a QR code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-center">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Click to upload image</p>
                <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <Alert>
              <ImageIcon className="h-4 w-4" />
              <AlertTitle>Supported Formats</AlertTitle>
              <AlertDescription>
                Upload images in PNG, JPG, or GIF format. The QR code should be clearly visible.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Scan Results */}
      {scanResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Scans</CardTitle>
            <CardDescription>QR codes you've recently scanned</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scanResults.slice(0, 5).map((result) => (
                <div key={result.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    <Badge variant="secondary">{result.type}</Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{result.content}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{new Date(result.timestamp).toLocaleString()}</span>
                      <span>•</span>
                      <span>{result.source}</span>
                      <span>•</span>
                      <span>{Math.round(result.confidence * 100)}% confidence</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(result.content)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    {result.content.startsWith('http') && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={result.content} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderHistoryTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">QR Code History</h3>
          <p className="text-muted-foreground">Your recently generated QR codes</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setQrHistory([])}
          disabled={qrHistory.length === 0}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear History
        </Button>
      </div>

      {qrHistory.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No QR codes yet</h3>
              <p className="text-muted-foreground">Generated QR codes will appear here</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {qrHistory.map((qr) => (
            <Card key={qr.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="secondary">{qr.type.toUpperCase()}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(qr.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <h4 className="font-medium mb-2 truncate">{qr.displayText}</h4>
                
                <div className="text-sm text-muted-foreground mb-3">
                  <div>Size: {qr.customization.size}px</div>
                  <div>Error Correction: {qr.customization.errorCorrection}</div>
                  <div>Style: {qr.customization.style}</div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-background">
       

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-6">
          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="generate" className="gap-2">
                <QrCode className="w-4 h-4" />
                Generate
              </TabsTrigger>
              <TabsTrigger value="scan" className="gap-2">
                <Scan className="w-4 h-4" />
                Scan
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="w-4 h-4" />
                History
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto">
              <TabsContent value="generate" className="mt-0">
                {renderGenerateTab()}
              </TabsContent>

              <TabsContent value="scan" className="mt-0">
                {renderScanTab()}
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                {renderHistoryTab()}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}