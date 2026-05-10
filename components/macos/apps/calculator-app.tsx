"use client"

import { useState, useEffect, useCallback } from "react"

interface CalculatorAppProps {
  isMaximized?: boolean
}

export function CalculatorApp({ isMaximized = false }: CalculatorAppProps) {
  const [display, setDisplay] = useState("0")
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [resetDisplay, setResetDisplay] = useState(false)
  const [memory, setMemory] = useState<number | null>(null)

  // Basic arithmetic
  const calculate = useCallback((a: number, b: number, op: string): number => {
    switch (op) {
      case "+": return a + b
      case "-": return a - b
      case "*": return a * b
      case "/": return b !== 0 ? a / b : 0
      default: return b
    }
  }, [])

  // Advanced operations
  const handleAdvancedOperation = useCallback((op: string) => {
    let current = parseFloat(display)
    let result: number
    switch (op) {
      case "sqrt":
        result = Math.sqrt(current)
        break
      case "pow2":
        result = Math.pow(current, 2)
        break
      case "pow3":
        result = Math.pow(current, 3)
        break
      case "sin":
        result = Math.sin(current)
        break
      case "cos":
        result = Math.cos(current)
        break
      case "tan":
        result = Math.tan(current)
        break
      case "asin":
        result = Math.asin(current)
        break
      case "acos":
        result = Math.acos(current)
        break
      case "atan":
        result = Math.atan(current)
        break
      case "log":
        result = Math.log10(current)
        break
      case "ln":
        result = Math.log(current)
        break
      case "exp":
        result = Math.exp(current)
        break
      case "fact":
        result = factorial(current)
        break
      case "recip":
        result = current !== 0 ? 1 / current : 0
        break
      case "pi":
        result = Math.PI
        break
      case "e":
        result = Math.E
        break
      default:
        result = current
    }
    setDisplay(String(result))
    setResetDisplay(true)
    setPreviousValue(null)
    setOperation(null)
  }, [display])

  const factorial = (n: number): number => {
    if (n < 0) return NaN
    if (n === 0 || n === 1) return 1
    let result = 1
    for (let i = 2; i <= n; i++) result *= i
    return result
  }

  const handleNumber = useCallback((num: string) => {
    if (resetDisplay) {
      setDisplay(num)
      setResetDisplay(false)
    } else {
      setDisplay(prev => (prev === "0" ? num : prev + num))
    }
  }, [resetDisplay])

  const handleOperation = useCallback((op: string) => {
    const current = parseFloat(display)
    if (previousValue !== null && operation) {
      const result = calculate(previousValue, current, operation)
      setDisplay(String(result))
      setPreviousValue(result)
    } else {
      setPreviousValue(current)
    }
    setOperation(op)
    setResetDisplay(true)
  }, [display, previousValue, operation, calculate])

  const handleEquals = useCallback(() => {
    if (previousValue !== null && operation) {
      const current = parseFloat(display)
      const result = calculate(previousValue, current, operation)
      setDisplay(String(result))
      setPreviousValue(null)
      setOperation(null)
      setResetDisplay(true)
    }
  }, [display, previousValue, operation, calculate])

  const handleClear = useCallback(() => {
    setDisplay("0")
    setPreviousValue(null)
    setOperation(null)
    setResetDisplay(false)
  }, [])

  const handleAllClear = useCallback(() => {
    setDisplay("0")
    setPreviousValue(null)
    setOperation(null)
    setResetDisplay(false)
    setMemory(null)
  }, [])

  const handlePercent = useCallback(() => {
    setDisplay(String(parseFloat(display) / 100))
    setResetDisplay(true)
  }, [display])

  const handleSign = useCallback(() => {
    setDisplay(String(-parseFloat(display)))
  }, [display])

  const handleDecimal = useCallback(() => {
    if (!display.includes(".")) {
      setDisplay(prev => prev + ".")
      setResetDisplay(false)
    }
  }, [display])

  const handleMemory = useCallback((action: string) => {
    const current = parseFloat(display)
    switch (action) {
      case "MC":
        setMemory(null)
        break
      case "MR":
        if (memory !== null) {
          setDisplay(String(memory))
          setResetDisplay(true)
        }
        break
      case "M+":
        setMemory((prev) => (prev !== null ? prev + current : current))
        setResetDisplay(true)
        break
      case "M-":
        setMemory((prev) => (prev !== null ? prev - current : -current))
        setResetDisplay(true)
        break
    }
  }, [display, memory])

  const formatDisplay = useCallback((val: string) => {
    const num = parseFloat(val)
    if (isNaN(num)) return "Error"
    if (val.includes(".") && val.endsWith(".")) return val
    if (val.length > 12) return num.toExponential(6)
    return val
  }, [])

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key
      if (/[0-9]/.test(key)) {
        e.preventDefault()
        handleNumber(key)
      } else if (key === ".") {
        e.preventDefault()
        handleDecimal()
      } else if (key === "+") {
        e.preventDefault()
        handleOperation("+")
      } else if (key === "-") {
        e.preventDefault()
        handleOperation("-")
      } else if (key === "*") {
        e.preventDefault()
        handleOperation("*")
      } else if (key === "/") {
        e.preventDefault()
        handleOperation("/")
      } else if (key === "Enter" || key === "=") {
        e.preventDefault()
        handleEquals()
      } else if (key === "Escape") {
        e.preventDefault()
        handleClear()
      } else if (key === "Delete") {
        e.preventDefault()
        handleAllClear()
      } else if (key === "%") {
        e.preventDefault()
        handlePercent()
      } else if (key === "Backspace") {
        e.preventDefault()
        setDisplay(prev => (prev.length === 1 || prev === "0" ? "0" : prev.slice(0, -1)))
      } else if (key === "s" && e.ctrlKey) {
        e.preventDefault()
        handleAdvancedOperation("sin")
      } else if (key === "c" && e.ctrlKey) {
        e.preventDefault()
        handleAdvancedOperation("cos")
      } else if (key === "t" && e.ctrlKey) {
        e.preventDefault()
        handleAdvancedOperation("tan")
      } else if (key === "r" && e.ctrlKey) {
        e.preventDefault()
        handleAdvancedOperation("sqrt")
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleNumber, handleDecimal, handleOperation, handleEquals, handleClear, handleAllClear, handlePercent, handleAdvancedOperation])

  const activeOperation = (op: string) => operation === op && resetDisplay
  const getOperationSymbol = (op: string | null) => {
    if (!op) return ""
    switch (op) {
      case "*": return "×"
      case "/": return "÷"
      default: return op
    }
  }

  // Button style helpers
  const numberButtonClass = "bg-white dark:bg-[#2c2c2e] hover:bg-[#f2f2f7] dark:hover:bg-[#3a3a3c] active:scale-95 text-[#1c1c1e] dark:text-white rounded-full text-lg md:text-xl font-medium py-3 md:py-4 transition-all shadow-sm"
  const functionButtonClass = "bg-[#e5e5ea] dark:bg-[#2c2c2e] hover:bg-[#d1d1d6] dark:hover:bg-[#3a3a3c] active:scale-95 text-[#1c1c1e] dark:text-white rounded-full text-lg md:text-xl font-medium py-3 md:py-4 transition-all"
  const operationButtonClass = (op: string) => `rounded-full text-lg md:text-xl font-medium py-3 md:py-4 transition-all active:scale-95 ${
    activeOperation(op)
      ? "bg-[#ff9f0a] dark:bg-[#ff9f0a] text-white"
      : "bg-[#ff9f0a] dark:bg-[#ff9f0a] text-white hover:bg-[#ff9f0a]/90"
  }`
  const advancedButtonClass = "bg-[#f5f5f7] dark:bg-[#1c1c1e] border border-[#e5e5ea] dark:border-[#2c2c2e] hover:bg-[#e5e5ea] dark:hover:bg-[#2c2c2e] active:scale-95 text-[#1c1c1e] dark:text-white rounded-full text-sm md:text-base font-medium py-2 md:py-3 transition-all"

  return (
    <div className="h-full w-full flex flex-col bg-[#f5f5f7] dark:bg-[#1c1c1e] rounded-2xl overflow-hidden shadow-xl">
      {/* Display Area */}
      <div className="flex-1 flex flex-col justify-end items-end px-6 py-6 md:px-8 md:py-8">
        {/* Memory indicator */}
        {memory !== null && (
          <div className="text-[#8e8e93] text-xs font-medium mb-1">M</div>
        )}
        {/* Previous expression */}
        {(previousValue !== null || operation) && (
          <div className="text-[#8e8e93] dark:text-[#8e8e93] text-sm md:text-base font-medium mb-2 tracking-wide">
            {previousValue !== null && previousValue} {getOperationSymbol(operation)}
          </div>
        )}
        {/* Current value */}
        <div className="overflow-x-auto w-full text-right">
          <span
            className="font-mono font-light tracking-tighter text-[#1c1c1e] dark:text-white"
            style={{
              fontSize: display.length > 10 ? "clamp(2rem, 8vw, 3rem)" : "clamp(2.5rem, 10vw, 4rem)",
              lineHeight: 1.2,
            }}
          >
            {formatDisplay(display)}
          </span>
        </div>
      </div>

      {/* Button Grid - macOS style */}
      {isMaximized ? (
        // Scientific layout when maximized
        <div className="flex flex-col p-4 md:p-5 gap-4">
          {/* Memory & advanced utility row */}
          <div className="grid grid-cols-8 gap-2">
            <button onClick={() => handleMemory("MC")} className={advancedButtonClass}>MC</button>
            <button onClick={() => handleMemory("M+")} className={advancedButtonClass}>M+</button>
            <button onClick={() => handleMemory("M-")} className={advancedButtonClass}>M-</button>
            <button onClick={() => handleMemory("MR")} className={advancedButtonClass}>MR</button>
            <button onClick={() => handleAdvancedOperation("pi")} className={advancedButtonClass}>π</button>
            <button onClick={() => handleAdvancedOperation("e")} className={advancedButtonClass}>e</button>
            <button onClick={() => handleAdvancedOperation("pow2")} className={advancedButtonClass}>x²</button>
            <button onClick={() => handleAdvancedOperation("pow3")} className={advancedButtonClass}>x³</button>
          </div>

          {/* Scientific functions row */}
          <div className="grid grid-cols-8 gap-2">
            <button onClick={() => handleAdvancedOperation("sin")} className={advancedButtonClass}>sin</button>
            <button onClick={() => handleAdvancedOperation("cos")} className={advancedButtonClass}>cos</button>
            <button onClick={() => handleAdvancedOperation("tan")} className={advancedButtonClass}>tan</button>
            <button onClick={() => handleAdvancedOperation("asin")} className={advancedButtonClass}>asin</button>
            <button onClick={() => handleAdvancedOperation("acos")} className={advancedButtonClass}>acos</button>
            <button onClick={() => handleAdvancedOperation("atan")} className={advancedButtonClass}>atan</button>
            <button onClick={() => handleAdvancedOperation("log")} className={advancedButtonClass}>log₁₀</button>
            <button onClick={() => handleAdvancedOperation("ln")} className={advancedButtonClass}>ln</button>
          </div>

          {/* Second scientific row */}
          <div className="grid grid-cols-8 gap-2">
            <button onClick={() => handleAdvancedOperation("sqrt")} className={advancedButtonClass}>√</button>
            <button onClick={() => handleAdvancedOperation("exp")} className={advancedButtonClass}>eˣ</button>
            <button onClick={() => handleAdvancedOperation("fact")} className={advancedButtonClass}>n!</button>
            <button onClick={() => handleAdvancedOperation("recip")} className={advancedButtonClass}>1/x</button>
            <button onClick={() => handleAdvancedOperation("pow2")} className={advancedButtonClass}>xʸ</button>
            <button className={advancedButtonClass} disabled>(</button>
            <button className={advancedButtonClass} disabled>)</button>
            <button onClick={handleAllClear} className={advancedButtonClass}>AC</button>
          </div>

          {/* Main numeric pad (4x5) */}
          <div className="grid grid-cols-4 gap-2">
            <button onClick={() => handleNumber("7")} className={numberButtonClass}>7</button>
            <button onClick={() => handleNumber("8")} className={numberButtonClass}>8</button>
            <button onClick={() => handleNumber("9")} className={numberButtonClass}>9</button>
            <button onClick={() => handleOperation("/")} className={operationButtonClass("/")}>÷</button>

            <button onClick={() => handleNumber("4")} className={numberButtonClass}>4</button>
            <button onClick={() => handleNumber("5")} className={numberButtonClass}>5</button>
            <button onClick={() => handleNumber("6")} className={numberButtonClass}>6</button>
            <button onClick={() => handleOperation("*")} className={operationButtonClass("*")}>×</button>

            <button onClick={() => handleNumber("1")} className={numberButtonClass}>1</button>
            <button onClick={() => handleNumber("2")} className={numberButtonClass}>2</button>
            <button onClick={() => handleNumber("3")} className={numberButtonClass}>3</button>
            <button onClick={() => handleOperation("-")} className={operationButtonClass("-")}>-</button>

            <button onClick={() => handleNumber("0")} className="col-span-2 bg-white dark:bg-[#2c2c2e] hover:bg-[#f2f2f7] dark:hover:bg-[#3a3a3c] active:scale-95 text-[#1c1c1e] dark:text-white rounded-full text-lg md:text-xl font-medium py-3 md:py-4 transition-all flex justify-start pl-6">0</button>
            <button onClick={handleDecimal} className={numberButtonClass}>.</button>
            <button onClick={handleEquals} className="bg-[#ff9f0a] dark:bg-[#ff9f0a] hover:bg-[#ff9f0a]/90 active:scale-95 text-white rounded-full text-lg md:text-xl font-medium py-3 md:py-4 transition-all">=</button>
          </div>
        </div>
      ) : (
        // Basic layout when not maximized
        <div className="grid grid-cols-4 gap-2 p-4 md:gap-3 md:p-5">
          {/* Row 1 */}
          <button onClick={handleClear} className={functionButtonClass}>{display === "0" ? "AC" : "C"}</button>
          <button onClick={handleSign} className={functionButtonClass}>+/-</button>
          <button onClick={handlePercent} className={functionButtonClass}>%</button>
          <button onClick={() => handleOperation("/")} className={operationButtonClass("/")}>÷</button>

          {/* Row 2 */}
          <button onClick={() => handleNumber("7")} className={numberButtonClass}>7</button>
          <button onClick={() => handleNumber("8")} className={numberButtonClass}>8</button>
          <button onClick={() => handleNumber("9")} className={numberButtonClass}>9</button>
          <button onClick={() => handleOperation("*")} className={operationButtonClass("*")}>×</button>

          {/* Row 3 */}
          <button onClick={() => handleNumber("4")} className={numberButtonClass}>4</button>
          <button onClick={() => handleNumber("5")} className={numberButtonClass}>5</button>
          <button onClick={() => handleNumber("6")} className={numberButtonClass}>6</button>
          <button onClick={() => handleOperation("-")} className={operationButtonClass("-")}>-</button>

          {/* Row 4 */}
          <button onClick={() => handleNumber("1")} className={numberButtonClass}>1</button>
          <button onClick={() => handleNumber("2")} className={numberButtonClass}>2</button>
          <button onClick={() => handleNumber("3")} className={numberButtonClass}>3</button>
          <button onClick={() => handleOperation("+")} className={operationButtonClass("+")}>+</button>

          {/* Row 5 */}
          <button onClick={() => handleNumber("0")} className="col-span-2 bg-white dark:bg-[#2c2c2e] hover:bg-[#f2f2f7] dark:hover:bg-[#3a3a3c] active:scale-95 text-[#1c1c1e] dark:text-white rounded-full text-lg md:text-xl font-medium py-3 md:py-4 transition-all flex justify-start pl-6">0</button>
          <button onClick={handleDecimal} className={numberButtonClass}>.</button>
          <button onClick={handleEquals} className="bg-[#ff9f0a] dark:bg-[#ff9f0a] hover:bg-[#ff9f0a]/90 active:scale-95 text-white rounded-full text-lg md:text-xl font-medium py-3 md:py-4 transition-all">=</button>
        </div>
      )}
    </div>
  )
}