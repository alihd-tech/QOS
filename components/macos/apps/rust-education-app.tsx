"use client"

import { useState } from "react"
import {
  BookOpen,
  Terminal,
  Code,
  CheckCircle,
  Copy,
  Check,
  Play,
  HelpCircle,
  Shield,
  Zap,
  Cpu,
  GitBranch,
  AlertTriangle,
  Bug,
  Puzzle,
  Coffee,
  ChevronRight,
} from "lucide-react"

// Lesson data
const lessons = [
  {
    id: "basics",
    title: "Basics",
    icon: BookOpen,
    content: {
      intro: `Rust is a systems programming language focused on safety, speed, and concurrency.
It achieves memory safety without garbage collection using a borrow checker.`,
      sections: [
        {
          title: "Hello, World!",
          code: `fn main() {
    println!("Hello, Rustacean!");
}`,
          output: "Hello, Rustacean!",
        },
        {
          title: "Variables & Mutability",
          code: `let x = 5;       // immutable
let mut y = 10;   // mutable
y += 5;
println!("x = {}, y = {}", x, y);`,
          output: "x = 5, y = 15",
        },
        {
          title: "Data Types",
          code: `let integer: i32 = 42;
let float: f64 = 3.14;
let boolean: bool = true;
let character: char = '🦀';
let tuple = (42, "Rust", 3.14);
let array = [1, 2, 3, 4, 5];`,
          output: "",
        },
      ],
    },
  },
  {
    id: "ownership",
    title: "Ownership & Borrowing",
    icon: Shield,
    content: {
      intro: `Rust's most unique feature: memory safety without GC. Each value has a single owner; when the owner goes out of scope, the value is dropped.`,
      sections: [
        {
          title: "Ownership Rules",
          code: `let s1 = String::from("hello");
let s2 = s1; // s1 is moved, cannot be used
// println!("{}", s1); // error!
println!("{}", s2);`,
          output: "hello",
        },
        {
          title: "Borrowing (References)",
          code: `fn main() {
    let s = String::from("hello");
    let len = calculate_length(&s);
    println!("'{}' has length {}.", s, len);
}

fn calculate_length(s: &String) -> usize {
    s.len()
}`,
          output: "'hello' has length 5.",
        },
        {
          title: "Mutable References",
          code: `fn main() {
    let mut s = String::from("hello");
    change(&mut s);
    println!("{}", s);
}

fn change(some_string: &mut String) {
    some_string.push_str(", world");
}`,
          output: "hello, world",
        },
      ],
    },
  },
  {
    id: "enums-patterns",
    title: "Enums & Pattern Matching",
    icon: Puzzle,
    content: {
      intro: `Enums allow you to define a type by enumerating its possible variants. Pattern matching provides concise ways to handle enum values.`,
      sections: [
        {
          title: "Option Enum",
          code: `fn divide(numerator: f64, denominator: f64) -> Option<f64> {
    if denominator == 0.0 {
        None
    } else {
        Some(numerator / denominator)
    }
}

fn main() {
    let result = divide(10.0, 2.0);
    match result {
        Some(x) => println!("Result: {}", x),
        None => println!("Cannot divide by zero!"),
    }
}`,
          output: "Result: 5",
        },
        {
          title: "Custom Enum & match",
          code: `enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter,
}

fn value_in_cents(coin: Coin) -> u8 {
    match coin {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter => 25,
    }
}

fn main() {
    println!("Quarter = {} cents", value_in_cents(Coin::Quarter));
}`,
          output: "Quarter = 25 cents",
        },
      ],
    },
  },
  {
    id: "error-handling",
    title: "Error Handling",
    icon: AlertTriangle,
    content: {
      intro: `Rust groups errors into two categories: recoverable (Result<T, E>) and unrecoverable (panic!).`,
      sections: [
        {
          title: "Result Type",
          code: `use std::fs::File;

fn main() {
    let file = File::open("hello.txt");
    let file = match file {
        Ok(file) => file,
        Err(error) => panic!("Failed to open file: {:?}", error),
    };
}`,
          output: "thread 'main' panicked at 'Failed to open file: Os { code: 2, kind: NotFound, message: \"No such file or directory\" }'",
        },
        {
          title: "? Operator",
          code: `use std::fs::File;
use std::io::{self, Read};

fn read_username() -> Result<String, io::Error> {
    let mut file = File::open("username.txt")?;
    let mut username = String::new();
    file.read_to_string(&mut username)?;
    Ok(username)
}`,
          output: "",
        },
      ],
    },
  },
  {
    id: "concurrency",
    title: "Concurrency",
    icon: GitBranch,
    content: {
      intro: `Rust's fearless concurrency: threads, message passing, and shared state with compile-time checks.`,
      sections: [
        {
          title: "Threads",
          code: `use std::thread;
use std::time::Duration;

fn main() {
    let handle = thread::spawn(|| {
        for i in 1..5 {
            println!("Spawned thread: {}", i);
            thread::sleep(Duration::from_millis(1));
        }
    });

    for i in 1..3 {
        println!("Main thread: {}", i);
        thread::sleep(Duration::from_millis(1));
    }

    handle.join().unwrap();
}`,
          output: "Main thread: 1\nSpawned thread: 1\nMain thread: 2\nSpawned thread: 2\nSpawned thread: 3\nSpawned thread: 4",
        },
        {
          title: "Message Passing (mpsc)",
          code: `use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let val = String::from("Hello from thread");
        tx.send(val).unwrap();
    });

    let received = rx.recv().unwrap();
    println!("Got: {}", received);
}`,
          output: "Got: Hello from thread",
        },
      ],
    },
  },
  {
    id: "smart-pointers",
    title: "Smart Pointers",
    icon: Cpu,
    content: {
      intro: `Smart pointers in Rust provide additional semantics and memory management beyond references.`,
      sections: [
        {
          title: "Box<T>",
          code: `fn main() {
    let b = Box::new(5);
    println!("b = {}", b);
}`,
          output: "b = 5",
        },
        {
          title: "Rc<T> (Reference Counted)",
          code: `use std::rc::Rc;

fn main() {
    let a = Rc::new(5);
    let b = Rc::clone(&a);
    println!("Count after b: {}", Rc::strong_count(&a));
}`,
          output: "Count after b: 2",
        },
      ],
    },
  },
]

// Quiz questions
const quizzes = [
  {
    question: "What is Rust's most unique feature?",
    options: [
      "Garbage collection",
      "Borrow checker and ownership system",
      "Dynamic typing",
      "Interpreted execution",
    ],
    correct: 1,
    explanation: "Rust's borrow checker enforces memory safety without garbage collection.",
  },
  {
    question: "Which keyword declares a mutable variable?",
    options: ["let", "mut", "let mut", "var"],
    correct: 2,
    explanation: "`let mut` declares a mutable variable in Rust.",
  },
  {
    question: "What does the `?` operator do?",
    options: [
      "Unwrap a Result or panic",
      "Propagate errors in a Result",
      "Check for null",
      "Create a reference",
    ],
    correct: 1,
    explanation: "The `?` operator unwraps a Result or returns the error early.",
  },
]

// Code block component with copy
function CodeBlock({ code, output }: { code: string; output?: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="rounded-lg overflow-hidden border border-border my-3">
      <div className="flex justify-between items-center px-3 py-1.5 bg-muted border-b border-border">
        <span className="text-xs font-mono text-muted-foreground">Rust</span>
        <button onClick={handleCopy} className="p-1 rounded hover:bg-muted-foreground/20 transition-colors">
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
        </button>
      </div>
      <pre className="p-3 text-xs font-mono bg-secondary text-secondary-foreground overflow-x-auto">
        {code}
      </pre>
      {output && (
        <div className="border-t border-border bg-muted/30 p-2 text-xs font-mono text-muted-foreground">
          <div className="font-medium mb-1">Output:</div>
          <pre>{output}</pre>
        </div>
      )}
    </div>
  )
}

// Simulated Rust playground
function RustPlayground() {
  const [code, setCode] = useState(`fn main() {
    let greeting = "Hello, Rust!";
    println!("{}", greeting);
    // Try editing this code and click Run!
}`)
  const [output, setOutput] = useState("")
  const [running, setRunning] = useState(false)

  const runCode = () => {
    setRunning(true)
    setOutput("Compiling...\n")
    setTimeout(() => {
      // Simulate compilation and output
      if (code.includes("println")) {
        const match = code.match(/println!\(["'](.+?)["']/)?.[1] || "Hello, Rust!"
        setOutput(`   Compiling playground v0.1.0
    Finished dev [unoptimized + debuginfo] target(s)
     Running \`target/debug/playground\`
${match}`)
      } else if (code.contains("panic!")) {
        setOutput(`   Compiling playground v0.1.0
error: thread 'main' panicked at 'explicit panic', src/main.rs:2:5
note: run with \`RUST_BACKTRACE=1\` environment variable to display a backtrace`)
      } else {
        setOutput(`   Compiling playground v0.1.0
    Finished dev [unoptimized + debuginfo] target(s)
     Running \`target/debug/playground\`
No output`)
      }
      setRunning(false)
    }, 800)
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-foreground">Rust Playground</span>
        </div>
        <button
          onClick={runCode}
          disabled={running}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {running ? "Running..." : <><Play className="w-3 h-3" /> Run</>}
        </button>
      </div>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full h-[200px] p-3 font-mono text-xs resize-none outline-none bg-secondary text-secondary-foreground"
        spellCheck={false}
      />
      {output && (
        <div className="border-t border-border bg-muted/30 p-3">
          <div className="text-xs font-mono whitespace-pre-wrap text-muted-foreground">{output}</div>
        </div>
      )}
    </div>
  )
}

// Quiz component
function QuizTab() {
  const [currentQuiz, setCurrentQuiz] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  const quiz = quizzes[currentQuiz]
  const isCorrect = showResult && selected === quiz.correct

  const checkAnswer = () => {
    if (selected !== null) setShowResult(true)
  }
  const nextQuiz = () => {
    if (currentQuiz + 1 < quizzes.length) {
      setCurrentQuiz(currentQuiz + 1)
      setSelected(null)
      setShowResult(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Knowledge Check</h3>
      </div>
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Question {currentQuiz + 1} of {quizzes.length}</span>
          <span>{Math.round((currentQuiz + 1) / quizzes.length * 100)}% complete</span>
        </div>
        <p className="text-sm font-medium text-foreground">{quiz.question}</p>
        <div className="space-y-2">
          {quiz.options.map((opt, idx) => (
            <label key={idx} className="flex items-center gap-3 p-2 rounded-lg border border-border hover:bg-muted/30 cursor-pointer">
              <input
                type="radio"
                name="quiz"
                checked={selected === idx}
                onChange={() => { if (!showResult) setSelected(idx) }}
                disabled={showResult}
                className="w-3.5 h-3.5"
              />
              <span className="text-sm text-foreground">{opt}</span>
            </label>
          ))}
        </div>
        {!showResult ? (
          <button
            onClick={checkAnswer}
            disabled={selected === null}
            className="w-full py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Check Answer
          </button>
        ) : (
          <div className="space-y-3">
            <div className={`p-3 rounded-lg ${isCorrect ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
              <div className="flex items-center gap-2">
                {isCorrect ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
                <span className="text-sm font-medium">{isCorrect ? "Correct!" : "Incorrect"}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{quiz.explanation}</p>
            </div>
            {currentQuiz + 1 < quizzes.length ? (
              <button onClick={nextQuiz} className="w-full py-2 rounded-lg text-sm font-medium bg-muted hover:bg-muted/80">Next Question</button>
            ) : (
              <div className="text-center text-sm text-green-600 dark:text-green-400">🎉 You've completed all quizzes!</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Main component
export function RustEducationApp() {
  const [activeLessonId, setActiveLessonId] = useState(lessons[0].id)
  const [activeTab, setActiveTab] = useState<"learn" | "playground" | "quiz">("learn")
  const currentLesson = lessons.find(l => l.id === activeLessonId)!

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 shrink-0 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-orange-600">
            <Crab className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Rust Learning Hub</h2>
            <p className="text-xs text-muted-foreground">Master Rust through examples and practice</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted">
          <Zap className="w-3 h-3 text-orange-500" />
          <span className="text-xs text-muted-foreground">Safe • Fast • Concurrent</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-5 pt-3 border-b border-border">
        <button onClick={() => setActiveTab("learn")} className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-t-lg transition-all ${activeTab === "learn" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:bg-muted/50"}`}>
          <BookOpen className="w-3.5 h-3.5" /> Learn
        </button>
        <button onClick={() => setActiveTab("playground")} className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-t-lg transition-all ${activeTab === "playground" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:bg-muted/50"}`}>
          <Terminal className="w-3.5 h-3.5" /> Playground
        </button>
        <button onClick={() => setActiveTab("quiz")} className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-t-lg transition-all ${activeTab === "quiz" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:bg-muted/50"}`}>
          <HelpCircle className="w-3.5 h-3.5" /> Quiz
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === "learn" && (
          <div className="flex gap-6 max-w-6xl mx-auto">
            {/* Sidebar Lessons */}
            <div className="w-56 shrink-0 space-y-1">
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Topics</p>
              {lessons.map(lesson => {
                const Icon = lesson.icon
                const isActive = activeLessonId === lesson.id
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLessonId(lesson.id)}
                    className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors text-left ${isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground"}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{lesson.title}</span>
                  </button>
                )
              })}
            </div>
            {/* Lesson Content */}
            <div className="flex-1 space-y-6">
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  {React.createElement(currentLesson.icon, { className: "w-5 h-5 text-primary" })}
                  <h3 className="text-base font-bold text-foreground">{currentLesson.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{currentLesson.content.intro}</p>
                {currentLesson.content.sections.map((section, idx) => (
                  <div key={idx} className="mb-6">
                    <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-primary" />
                      {section.title}
                    </h4>
                    <CodeBlock code={section.code} output={section.output} />
                  </div>
                ))}
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
                <Coffee className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Pro Tip</p>
                  <p className="text-xs text-muted-foreground">Try modifying the code examples and run them in the Playground tab to see how Rust behaves!</p>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === "playground" && <RustPlayground />}
        {activeTab === "quiz" && <QuizTab />}
      </div>
    </div>
  )
}

// Custom crab icon for Rust
function Crab(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 4 L8 8" />
      <path d="M20 4 L16 8" />
      <path d="M4 20 L8 16" />
      <path d="M20 20 L16 16" />
      <circle cx="9" cy="9" r="1" fill="currentColor" />
      <circle cx="15" cy="9" r="1" fill="currentColor" />
      <path d="M10 14 Q12 16 14 14" strokeWidth="1.5" />
    </svg>
  )
}

// Import React for JSX
import React from "react"

export default RustEducationApp