"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism"
import { useTheme } from "next-themes"
import {
  FileText,
  FileJson,
  FileSpreadsheet,
  FileCode,
  Upload,
  Copy,
  Check,
  Download,
  Sparkles,
  Trash2,
} from "lucide-react"

type FileType = "txt" | "md" | "json" | "csv" | "unknown"

interface ParsedCSV {
  headers: string[]
  rows: string[][]
}

export function TextViewerApp() {
  const { resolvedTheme } = useTheme()
  const darkMode = resolvedTheme === "dark"
  const [content, setContent] = useState<string>("")
  const [fileType, setFileType] = useState<FileType>("txt")
  const [fileName, setFileName] = useState<string>("")
  const [jsonParsed, setJsonParsed] = useState<any>(null)
  const [csvData, setCsvData] = useState<ParsedCSV | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Helper: detect type from filename or content
  const detectType = (name: string): FileType => {
    const ext = name.split(".").pop()?.toLowerCase()
    switch (ext) {
      case "md": return "md"
      case "json": return "json"
      case "csv": return "csv"
      case "txt": return "txt"
      default: return "unknown"
    }
  }

  // Parse CSV (simple: supports commas, handles quotes)
  const parseCSV = (text: string): ParsedCSV | null => {
    try {
      const lines = text.split(/\r?\n/).filter(l => l.trim())
      if (lines.length === 0) return null
      const headers = lines[0].split(",").map(h => h.replace(/^"|"$/g, "").trim())
      const rows = lines.slice(1).map(line => {
        const values: string[] = []
        let inQuote = false
        let current = ""
        for (let i = 0; i < line.length; i++) {
          const ch = line[i]
          if (ch === '"') {
            inQuote = !inQuote
          } else if (ch === "," && !inQuote) {
            values.push(current.trim())
            current = ""
          } else {
            current += ch
          }
        }
        values.push(current.trim())
        return values.map(v => v.replace(/^"|"$/g, ""))
      })
      return { headers, rows }
    } catch {
      return null
    }
  }

  // Beautify JSON
  const beautifyJSON = (raw: string) => {
    try {
      const parsed = JSON.parse(raw)
      setJsonParsed(parsed)
      setContent(JSON.stringify(parsed, null, 2))
      setError(null)
    } catch (err) {
      setError("Invalid JSON – cannot beautify")
    }
  }

  // Process file content after reading
  const processFile = (text: string, type: FileType, name: string) => {
    setFileName(name)
    setFileType(type)
    setError(null)
    if (type === "json") {
      try {
        const parsed = JSON.parse(text)
        setJsonParsed(parsed)
        setContent(JSON.stringify(parsed, null, 2))
      } catch {
        setContent(text)
        setJsonParsed(null)
        setError("Invalid JSON – syntax highlighting may be off")
      }
    } else if (type === "csv") {
      const parsed = parseCSV(text)
      setCsvData(parsed)
      setContent(text)
    } else {
      setContent(text)
      setJsonParsed(null)
      setCsvData(null)
    }
  }

  const readFile = (file: File) => {
    const reader = new FileReader()
    const type = detectType(file.name)
    reader.onload = (e) => {
      const text = e.target?.result as string
      processFile(text, type, file.name)
    }
    reader.readAsText(file)
  }

  // Dropzone handler
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      readFile(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "text/markdown": [".md"],
      "application/json": [".json"],
      "text/csv": [".csv"],
    },
    maxFiles: 1,
  })

  // Handle manual file input
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      readFile(e.target.files[0])
    }
  }

  // Beautify action for JSON/CSV
  const handleBeautify = () => {
    if (fileType === "json") {
      beautifyJSON(content)
    } else if (fileType === "csv" && csvData) {
      // Rebuild CSV with consistent column width? Already parsed, we can re-stringify.
      const { headers, rows } = csvData
      const newRows = [headers, ...rows]
      const newCSV = newRows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n")
      setContent(newCSV)
      setCsvData(parseCSV(newCSV))
    } else {
      setError("Beautify only available for JSON and CSV files")
    }
  }

  // Copy content to clipboard
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Download current content
  const downloadFile = () => {
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName || (fileType === "json" ? "document.json" : `document.${fileType}`)
    a.click()
    URL.revokeObjectURL(url)
  }

  // Clear current view
  const clearContent = () => {
    setContent("")
    setFileName("")
    setFileType("txt")
    setJsonParsed(null)
    setCsvData(null)
    setError(null)
  }

  // Render content based on type
  const renderContent = () => {
    if (!content && !isDragActive) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Upload className="w-12 h-12 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">Drag & drop a file or click to browse</p>
          <p className="text-xs text-muted-foreground mt-1">Supported: .txt, .md, .json, .csv</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="rounded-lg bg-red-500/10 p-4 text-red-600 dark:text-red-400 text-sm">
          ⚠️ {error}
        </div>
      )
    }

    switch (fileType) {
      case "md":
        return (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                code({ inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "")
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={darkMode ? oneDark : oneLight}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )
      case "json":
        return (
          <SyntaxHighlighter
            language="json"
            style={darkMode ? oneDark : oneLight}
            showLineNumbers
            wrapLines
            customStyle={{ margin: 0, borderRadius: "0.5rem" }}
          >
            {content}
          </SyntaxHighlighter>
        )
      case "csv":
        if (csvData && csvData.headers.length > 0) {
          return (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="min-w-full text-sm">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    {csvData.headers.map((h, i) => (
                      <th key={i} className="px-3 py-2 text-left font-semibold text-foreground">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {csvData.rows.map((row, i) => (
                    <tr key={i} className="hover:bg-muted/30">
                      {row.map((cell, j) => (
                        <td key={j} className="px-3 py-2 text-foreground">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
        return <pre className="p-3 font-mono text-sm bg-secondary rounded-lg whitespace-pre-wrap">{content}</pre>
      default:
        return <pre className="p-3 font-mono text-sm bg-secondary rounded-lg whitespace-pre-wrap">{content}</pre>
    }
  }

  // Icon based on file type
  const FileIcon = () => {
    switch (fileType) {
      case "md": return <FileText className="w-4 h-4" />
      case "json": return <FileJson className="w-4 h-4" />
      case "csv": return <FileSpreadsheet className="w-4 h-4" />
      default: return <FileCode className="w-4 h-4" />
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 shrink-0 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary">
            <FileText className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Text Viewer & Beautifier</h2>
            <p className="text-xs text-muted-foreground">View, format, and beautify text files</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept=".txt,.md,.json,.csv"
            onChange={handleFileSelect}
            className="hidden"
            id="file-input"
          />
          <label
            htmlFor="file-input"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted hover:bg-muted/80 cursor-pointer transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Open File
          </label>
          {content && (
            <>
              <button
                onClick={handleBeautify}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20"
                title="Beautify JSON/CSV"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Beautify
              </button>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted hover:bg-muted/80"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                onClick={downloadFile}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted hover:bg-muted/80"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
              <button
                onClick={clearContent}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Drag & Drop Zone + Content */}
      <div
        {...getRootProps()}
        className={`flex-1 overflow-y-auto p-5 transition-colors ${
          isDragActive ? "bg-primary/5 border-2 border-primary border-dashed rounded-xl" : ""
        }`}
      >
        <input {...getInputProps()} />
        <div className="max-w-5xl mx-auto">
          {fileName && (
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
              <FileIcon />
              <span className="text-sm font-medium text-foreground">{fileName}</span>
              <span className="text-xs text-muted-foreground uppercase">({fileType})</span>
            </div>
          )}
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default TextViewerApp