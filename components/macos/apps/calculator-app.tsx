"use client"

import { useState } from "react"

export function CalculatorApp() {
  const [display, setDisplay] = useState("0")
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [resetDisplay, setResetDisplay] = useState(false)

  const handleNumber = (num: string) => {
    if (resetDisplay) {
      setDisplay(num)
      setResetDisplay(false)
    } else {
      setDisplay(display === "0" ? num : display + num)
    }
  }

  const handleOperation = (op: string) => {
    const current = Number.parseFloat(display)
    if (previousValue !== null && operation) {
      const result = calculate(previousValue, current, operation)
      setDisplay(String(result))
      setPreviousValue(result)
    } else {
      setPreviousValue(current)
    }
    setOperation(op)
    setResetDisplay(true)
  }

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case "+": return a + b
      case "-": return a - b
      case "*": return a * b
      case "/": return b !== 0 ? a / b : 0
      default: return b
    }
  }

  const handleEquals = () => {
    if (previousValue !== null && operation) {
      const current = Number.parseFloat(display)
      const result = calculate(previousValue, current, operation)
      setDisplay(String(result))
      setPreviousValue(null)
      setOperation(null)
      setResetDisplay(true)
    }
  }

  const handleClear = () => {
    setDisplay("0")
    setPreviousValue(null)
    setOperation(null)
    setResetDisplay(false)
  }

  const handlePercent = () => {
    setDisplay(String(Number.parseFloat(display) / 100))
  }

  const handleSign = () => {
    setDisplay(String(-Number.parseFloat(display)))
  }

  const handleDecimal = () => {
    if (!display.includes(".")) {
      setDisplay(display + ".")
    }
  }

  const buttonClass = (type: "number" | "operation" | "function") => {
    const base = "flex items-center justify-center text-[20px] font-normal rounded-full transition-all active:brightness-75 h-full"
    switch (type) {
      case "number":
        return `${base}`
      case "operation":
        return `${base}`
      case "function":
        return `${base}`
    }
  }

  const formatDisplay = (val: string) => {
    const num = Number.parseFloat(val)
    if (Number.isNaN(num)) return "Error"
    if (val.includes(".") && val.endsWith(".")) return val
    if (val.length > 12) return num.toExponential(6)
    return val
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "#2a2a2a" }}>
      {/* Display */}
      <div className="flex items-end justify-end px-5 py-3 min-h-[80px]">
        <span
          className="font-extralight text-white truncate"
          style={{
            fontSize: display.length > 9 ? "32px" : display.length > 6 ? "40px" : "48px",
            lineHeight: 1,
          }}
        >
          {formatDisplay(display)}
        </span>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-[1px] p-[1px] flex-1">
        {/* Row 1 */}
        <button
          className={buttonClass("function")}
          style={{ background: "#a5a5a5", color: "#1d1d1f" }}
          onClick={handleClear}
        >
          {display === "0" ? "AC" : "C"}
        </button>
        <button
          className={buttonClass("function")}
          style={{ background: "#a5a5a5", color: "#1d1d1f" }}
          onClick={handleSign}
        >
          +/-
        </button>
        <button
          className={buttonClass("function")}
          style={{ background: "#a5a5a5", color: "#1d1d1f" }}
          onClick={handlePercent}
        >
          %
        </button>
        <button
          className={buttonClass("operation")}
          style={{
            background: operation === "/" && resetDisplay ? "white" : "#ff9f0a",
            color: operation === "/" && resetDisplay ? "#ff9f0a" : "white",
          }}
          onClick={() => handleOperation("/")}
        >
          ÷
        </button>

        {/* Row 2 */}
        <button className={buttonClass("number")} style={{ background: "#333", color: "white" }} onClick={() => handleNumber("7")}>7</button>
        <button className={buttonClass("number")} style={{ background: "#333", color: "white" }} onClick={() => handleNumber("8")}>8</button>
        <button className={buttonClass("number")} style={{ background: "#333", color: "white" }} onClick={() => handleNumber("9")}>9</button>
        <button
          className={buttonClass("operation")}
          style={{
            background: operation === "*" && resetDisplay ? "white" : "#ff9f0a",
            color: operation === "*" && resetDisplay ? "#ff9f0a" : "white",
          }}
          onClick={() => handleOperation("*")}
        >
          ×
        </button>

        {/* Row 3 */}
        <button className={buttonClass("number")} style={{ background: "#333", color: "white" }} onClick={() => handleNumber("4")}>4</button>
        <button className={buttonClass("number")} style={{ background: "#333", color: "white" }} onClick={() => handleNumber("5")}>5</button>
        <button className={buttonClass("number")} style={{ background: "#333", color: "white" }} onClick={() => handleNumber("6")}>6</button>
        <button
          className={buttonClass("operation")}
          style={{
            background: operation === "-" && resetDisplay ? "white" : "#ff9f0a",
            color: operation === "-" && resetDisplay ? "#ff9f0a" : "white",
          }}
          onClick={() => handleOperation("-")}
        >
          -
        </button>

        {/* Row 4 */}
        <button className={buttonClass("number")} style={{ background: "#333", color: "white" }} onClick={() => handleNumber("1")}>1</button>
        <button className={buttonClass("number")} style={{ background: "#333", color: "white" }} onClick={() => handleNumber("2")}>2</button>
        <button className={buttonClass("number")} style={{ background: "#333", color: "white" }} onClick={() => handleNumber("3")}>3</button>
        <button
          className={buttonClass("operation")}
          style={{
            background: operation === "+" && resetDisplay ? "white" : "#ff9f0a",
            color: operation === "+" && resetDisplay ? "#ff9f0a" : "white",
          }}
          onClick={() => handleOperation("+")}
        >
          +
        </button>

        {/* Row 5 */}
        <button
          className={`${buttonClass("number")} col-span-2`}
          style={{ background: "#333", color: "white", borderRadius: "999px" }}
          onClick={() => handleNumber("0")}
        >
          <span className="ml-4 w-full text-left">0</span>
        </button>
        <button className={buttonClass("number")} style={{ background: "#333", color: "white" }} onClick={handleDecimal}>.</button>
        <button
          className={buttonClass("operation")}
          style={{ background: "#ff9f0a", color: "white" }}
          onClick={handleEquals}
        >
          =
        </button>
      </div>
    </div>
  )
}
