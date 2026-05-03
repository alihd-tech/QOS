"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Database,
  Table,
  Play,
  Save,
  Plus,
  Trash2,
  Edit,
  X,
  Check,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Search,
  AlertCircle,
  Terminal,
  Columns,
  Key,
  Type,
  Hash,
  Calendar,
} from "lucide-react"

// Mock database schema and data
interface Column {
  name: string
  type: string
  primaryKey?: boolean
}

interface TableData {
  name: string
  columns: Column[]
  rows: Record<string, any>[]
}

const initialDatabase: Record<string, TableData> = {
  users: {
    name: "users",
    columns: [
      { name: "id", type: "INTEGER", primaryKey: true },
      { name: "name", type: "TEXT" },
      { name: "email", type: "TEXT" },
      { name: "age", type: "INTEGER" },
      { name: "created_at", type: "DATETIME" },
    ],
    rows: [
      { id: 1, name: "Alice Johnson", email: "alice@example.com", age: 28, created_at: "2024-01-15 10:30:00" },
      { id: 2, name: "Bob Smith", email: "bob@example.com", age: 34, created_at: "2024-01-20 14:45:00" },
      { id: 3, name: "Carol Davis", email: "carol@example.com", age: 25, created_at: "2024-02-01 09:15:00" },
    ],
  },
  products: {
    name: "products",
    columns: [
      { name: "id", type: "INTEGER", primaryKey: true },
      { name: "name", type: "TEXT" },
      { name: "price", type: "REAL" },
      { name: "stock", type: "INTEGER" },
    ],
    rows: [
      { id: 1, name: "Laptop", price: 999.99, stock: 15 },
      { id: 2, name: "Mouse", price: 29.99, stock: 100 },
      { id: 3, name: "Keyboard", price: 79.99, stock: 45 },
    ],
  },
  orders: {
    name: "orders",
    columns: [
      { name: "id", type: "INTEGER", primaryKey: true },
      { name: "user_id", type: "INTEGER" },
      { name: "product_id", type: "INTEGER" },
      { name: "quantity", type: "INTEGER" },
      { name: "order_date", type: "DATETIME" },
    ],
    rows: [
      { id: 1, user_id: 1, product_id: 1, quantity: 1, order_date: "2024-02-10 12:00:00" },
      { id: 2, user_id: 2, product_id: 2, quantity: 2, order_date: "2024-02-11 15:30:00" },
      { id: 3, user_id: 3, product_id: 3, quantity: 1, order_date: "2024-02-12 10:00:00" },
    ],
  },
}

export function DatabaseClientApp() {
  const [database, setDatabase] = useState<Record<string, TableData>>(initialDatabase)
  const [selectedTable, setSelectedTable] = useState<string>("users")
  const [editingRowId, setEditingRowId] = useState<number | null>(null)
  const [editingData, setEditingData] = useState<Record<string, any> | null>(null)
  const [newRowData, setNewRowData] = useState<Record<string, any> | null>(null)
  const [isAddingRow, setIsAddingRow] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM users;")
  const [queryResult, setQueryResult] = useState<any[] | null>(null)
  const [queryError, setQueryError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"browse" | "query">("browse")
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({ users: true, products: true, orders: true })
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const currentTable = database[selectedTable]
  const filteredRows = searchTerm
    ? currentTable?.rows.filter(row =>
        Object.values(row).some(val =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      ) || []
    : currentTable?.rows || []

  // Helper to show temporary notification
  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  // CRUD operations
  const handleEditStart = (row: Record<string, any>) => {
    setEditingRowId(row.id)
    setEditingData({ ...row })
  }

  const handleEditChange = (column: string, value: any) => {
    if (editingData) {
      setEditingData({ ...editingData, [column]: value })
    }
  }

  const handleEditSave = () => {
    if (!editingData || editingRowId === null) return
    const updatedRows = currentTable.rows.map(row =>
      row.id === editingRowId ? editingData : row
    )
    setDatabase({
      ...database,
      [selectedTable]: { ...currentTable, rows: updatedRows },
    })
    setEditingRowId(null)
    setEditingData(null)
    showNotification("Row updated successfully", "success")
  }

  const handleEditCancel = () => {
    setEditingRowId(null)
    setEditingData(null)
  }

  const handleDeleteRow = (rowId: number) => {
    if (confirm("Delete this row?")) {
      const updatedRows = currentTable.rows.filter(row => row.id !== rowId)
      setDatabase({
        ...database,
        [selectedTable]: { ...currentTable, rows: updatedRows },
      })
      showNotification("Row deleted", "success")
    }
  }

  const handleAddRowStart = () => {
    const newId = Math.max(...currentTable.rows.map(r => r.id), 0) + 1
    const newRow: Record<string, any> = { id: newId }
    currentTable.columns.forEach(col => {
      if (col.name !== "id") {
        if (col.type === "INTEGER") newRow[col.name] = 0
        else if (col.type === "REAL") newRow[col.name] = 0.0
        else if (col.type === "DATETIME") newRow[col.name] = new Date().toISOString().slice(0, 19).replace("T", " ")
        else newRow[col.name] = ""
      }
    })
    setNewRowData(newRow)
    setIsAddingRow(true)
  }

  const handleNewRowChange = (column: string, value: any) => {
    if (newRowData) {
      setNewRowData({ ...newRowData, [column]: value })
    }
  }

  const handleAddRowSave = () => {
    if (!newRowData) return
    // Validate required columns (simple check)
    const missing = currentTable.columns.some(col => {
      const val = newRowData[col.name]
      return (val === undefined || val === "") && col.name !== "id"
    })
    if (missing) {
      showNotification("Please fill all fields", "error")
      return
    }
    const updatedRows = [...currentTable.rows, newRowData]
    setDatabase({
      ...database,
      [selectedTable]: { ...currentTable, rows: updatedRows },
    })
    setIsAddingRow(false)
    setNewRowData(null)
    showNotification("Row added", "success")
  }

  const handleAddRowCancel = () => {
    setIsAddingRow(false)
    setNewRowData(null)
  }

  // Simulate SQL query execution (simple pattern matching)
  const executeQuery = () => {
    setQueryError(null)
    const query = sqlQuery.trim().toLowerCase()
    if (query === "") return

    // Very basic simulation - for demo purposes
    if (query.startsWith("select * from ")) {
      const tableName = query.replace("select * from ", "").replace(";", "").trim()
      if (database[tableName]) {
        setQueryResult(database[tableName].rows)
        showNotification(`Query executed: ${database[tableName].rows.length} rows returned`, "success")
      } else {
        setQueryError(`Table "${tableName}" not found`)
        setQueryResult(null)
      }
    } else if (query.startsWith("select ")) {
      // Crude support for column selection
      const match = query.match(/select (.+) from (.+)/)
      if (match) {
        const columns = match[1].split(",").map(c => c.trim())
        const tableName = match[2].replace(";", "").trim()
        if (database[tableName]) {
          const result = database[tableName].rows.map(row => {
            const newRow: any = {}
            columns.forEach(col => {
              if (row[col] !== undefined) newRow[col] = row[col]
              else newRow[col] = null
            })
            return newRow
          })
          setQueryResult(result)
          showNotification(`Query executed: ${result.length} rows`, "success")
        } else {
          setQueryError(`Table "${tableName}" not found`)
          setQueryResult(null)
        }
      } else {
        setQueryError("Invalid SELECT query (simplified demo)")
        setQueryResult(null)
      }
    } else if (query.startsWith("insert into ")) {
      showNotification("INSERT simulated (use UI to add rows)", "error")
      setQueryResult(null)
    } else if (query.startsWith("update ")) {
      showNotification("UPDATE simulated (use UI to edit cells)", "error")
      setQueryResult(null)
    } else if (query.startsWith("delete from ")) {
      showNotification("DELETE simulated (use UI delete button)", "error")
      setQueryResult(null)
    } else {
      setQueryError("Query not supported in demo. Try: SELECT * FROM users;")
      setQueryResult(null)
    }
  }

  const toggleTableExpand = (tableName: string) => {
    setExpandedTables(prev => ({ ...prev, [tableName]: !prev[tableName] }))
  }

  // Get icon for column type
  const getTypeIcon = (type: string) => {
    if (type.includes("INT")) return <Hash size={12} className="text-gray-500" />
    if (type.includes("TEXT")) return <Type size={12} className="text-gray-500" />
    if (type.includes("REAL")) return <Hash size={12} className="text-gray-500" />
    if (type.includes("DATE")) return <Calendar size={12} className="text-gray-500" />
    return <Terminal size={12} className="text-gray-500" />
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <Database size={18} className="text-blue-500" />
        <h1 className="text-sm font-semibold text-gray-900 dark:text-white">Database Client</h1>
        <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">
          SQLite • Demo Mode
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Tables List */}
        <div className="w-64 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto">
          <div className="p-3 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tables</h2>
          </div>
          <div className="py-2">
            {Object.keys(database).map(tableName => (
              <div key={tableName}>
                <button
                  onClick={() => toggleTableExpand(tableName)}
                  className="w-full flex items-center gap-1 px-3 py-1.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {expandedTables[tableName] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <span className="text-gray-700 dark:text-gray-300">{tableName}</span>
                </button>
                {expandedTables[tableName] && (
                  <button
                    onClick={() => setSelectedTable(tableName)}
                    className={`w-full pl-8 pr-3 py-1.5 text-left text-sm transition-colors ${
                      selectedTable === tableName
                        ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Table size={14} />
                      <span>{tableName}</span>
                    </div>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <button
              onClick={() => setActiveTab("browse")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "browse"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-500"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Browse Data
            </button>
            <button
              onClick={() => setActiveTab("query")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "query"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-500"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              SQL Query
            </button>
          </div>

          {activeTab === "browse" ? (
            // Browse Data Tab
            <div className="flex-1 overflow-auto p-4">
              {/* Table Info and Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedTable}</h2>
                  <div className="flex flex-wrap gap-3 mt-1">
                    {currentTable?.columns.map(col => (
                      <div key={col.name} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        {getTypeIcon(col.type)}
                        <span>{col.name}</span>
                        {col.primaryKey && <Key size={10} className="text-yellow-500" />}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search rows..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleAddRowStart}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Plus size={14} />
                    Add Row
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      {currentTable?.columns.map(col => (
                        <th key={col.name} className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {col.name}
                          {col.primaryKey && <Key size={10} className="inline ml-1 text-yellow-500" />}
                        </th>
                      ))}
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {/* Add Row Form */}
                    {isAddingRow && newRowData && (
                      <tr className="bg-blue-50 dark:bg-blue-900/20">
                        {currentTable?.columns.map(col => (
                          <td key={col.name} className="px-4 py-2">
                            <input
                              type={col.type.includes("INT") ? "number" : "text"}
                              value={newRowData[col.name] ?? ""}
                              onChange={(e) => handleNewRowChange(col.name, col.type.includes("INT") ? parseInt(e.target.value) || 0 : e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder={col.name}
                            />
                          </td>
                        ))}
                        <td className="px-4 py-2 text-right whitespace-nowrap">
                          <button onClick={handleAddRowSave} className="p-1 text-green-600 hover:text-green-700 mr-1">
                            <Check size={16} />
                          </button>
                          <button onClick={handleAddRowCancel} className="p-1 text-red-600 hover:text-red-700">
                            <X size={16} />
                          </button>
                        </td>
                      </tr>
                    )}
                    {/* Existing Rows */}
                    {filteredRows.map((row, idx) => (
                      <tr key={idx} className={editingRowId === row.id ? "bg-yellow-50 dark:bg-yellow-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"}>
                        {currentTable?.columns.map(col => (
                          <td key={col.name} className="px-4 py-2 text-sm text-gray-900 dark:text-gray-200">
                            {editingRowId === row.id ? (
                              <input
                                type={col.type.includes("INT") ? "number" : "text"}
                                value={editingData?.[col.name] ?? ""}
                                onChange={(e) => handleEditChange(col.name, col.type.includes("INT") ? parseInt(e.target.value) || 0 : e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            ) : (
                              String(row[col.name])
                            )}
                          </td>
                        ))}
                        <td className="px-4 py-2 text-right whitespace-nowrap">
                          {editingRowId === row.id ? (
                            <>
                              <button onClick={handleEditSave} className="p-1 text-green-600 hover:text-green-700 mr-1">
                                <Check size={16} />
                              </button>
                              <button onClick={handleEditCancel} className="p-1 text-red-600 hover:text-red-700">
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleEditStart(row)} className="p-1 text-blue-500 hover:text-blue-600 mr-1">
                                <Edit size={14} />
                              </button>
                              <button onClick={() => handleDeleteRow(row.id)} className="p-1 text-red-500 hover:text-red-600">
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredRows.length === 0 && !isAddingRow && (
                      <tr>
                        <td colSpan={currentTable?.columns.length! + 1} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          No data found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            // SQL Query Tab
            <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">
              <div className="bg-gray-900 dark:bg-gray-950 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-white">
                  <div className="flex items-center gap-2">
                    <Terminal size={14} />
                    <span className="text-sm font-mono">SQL Editor</span>
                  </div>
                  <button
                    onClick={executeQuery}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                  >
                    <Play size={12} />
                    Run
                  </button>
                </div>
                <textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  className="w-full h-40 p-4 font-mono text-sm bg-gray-900 text-gray-100 border-none focus:outline-none resize-none"
                  placeholder="Enter SQL query..."
                />
              </div>

              {/* Query Results */}
              <div className="flex-1 overflow-auto">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Results</h3>
                  {queryError && (
                    <div className="flex items-center gap-1 text-xs text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded">
                      <AlertCircle size={12} />
                      {queryError}
                    </div>
                  )}
                </div>
                {queryResult && queryResult.length > 0 ? (
                  <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          {Object.keys(queryResult[0]).map(col => (
                            <th key={col} className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {queryResult.map((row, idx) => (
                          <tr key={idx} className="border-t border-gray-200 dark:border-gray-800">
                            {Object.values(row).map((val: any, i) => (
                              <td key={i} className="px-4 py-2 text-sm text-gray-900 dark:text-gray-200">
                                {String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : queryResult !== null ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8 border border-gray-200 dark:border-gray-800 rounded-lg">
                    No results returned
                  </div>
                ) : (
                  <div className="text-center text-gray-400 dark:text-gray-500 py-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    Run a query to see results
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg text-sm ${
          notification.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {notification.type === "success" ? <Check size={14} /> : <AlertCircle size={14} />}
          {notification.message}
        </div>
      )}
    </div>
  )
}