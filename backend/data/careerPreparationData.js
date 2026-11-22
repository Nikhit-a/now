// Career-specific interview preparation datasets: tracks, topics, questions, and tips

const generalPlacementTips = [
  "Self-Introduction: Structure with the Present-Past-Future model (Current role/education -> Key technical projects & achievements -> Why this specific company/role). Keep it within 90-120 seconds.",
  "Technical Communication: Think out loud. Clarify constraints and edge cases before jumping into solution design or code.",
  "STAR Framework for Behavioral: Always state Situation, Task, Action (emphasize 'I' not just 'we'), and quantifiable Result.",
  "Project Explanation: Lead with the problem solved and architecture, highlight trade-offs made, and conclude with measurable impact (e.g., latency, user adoption).",
  "Scenario-Based Responses: Use the 4-step framework: 1) Assess impact, 2) Contain immediate failure, 3) Identify root cause, 4) Implement permanent preventative measures.",
  "Confidence & Body Language: Maintain steady eye contact (or look into the webcam), pause before answering difficult questions, and avoid filler words.",
  "Common Red Flags to Avoid: Don't speak negatively about past teams, don't fake knowledge (say 'I haven't worked with X directly, but based on my experience with Y...'), and always prepare 2-3 thoughtful questions for the interviewer.",
  "Final 24-Hour Checklist: Review company products, test microphone/camera, re-read your resume bullet points, and prepare your 2-minute project pitch."
];

const sharedGeneralQuestions = [
  {
    question: "Tell me about yourself and walk me through your technical journey.",
    category: "HR",
    difficulty: "Easy",
    answer: "I am a software engineer with a strong foundation in building reliable, scalable web applications. Recently, I've focused on full-stack development using modern JavaScript/TypeScript, React, and Node.js. In my latest project, I architected a real-time collaborative workspace that supported concurrent editing with sub-100ms latency. I'm excited about this role because your team tackles distributed systems challenges at scale, which aligns directly with my career goals.",
    explanation: "This question sets the tone for the entire interview. Interviewers are testing your communication clarity, enthusiasm, and whether your journey naturally leads to their role.",
    keyPoints: [
      "Keep it under 2 minutes (elevator pitch).",
      "Follow Present (current role/studies) -> Past (key technical accomplishments) -> Future (why this role).",
      "Mention 1-2 concrete achievements rather than reciting your resume.",
      "Conclude with why you are specifically enthusiastic about their team."
    ],
    example: "Present: 'I am a final-year CS graduate passionate about backend systems...' Past: 'During my internship at X, I reduced API latency by 35% through Redis caching...' Future: 'I want to apply this experience to your high-throughput fintech platform.'",
    commonMistakes: [
      "Reciting your life story or high school details.",
      "Simply repeating lines verbatim from your resume.",
      "Speaking for more than 3 minutes without pause.",
      "Failing to connect your background to the company you're interviewing with."
    ],
    keywords: ["Self-Introduction", "Elevator Pitch", "Career Journey", "Value Proposition"]
  },
  {
    question: "Describe a situation where you had a disagreement with a team member or lead over a technical decision. How was it resolved?",
    category: "Behavioral",
    difficulty: "Medium",
    answer: "In a team capstone project, a peer proposed using MongoDB for an inventory management module because they were familiar with it, while I advocated for PostgreSQL because the system required strict ACID compliance and relational integrity between products, orders, and warehouses. Instead of arguing personal preferences, I set up a quick comparison matrix focusing on transaction safety, data consistency guarantees, and schema migration overhead. We reviewed the criteria together with our mentor, who agreed PostgreSQL was better suited for financial transactions. We documented the decision in an Architecture Decision Record (ADR) and split the implementation tasks smoothly.",
    explanation: "Tests conflict resolution, emotional intelligence, teamwork, and whether you rely on objective technical data versus ego.",
    keyPoints: [
      "Focus on the technical problem, never personal friction.",
      "Show how you used data, benchmarks, or prototypes to evaluate options objectively.",
      "Demonstrate willingness to collaborate and document consensus.",
      "Highlight positive team relations after the decision was made."
    ],
    example: "Situation: Architecture debate on NoSQL vs Relational. Action: Created comparison matrix and benchmarked concurrent transactions. Result: Consensus reached, zero data inconsistency issues in production.",
    commonMistakes: [
      "Saying 'I never have disagreements with anyone'.",
      "Portraying the other person as incompetent or unreasonable.",
      "Escalating prematurely to management without attempting peer discussion."
    ],
    keywords: ["Conflict Resolution", "Collaboration", "STAR Method", "Objective Evaluation"]
  },
  {
    question: "A critical production service you deployed is throwing 500 errors and users are reporting outages. How do you respond?",
    category: "Scenario Based",
    difficulty: "Hard",
    answer: "My immediate priority is mitigation and containment, not root-cause debugging. First, I check recent deployment logs and alert the incident channel. If the issue started immediately after a deployment, I initiate a rollback to the last known stable release or toggle off the offending feature flag to restore customer traffic. Once the system is stable, I reproduce the issue in a staging environment by analyzing application logs and distributed traces. After fixing the bug and adding automated regression tests, I conduct a blameless post-mortem to determine why unit tests or CI pipelines didn't catch it.",
    explanation: "Tests production maturity, incident command principles, and understanding that customer availability always precedes investigative curiosity.",
    keyPoints: [
      "Mitigate first (rollback, traffic reroute, feature flag disable), investigate second.",
      "Communicate clearly with stakeholders and on-call teams.",
      "Use observability tools (APM, Datadog, Sentry, CloudWatch) for diagnosis.",
      "Conduct a blameless post-mortem and add preventative automated tests."
    ],
    example: "Timeline: T+0m: Alert triggered. T+2m: Incident declared, rollback initiated. T+5m: Traffic restored to 99.9% success rate. T+30m: Bug identified in edge-case null pointer, patch deployed to staging.",
    commonMistakes: [
      "Attempting to live-debug in production while users are experiencing outages.",
      "Failing to communicate with team leads or support representatives.",
      "Focusing on blame rather than system resilience."
    ],
    keywords: ["Incident Management", "Rollback", "Post-Mortem", "Observability", "Root Cause Analysis"]
  },
  {
    question: "Why should we hire you over other qualified candidates applying for this role?",
    category: "HR",
    difficulty: "Medium",
    answer: "Beyond my technical proficiency with your core stack, what sets me apart is my ownership mindset and rapid learning agility. When faced with an unfamiliar technology or legacy codebase, I actively break it down, write comprehensive documentation, and deliver pragmatic solutions without needing constant oversight. I don't just write code that works; I care about maintainability, automated tests, and driving measurable value for end users.",
    explanation: "This question evaluates your self-awareness, confidence, and how clearly you can articulate your unique value proposition without sounding arrogant.",
    keyPoints: [
      "Highlight a combination of technical capability and strong soft skills.",
      "Emphasize ownership, reliability, and business impact.",
      "Show genuine alignment with the company's engineering values."
    ],
    example: "Mention a specific instance where you took initiative outside your core duties, like improving test coverage from 40% to 80% or writing onboarding guides for new interns.",
    commonMistakes: [
      "Putting down other candidates.",
      "Giving generic cliches like 'I'm a hard worker' without proof.",
      "Sounding insecure or uncertain of your abilities."
    ],
    keywords: ["Ownership", "Value Proposition", "Culture Fit", "Initiative"]
  }
];

// Helper to construct questions cleanly
const createQuestion = (question, category, difficulty, answer, explanation, keyPoints, example, commonMistakes, keywords) => ({
  question,
  category,
  difficulty,
  answer,
  explanation: explanation || "",
  keyPoints: keyPoints || [],
  example: example || "",
  commonMistakes: commonMistakes || [],
  keywords: keywords || []
});

// Comprehensive tracks and questions per career
const careerDataMap = {
  "Full Stack Developer": {
    overview: "Comprehensive full-stack engineering interview preparation covering frontend UI, backend architecture, APIs, databases, authentication, and system design.",
    tips: [
      "Explain the end-to-end data lifecycle: from user action in browser DOM, HTTP request through DNS/load balancer, Express/Node middleware, database query, to JSON response.",
      "Be prepared to code both a React component with state management and an Express API endpoint with database persistence.",
      "Understand authentication security: HTTP-only cookies vs localStorage, CSRF protection, and JWT verification.",
      "Review SQL vs NoSQL trade-offs, database indexing, and caching with Redis."
    ],
    generalQuestions: sharedGeneralQuestions,
    tracks: [
      {
        title: "Frontend & React Architecture",
        description: "Core frontend concepts, DOM manipulation, React hooks, state management, and performance.",
        requiredSkills: [{ name: "React", requiredLevel: "Intermediate" }, { name: "JavaScript", requiredLevel: "Advanced" }],
        resources: [
          { title: "React Documentation & Patterns", url: "https://react.dev", type: "Documentation" },
          { title: "JavaScript Event Loop Deep Dive", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop", type: "Article" }
        ],
        topics: [
          {
            title: "Modern JavaScript & Async Programming",
            description: "Event loop, Promises, closures, async/await, and memory management.",
            questions: [
              createQuestion(
                "How does the JavaScript Event Loop handle microtasks vs macrotasks?",
                "Technical",
                "Medium",
                "JavaScript is single-threaded and executes code using a Call Stack. Synchronous code runs first. When asynchronous operations occur, their callbacks are delegated to browser APIs or Node libuv. When finished, callbacks are placed in queues: Microtasks (Promise.then, MutationObserver, queueMicrotask) and Macrotasks (setTimeout, setInterval, setImmediate, I/O). After every function call finishes on the stack, the event loop empties the entire microtask queue before picking a single task from the macrotask queue.",
                "Understanding the execution order of synchronous code, microtasks, and macrotasks is critical for debugging race conditions and performance lag.",
                ["Call stack executes synchronous execution contexts.", "Microtask queue has absolute priority over macrotask queue.", "Rendering pipeline runs after microtask queue is cleared.", "setTimeout(fn, 0) schedules a macrotask, Promise.resolve().then(fn) schedules a microtask."],
                "console.log('1'); setTimeout(() => console.log('2'), 0); Promise.resolve().then(() => console.log('3')); console.log('4'); // Output: 1, 4, 3, 2",
                ["Thinking setTimeout(fn, 0) runs immediately.", "Confusing Promise executor function (which is synchronous) with .then callback (which is a microtask)."],
                ["Event Loop", "Call Stack", "Microtasks", "Macrotasks", "Promises", "Async"]
              ),
              createQuestion(
                "What are Closures in JavaScript and what are practical use cases for them?",
                "Technical",
                "Easy",
                "A closure is the combination of a function bundled together with references to its surrounding lexical environment. In JavaScript, every inner function retains access to variables declared in its outer scope even after the outer function has finished executing and returned. Practical uses include data encapsulation/private variables, function factories, and memoization/currying.",
                "Closures allow functions to maintain persistent state without polluting the global scope.",
                ["Lexical scoping allows inner functions to access outer variables.", "Variables in closed-over scopes remain in memory as long as the closure exists.", "Useful for creating private state, memoized helpers, and event handlers."],
                "function createCounter() { let count = 0; return { increment: () => ++count, get: () => count }; } const c = createCounter(); c.increment(); // count is private",
                ["Forgetting that closures can lead to memory leaks if unwanted references are retained.", "Modifying loop indices with var instead of let."],
                ["Closure", "Lexical Scope", "Encapsulation", "State Retention"]
              ),
              createQuestion(
                "You discover a severe memory leak in a long-running Single Page Application (SPA). How do you isolate and fix it?",
                "Scenario Based",
                "Hard",
                "I open Chrome DevTools and navigate to the Memory panel. First, I record Heap Snapshots before and after interacting with the problematic view. By comparing the snapshots with the 'Objects allocated between snapshots' or Delta view, I look for detached DOM trees, uncleared setInterval timers, or growing event listener arrays. Once isolated, I ensure all useEffect hooks return cleanup functions to unsubscribe listeners, clear timers, and nullify global cache references.",
                "Memory leaks in SPAs usually occur because event listeners or references to unmounted components prevent the garbage collector from freeing memory.",
                ["Use Chrome DevTools Memory Profiler & Heap Snapshots.", "Check for detached DOM nodes and unremoved window/document listeners.", "Verify cleanup functions in useEffect or componentWillUnmount.", "Review closures retaining large objects or global event buses."],
                "useEffect(() => { const handler = (e) => onScroll(e); window.addEventListener('scroll', handler); return () => window.removeEventListener('scroll', handler); }, []);",
                ["Assuming React automatically cleans up custom window event listeners or intervals.", "Restarting the browser without taking comparative heap snapshots."],
                ["Memory Leak", "Heap Snapshot", "Garbage Collection", "Detached DOM", "Cleanup"]
              )
            ]
          },
          {
            title: "React Components & State Management",
            description: "Reconciliation, hooks lifecycle, custom hooks, and context vs external stores.",
            questions: [
              createQuestion(
                "How does React's Reconciliation and Virtual DOM diffing algorithm work, and why are keys essential in lists?",
                "Technical",
                "Medium",
                "React maintains a virtual representation of the UI in memory (Virtual DOM). When state or props change, React generates a new Virtual DOM tree and diffs it with the previous one (reconciliation). To do this in O(n) instead of O(n^3), React assumes elements of different types generate different trees, and lists use stable 'key' props to match children across renders. Keys give items persistent identity, preventing unnecessary DOM recreation and preventing component state from bleeding into adjacent list items.",
                "Keys allow React to detect whether an item was inserted, deleted, or reordered rather than re-rendering the entire list from scratch.",
                ["Virtual DOM diffing uses heuristics to achieve O(n) performance.", "Keys must be stable, unique, and predictable.", "Using array indices as keys causes bugs when filtering, sorting, or deleting items.", "Reconciliation updates only mutated DOM attributes, minimizing browser reflows."],
                "// Correct: <li key={user.id}>{user.name}</li>\n// Anti-pattern: <li key={index}>{user.name}</li>",
                ["Using Math.random() as key (forces DOM destruction on every render).", "Using array index as key when list order changes."],
                ["Virtual DOM", "Reconciliation", "Diffing", "Key Prop", "Performance"]
              ),
              createQuestion(
                "When should you use React Context vs dedicated state libraries like Redux or Zustand?",
                "Technical",
                "Medium",
                "React Context is ideal for low-frequency global state that affects many components, such as theme settings, user authentication, or localized language. However, every time a Context value changes, all consuming components re-render unless carefully memoized. For high-frequency state updates, complex state transformations, or large datasets (like collaborative editors or dashboards), dedicated state libraries like Zustand or Redux Toolkit are preferred because they support selector-based subscription, middleware, and DevTools time-travel debugging.",
                "Context is a dependency injection mechanism, not an optimized state management library designed for high-frequency mutations.",
                ["Context causes all consumers to re-render when the value changes.", "Zustand/Redux support fine-grained selector subscriptions (only re-renders if selected slice changes).", "Use Context for auth/theme, use stores for dynamic complex application state."],
                "// Zustand selector only triggers re-render when user.name changes:\nconst userName = useStore(state => state.user.name);",
                ["Putting rapidly updating inputs or animations into global React Context.", "Over-engineering simple apps with massive Redux boilerplate when local state suffices."],
                ["React Context", "Zustand", "Redux", "Selective Rendering", "State Management"]
              ),
              createQuestion(
                "Tell me about a time you optimized a sluggish UI component that caused jank during user interactions.",
                "Behavioral",
                "Medium",
                "In a data visualization project, our table component re-rendered 5,000 rows whenever a user typed into a search filter, causing severe frame drops. I profiled the component using the React DevTools Profiler and found two issues: expensive row computations running on every keystroke, and inline object props breaking memoization. I implemented React windowing (virtualized list) with react-window to render only the 20 visible rows, wrapped derived calculations in useMemo, and debounced the search input by 200ms. This dropped render times from 420ms to 8ms and eliminated all jank.",
                "Shows systematic performance troubleshooting using official profiling tools rather than guesswork.",
                ["State baseline metrics (420ms down to 8ms).", "Explain diagnostic tools used (React DevTools Profiler).", "Demonstrate knowledge of windowing/virtualization and debouncing."],
                "Situation: Table with 5,000 rows freezing during input. Action: Virtualized with react-window + useMemo + debounce. Result: Smooth 60 FPS interaction.",
                ["Claiming you just added useMemo everywhere without profiling.", "Not knowing what DOM virtualization is."],
                ["React Profiler", "Virtualization", "Debounce", "useMemo", "Jank"]
              )
            ]
          }
        ]
      },
      {
        title: "Backend, APIs & Databases",
        description: "Node.js architecture, RESTful API design, database modeling, and caching.",
        requiredSkills: [{ name: "Node.js", requiredLevel: "Intermediate" }, { name: "MongoDB", requiredLevel: "Intermediate" }, { name: "SQL", requiredLevel: "Intermediate" }],
        resources: [
          { title: "Node.js Architecture Guide", url: "https://nodejs.org/en/docs", type: "Documentation" },
          { title: "Database Indexing Explained", url: "https://use-the-index-luke.com", type: "Article" }
        ],
        topics: [
          {
            title: "Node.js & Express Architecture",
            description: "Libuv, streams, cluster module, middleware design, and security best practices.",
            questions: [
              createQuestion(
                "Explain the internal architecture of Node.js and how it handles CPU-intensive tasks without blocking I/O.",
                "Technical",
                "Hard",
                "Node.js combines the Google V8 engine (for JavaScript execution) with libuv (for cross-platform asynchronous I/O). The main thread runs the event loop. For non-blocking I/O (network requests, timers), Node delegates to OS asynchronous primitives (epoll, kqueue). For file system I/O, DNS lookups, or cryptographic operations, libuv uses a background Thread Pool (default 4 threads). However, CPU-intensive JavaScript tasks (like complex mathematical calculations, image processing, or JSON parsing of huge files) run on the main thread and will block the event loop. To handle CPU-heavy workloads without blocking, we must offload them to Worker Threads (worker_threads module), child processes, or separate background microservices.",
                "Understanding the single-threaded event loop vs libuv thread pool is essential for preventing server freeze.",
                ["V8 executes JS; libuv manages event loop and background thread pool.", "Non-blocking I/O delegates to kernel; disk I/O and crypto use libuv thread pool.", "CPU-intensive tasks block the event loop unless offloaded to Worker Threads or external queues."],
                "const { Worker } = require('worker_threads');\nconst worker = new Worker('./heavyComputation.js');\nworker.on('message', result => res.json(result));",
                ["Thinking Node.js is multi-threaded for normal JavaScript execution.", "Using blocking sync functions like fs.readFileSync in API request handlers."],
                ["Node.js", "libuv", "Event Loop", "Thread Pool", "Worker Threads", "Non-blocking"]
              ),
              createQuestion(
                "How do you secure an Express REST API against common web vulnerabilities (XSS, CSRF, Injection, Brute Force)?",
                "Technical",
                "Medium",
                "To secure an Express API: 1) Use Helmet middleware to set security HTTP headers (Content-Security-Policy, X-Frame-Options). 2) Sanitize and validate all request parameters using express-validator or Zod to prevent NoSQL/SQL injection. 3) Enforce rate limiting with express-rate-limit to protect login and sensitive endpoints against brute force and DDoS. 4) Store JWTs or session identifiers in HttpOnly, Secure, SameSite=Strict cookies to prevent XSS theft, and validate anti-CSRF tokens for mutating requests. 5) Enable CORS with explicit whitelisted origins instead of wildcard '*' in production.",
                "Comprehensive application security requires layered defense at the transport, network, and application levels.",
                ["Helmet for HTTP headers.", "HttpOnly, SameSite cookies for tokens.", "Input validation and parameterized queries against injection.", "Rate limiting for auth endpoints.", "Strict CORS configuration."],
                "app.use(helmet());\napp.use(cors({ origin: 'https://trusted-domain.com', credentials: true }));\napp.use('/api/auth/login', rateLimit({ windowMs: 15*60*1000, max: 5 }));",
                ["Storing JWTs in localStorage where any XSS vulnerability can extract them.", "Using raw string concatenation in SQL or MongoDB queries."],
                ["API Security", "Helmet", "CORS", "Rate Limiting", "SQL Injection", "XSS", "CSRF"]
              ),
              createQuestion(
                "Your API experiences sudden database deadlocks under high concurrent traffic. How do you diagnose and resolve them?",
                "Scenario Based",
                "Hard",
                "A deadlock occurs when two or more transactions hold locks on records the other needs, creating a cyclical wait. First, I inspect database engine status (e.g. SHOW ENGINE INNODB STATUS in MySQL or pg_stat_activity in PostgreSQL) to find the conflicting queries and transaction locks. To resolve it: 1) Standardize the locking order across all services so transactions always acquire locks on tables and rows in the exact same sequence. 2) Keep transactions as short as possible, avoiding network I/O or external API calls inside the transaction block. 3) Reduce transaction isolation level if serializable isn't strictly necessary. 4) Implement automated retry logic with exponential backoff for transient deadlock errors.",
                "Deadlock management requires consistent resource acquisition order and minimal transaction durations.",
                ["Standardize resource acquisition order across all code paths.", "Keep transaction scope minimal; never do external HTTP calls inside a DB transaction.", "Use appropriate isolation levels (e.g. Read Committed).", "Add retry with exponential backoff on deadlock error codes."],
                "// Always lock Account A then Account B in consistent order:\nconst [firstId, secondId] = [fromId, toId].sort();\nawait lockRow(firstId); await lockRow(secondId);",
                ["Increasing transaction timeout instead of fixing the root locking order.", "Running long analytical queries inside transactional writes."],
                ["Deadlock", "Database Transactions", "ACID", "Lock Contention", "Concurrency"]
              )
            ]
          }
        ]
      }
    ]
  },
  "Frontend Developer": {
    overview: "Focused frontend engineering interview preparation covering modern JavaScript/TypeScript, CSS layouts, Core Web Vitals, accessibility, and client-side performance.",
    tips: [
      "Master CSS Grid, Flexbox, responsive design, and CSS specificity rules.",
      "Be prepared to write clean TypeScript interfaces and generics without relying on 'any'.",
      "Understand Core Web Vitals (LCP, FID/INP, CLS) and how to measure and optimize them.",
      "Review web accessibility standards (WCAG 2.1, ARIA roles, semantic HTML, keyboard navigation)."
    ],
    generalQuestions: sharedGeneralQuestions,
    tracks: [
      {
        title: "Modern UI, CSS & Accessibility",
        description: "Responsive layouts, animations, design systems, and WCAG accessibility standards.",
        requiredSkills: [{ name: "CSS", requiredLevel: "Advanced" }, { name: "HTML", requiredLevel: "Advanced" }, { name: "JavaScript", requiredLevel: "Advanced" }],
        resources: [
          { title: "Web Accessibility Guidelines (WCAG)", url: "https://www.w3.org/WAI/standards-guidelines/wcag/", type: "Documentation" },
          { title: "Web.dev Performance & Vitals", url: "https://web.dev/vitals/", type: "Article" }
        ],
        topics: [
          {
            title: "CSS Architecture & Performance",
            description: "Specificity, Flexbox vs Grid, subgrid, layout thrashing, and GPU hardware acceleration.",
            questions: [
              createQuestion(
                "How does browser rendering work (DOM -> CSSOM -> Render Tree -> Layout -> Paint -> Composite), and how do you avoid layout thrashing?",
                "Technical",
                "Medium",
                "The browser parses HTML to build the DOM and CSS to build the CSSOM. Combining both creates the Render Tree. The browser then computes geometric coordinates (Layout/Reflow), fills pixels (Paint), and sends layers to the GPU (Composite). Layout Thrashing occurs when JavaScript repeatedly alternates between reading geometric layout properties (like offsetHeight or clientWidth) and writing DOM changes, forcing the browser to recalculate layout synchronously in a tight loop. To avoid this, batch DOM reads together before executing writes, or use requestAnimationFrame or fastdom.",
                "Understanding the critical rendering path enables you to write 60fps animations and prevent browser freezes.",
                ["Know the stages: DOM + CSSOM -> Render Tree -> Layout -> Paint -> Composite.", "Animating transform and opacity runs on the GPU compositor thread without triggering layout or paint.", "Avoid read-write-read-write DOM loops that trigger forced synchronous reflow."],
                "// Bad: forced reflow loop\nelements.forEach(el => { const h = el.offsetHeight; el.style.height = (h + 10) + 'px'; });\n// Good: read first, batch writes in requestAnimationFrame",
                ["Animating left/top/width/height instead of transform.", "Thinking CSS transitions automatically run on the GPU without will-change or transform3d."],
                ["Critical Rendering Path", "Layout Thrashing", "Reflow", "Repaint", "Compositing", "GPU"]
              ),
              createQuestion(
                "How do you ensure a complex interactive modal or dropdown is fully accessible according to WCAG 2.1 standards?",
                "Technical",
                "Hard",
                "An accessible modal requires: 1) Semantic HTML and ARIA attributes (role='dialog', aria-modal='true', aria-labelledby pointing to title). 2) Focus trapping: when opened, move focus into the modal and constrain Tab / Shift+Tab navigation so it cannot escape into background elements. 3) Keyboard dismissal: pressing Escape must close the modal. 4) Focus restoration: upon closing, return focus to the trigger button that launched it. 5) Background inertness: set aria-hidden='true' or inert on the main app wrapper while the modal is visible.",
                "Accessibility is a core hiring requirement for top tech companies and ensures inclusivity for screen readers and keyboard users.",
                ["Focus trapping inside the active dialog.", "Escape key listener to close.", "aria-labelledby and role='dialog'.", "Return focus to trigger element on dismiss.", "Prevent background scrolling and mark inert."],
                "dialog.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); if (e.key === 'Tab') handleFocusTrap(e); });",
                ["Building a modal purely out of <div> tags without ARIA or keyboard navigation.", "Leaving focus stuck behind the modal on background links."],
                ["Accessibility", "WCAG", "ARIA", "Focus Trap", "Keyboard Navigation"]
              )
            ]
          }
        ]
      }
    ]
  },
  "Backend Developer": {
    overview: "Backend systems interview preparation covering distributed architectures, microservices, databases, caching, asynchronous message queues, and API security.",
    tips: [
      "Understand database indexing internals (B-Tree vs Hash index) and how to read EXPLAIN ANALYZE execution plans.",
      "Be prepared to design scalable caching strategies (Cache-Aside, Write-Through, Write-Behind) and handle cache invalidation.",
      "Understand asynchronous architectures using message brokers like Kafka, RabbitMQ, or Redis BullMQ.",
      "Know how to scale horizontally using stateless services, load balancers, and distributed locks."
    ],
    generalQuestions: sharedGeneralQuestions,
    tracks: [
      {
        title: "API Design, Databases & Caching",
        description: "REST vs GraphQL, database query optimization, indexing, and Redis caching patterns.",
        requiredSkills: [{ name: "Node.js", requiredLevel: "Intermediate" }, { name: "REST API", requiredLevel: "Advanced" }, { name: "SQL", requiredLevel: "Intermediate" }],
        resources: [
          { title: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer", type: "Article" },
          { title: "PostgreSQL Query Optimization", url: "https://www.postgresql.org/docs/current/performance-tips.html", type: "Documentation" }
        ],
        topics: [
          {
            title: "Database Optimization & Indexing",
            description: "B-Trees, composite indexes, query planner, and N+1 query problems.",
            questions: [
              createQuestion(
                "What is the N+1 query problem, how do you detect it, and how is it resolved in relational and GraphQL systems?",
                "Technical",
                "Medium",
                "The N+1 query problem occurs when an application executes 1 initial query to fetch a list of N records, and then makes N individual subsequent queries to fetch related child records for each item in the list (total N+1 database roundtrips). We detect it via APM query profilers, ORM SQL logging, or slow response times under load. In relational systems, it is solved using SQL JOINs or eager loading (e.g. Sequelize include, Prisma include). In GraphQL or microservices, it is solved using DataLoader, which batches and deduplicates IDs across a single execution tick to execute a single WHERE id IN (...) query.",
                "N+1 queries degrade database performance drastically because network latency accumulates with every additional roundtrip.",
                ["1 query for parent + N queries for children = N+1 latency bottleneck.", "Solved in SQL via JOINs or ORM eager loading.", "Solved in GraphQL/APIs using DataLoader batching.", "Always profile database queries in staging."],
                "// Problem: Users.map(u => DB.findPosts(u.id)) -> N queries\n// Solution: SELECT * FROM posts WHERE user_id IN (1, 2, 3...) -> 1 query",
                ["Assuming ORMs automatically eliminate N+1 queries without configuration.", "Fetching thousands of rows with outer joins without pagination."],
                ["N+1 Problem", "DataLoader", "SQL Joins", "Eager Loading", "Query Optimization"]
              ),
              createQuestion(
                "How do Cache-Aside, Write-Through, and Write-Behind caching strategies differ, and how do you handle the Thundering Herd problem?",
                "Technical",
                "Hard",
                "In Cache-Aside, the app first checks cache; on miss, reads DB and populates cache. In Write-Through, data is written to cache and DB simultaneously. In Write-Behind (Write-Back), data is written to cache first and asynchronously persisted to DB in batches. The Thundering Herd (or Cache Stampede) occurs when a hot cache key expires, and thousands of concurrent requests all miss the cache at once and overwhelm the database. It is mitigated by: 1) Mutex/Distributed Locking (only the first request queries DB while others wait), 2) Adding random TTL jitter to prevent synchronized expiration, and 3) Probabilistic early expiration (XFetch algorithm).",
                "High-scale backend engineering requires robust caching patterns that prevent downstream database meltdowns during peak traffic.",
                ["Cache-Aside is reactive; Write-Through is synchronous; Write-Behind is asynchronous.", "Thundering Herd causes database overload when hot keys expire.", "Mitigate with distributed locks, random TTL jitter, and pre-warming."],
                "const lock = await redis.set('lock:key', '1', 'NX', 'PX', 5000);\nif (lock) { const data = await fetchFromDB(); await redis.set('key', data, 'EX', 3600); }",
                ["Setting identical TTL on all cache entries (causes synchronized expiration).", "Writing to DB without invalidating or updating the corresponding cache key."],
                ["Caching", "Cache-Aside", "Thundering Herd", "Redis", "Distributed Lock", "TTL Jitter"]
              )
            ]
          }
        ]
      }
    ]
  },
  "Java Developer": {
    overview: "Comprehensive Java enterprise interview preparation covering Core Java, OOP, Collections, Concurrency, Spring Boot, JPA/Hibernate, and Microservices.",
    tips: [
      "Master OOP principles (Encapsulation, Inheritance, Polymorphism, Abstraction) and SOLID design principles.",
      "Understand JVM internals: Heap, Stack, Metaspace, and Garbage Collection algorithms (G1GC, ZGC).",
      "Be prepared to explain HashMap internal mechanics (buckets, hashing, collisions, treeification).",
      "Understand Spring Boot auto-configuration, dependency injection, and JPA entity lifecycles."
    ],
    generalQuestions: sharedGeneralQuestions,
    tracks: [
      {
        title: "Core Java, OOP & Collections",
        description: "Memory model, JVM architecture, Collections framework internals, and multi-threading.",
        requiredSkills: [{ name: "Java", requiredLevel: "Advanced" }, { name: "OOP", requiredLevel: "Advanced" }, { name: "DSA", requiredLevel: "Intermediate" }],
        resources: [
          { title: "Java Collections Framework Guide", url: "https://docs.oracle.com/javase/tutorial/collections/", type: "Documentation" },
          { title: "Baeldung Spring Boot Tutorials", url: "https://www.baeldung.com/spring-boot", type: "Article" }
        ],
        topics: [
          {
            title: "JVM Memory & Collections Internals",
            description: "HashMap internals, ArrayList vs LinkedList, Garbage Collection, and JVM memory zones.",
            questions: [
              createQuestion(
                "Explain how Java HashMap works internally, including hashing, bucket distribution, collisions, and treeification in Java 8.",
                "Technical",
                "Medium",
                "HashMap in Java is based on an array of Node<K,V> buckets (default initial capacity 16, load factor 0.75). When put(key, value) is called, it computes key.hashCode(), applies a bitwise hash function (hash = h ^ (h >>> 16)) to distribute bits, and calculates index = (n - 1) & hash. When two distinct keys resolve to the same bucket index, a collision occurs and nodes are stored in a linked list. In Java 8+, if the number of elements in a single bucket reaches TREEIFY_THRESHOLD (8) and array capacity is at least 64, the linked list converts into a Red-Black Tree (TreeNode), improving worst-case search complexity from O(n) to O(log n).",
                "HashMap is the single most frequently asked Core Java interview question. Demonstrating deep knowledge of bitwise masking and Red-Black tree conversion impresses technical interviewers.",
                ["Initial capacity 16, load factor 0.75.", "Index calculation uses (n - 1) & hash.", "Hash collisions stored in linked list.", "Treeifies to Red-Black Tree when bucket size >= 8 and capacity >= 64.", "Keys must implement both equals() and hashCode() consistently."],
                "// Contract: If a.equals(b), then a.hashCode() MUST equal b.hashCode()\n@Override\npublic boolean equals(Object o) { ... }\n@Override\npublic int hashCode() { return Objects.hash(id, name); }",
                ["Overriding equals() without overriding hashCode().", "Believing HashMap is thread-safe (use ConcurrentHashMap for concurrent access)."],
                ["HashMap", "Hashing", "Collision", "Red-Black Tree", "Treeification", "Core Java"]
              ),
              createQuestion(
                "What is the difference between Heap and Stack memory in the JVM, and how do Garbage Collectors identify unreferenced objects?",
                "Technical",
                "Medium",
                "Stack memory is used for thread-specific execution: storing local primitive variables and references to objects on the heap. Each thread has its own call stack, and memory is automatically allocated/deallocated in LIFO order as methods enter and exit. Heap memory stores all objects and JRE classes, shared across all threads. Garbage Collectors identify unreachable objects using Root Reachability Analysis (tracing from GC Roots like thread stacks, static variables, and JNI references). If an object has no reference path from any GC Root, it is eligible for garbage collection (divided into Young Generation Eden/Survivor and Old Generation).",
                "Knowing JVM memory separation prevents OutOfMemoryError and StackOverflowError in production enterprise systems.",
                ["Stack is thread-private, LIFO, stores local vars and references; Heap is shared, stores objects.", "GC Roots tracing identifies reachable objects (not simple reference counting, which fails with circular references).", "Generational GC divides heap into Young (Eden, S0, S1) and Tenured/Old generation."],
                "void method() {\n  User user = new User(); // 'user' reference is on Stack, 'new User()' object is on Heap\n}",
                ["Thinking Garbage Collection relies on reference counting (Java uses GC Root tracing).", "Confusing StackOverflowError (deep recursion) with OutOfMemoryError (heap full)."],
                ["JVM", "Heap", "Stack", "Garbage Collection", "GC Roots", "Memory Management"]
              )
            ]
          },
          {
            title: "Spring Boot & Enterprise Architecture",
            description: "Dependency Injection, Spring Bean lifecycle, JPA transactions, and REST controllers.",
            questions: [
              createQuestion(
                "How does Spring's Inversion of Control (IoC) and Dependency Injection (DI) work, and what are the scopes of a Spring Bean?",
                "Technical",
                "Easy",
                "Inversion of Control (IoC) transfers the responsibility of instantiating, configuring, and managing the lifecycle of objects from the developer code to the Spring IoC Container (ApplicationContext). Dependency Injection is the design pattern used to implement IoC, where dependencies are injected via constructor, setter, or field (@Autowired, with constructor injection strongly recommended for immutability and testability). Bean scopes include: Singleton (default, one instance per Spring container), Prototype (new instance every time requested), Request (one per HTTP request), Session (one per HTTP session), and Application (one per ServletContext).",
                "IoC and DI are the bedrock of the Spring framework, enabling loose coupling, modularity, and easy mocking in unit tests.",
                ["IoC container manages bean lifecycle; DI injects dependencies.", "Prefer constructor injection over field injection (@Autowired).", "Default scope is Singleton (thread safety must be maintained).", "Web scopes: Request, Session, Application."],
                "@Service\npublic class UserService {\n  private final UserRepository repo;\n  // Constructor injection\n  public UserService(UserRepository repo) { this.repo = repo; }\n}",
                ["Using field injection everywhere, making unit testing without Spring context difficult.", "Putting mutable state in a Singleton bean, causing concurrency race conditions."],
                ["Spring Boot", "IoC", "Dependency Injection", "Bean Scopes", "Singleton", "Prototype"]
              )
            ]
          }
        ]
      }
    ]
  },
  "Python Developer": {
    overview: "Python development interview preparation covering Python internals, OOP, memory management, FastAPI/Django, asynchronous programming, and database ORMs.",
    tips: [
      "Understand Python's Global Interpreter Lock (GIL) and its implications on multi-threading vs multi-processing.",
      "Master Python generators, decorators, context managers, and dunder methods.",
      "Understand FastAPI async route execution and Pydantic data validation.",
      "Review SQL database modeling, indexing, and ORM query optimization."
    ],
    generalQuestions: sharedGeneralQuestions,
    tracks: [
      {
        title: "Python Internals, OOP & Concurrency",
        description: "GIL, generators, decorators, memory management, and asynchronous I/O.",
        requiredSkills: [{ name: "Python", requiredLevel: "Advanced" }, { name: "FastAPI", requiredLevel: "Intermediate" }, { name: "SQL", requiredLevel: "Intermediate" }],
        resources: [
          { title: "Real Python Advanced Tutorials", url: "https://realpython.com", type: "Article" },
          { title: "FastAPI Official Documentation", url: "https://fastapi.tiangolo.com", type: "Documentation" }
        ],
        topics: [
          {
            title: "Core Python & Asynchronous Programming",
            description: "GIL mechanics, asyncio event loop, generators vs lists, and decorators.",
            questions: [
              createQuestion(
                "Explain Python's Global Interpreter Lock (GIL). How does it affect concurrency and when should you use multiprocessing vs threading?",
                "Technical",
                "Hard",
                "The GIL is a mutex in CPython that prevents multiple native OS threads from executing Python bytecode simultaneously. It exists because CPython's memory management is not thread-safe and relies on reference counting. Consequently, multi-threading in Python does NOT achieve true parallelism on multi-core CPUs for CPU-bound tasks (like matrix multiplication or encryption). However, for I/O-bound tasks (network requests, database calls, file I/O), threading or asyncio works effectively because threads release the GIL while waiting for I/O. For CPU-bound tasks, we use the multiprocessing module or ProcessPoolExecutor to spawn independent processes, each with its own Python interpreter, memory space, and GIL.",
                "Understanding the GIL is essential for designing high-concurrency Python architectures.",
                ["GIL allows only one thread to execute Python bytecode at a time in CPython.", "I/O-bound tasks: use asyncio or threading (GIL released during I/O).", "CPU-bound tasks: use multiprocessing to bypass GIL and utilize multiple CPU cores.", "Alternative interpreters without GIL exist (e.g. PyPy with STM, Python 3.13 free-threaded build)."],
                "# CPU-bound parallelism:\nfrom multiprocessing import Pool\nwith Pool(processes=4) as pool:\n    results = pool.map(cpu_heavy_func, data_list)",
                ["Assuming threading provides speedup for heavy mathematical loops in Python.", "Overlooking IPC (Inter-Process Communication) overhead in multiprocessing."],
                ["GIL", "Multithreading", "Multiprocessing", "Asyncio", "CPython", "Concurrency"]
              ),
              createQuestion(
                "How do Python Generators and the yield keyword work, and why are they superior to returning lists for large datasets?",
                "Technical",
                "Easy",
                "A generator is a function that produces a sequence of values lazily on-demand using the 'yield' keyword instead of returning a complete collection at once. When a generator function is called, it returns a generator iterator object without executing the body immediately. Each call to next() resumes execution until the next yield statement, returning the value and pausing execution while preserving its local execution state. This yields O(1) memory complexity regardless of dataset size, whereas returning a list with millions of items allocates massive RAM and risks MemoryError.",
                "Generators are a staple in Python data pipelines, file streaming, and ETL workflows.",
                ["Generators compute values lazily on demand.", "Memory complexity is O(1) compared to O(N) for materialized lists.", "Preserves local state between successive next() calls.", "Can be created using yield or generator expressions (x for x in iterable)."],
                "def read_large_file(file_path):\n    with open(file_path, 'r') as f:\n        for line in f:\n            yield line.strip()",
                ["Trying to index or slice a generator directly like a list (generators don't support random access).", "Consuming a generator once and expecting it to reset automatically."],
                ["Generators", "Yield", "Memory Efficiency", "Lazy Evaluation", "Iterators"]
              )
            ]
          }
        ]
      }
    ]
  },
  "Data Scientist": {
    overview: "Data science interview preparation covering statistical inference, supervised/unsupervised machine learning, feature engineering, model evaluation, and business interpretation.",
    tips: [
      "Be prepared to explain bias-variance trade-off, regularization (L1 Lasso vs L2 Ridge), and cross-validation.",
      "Understand evaluation metrics: Precision, Recall, F1-Score, ROC-AUC, PR-AUC, and RMSE.",
      "Know how to deal with missing data, outliers, class imbalance, and multicollinearity.",
      "Always tie machine learning metrics back to tangible business outcomes."
    ],
    generalQuestions: sharedGeneralQuestions,
    tracks: [
      {
        title: "Machine Learning & Model Evaluation",
        description: "Supervised algorithms, regularization, metrics selection, and class imbalance strategies.",
        requiredSkills: [{ name: "Python", requiredLevel: "Advanced" }, { name: "Machine Learning", requiredLevel: "Advanced" }, { name: "SQL", requiredLevel: "Intermediate" }],
        resources: [
          { title: "Scikit-Learn Model Evaluation Guide", url: "https://scikit-learn.org/stable/modules/model_evaluation.html", type: "Documentation" },
          { title: "StatQuest Machine Learning Video Series", url: "https://statquest.org", type: "Article" }
        ],
        topics: [
          {
            title: "Statistical Modeling & Feature Engineering",
            description: "Bias-Variance trade-off, regularization, class imbalance, and validation techniques.",
            questions: [
              createQuestion(
                "How do you handle severe class imbalance (e.g. 99% negative, 1% positive) in a classification problem?",
                "Technical",
                "Medium",
                "In highly imbalanced datasets (e.g. fraud detection or medical diagnosis), accuracy is deceptive (a dummy model predicting negative gets 99% accuracy). To address it: 1) Metric Choice: Replace accuracy with Precision-Recall AUC (PR-AUC), F1-Score, or Cost-Sensitive Loss. 2) Resampling: Apply SMOTE (Synthetic Minority Over-sampling Technique) to generate synthetic positive samples or random undersampling on the majority class. 3) Algorithm-level adjustments: Use class-weighted loss (e.g. scale_pos_weight in XGBoost or class_weight='balanced' in Scikit-Learn) to penalize false negatives more heavily. 4) Threshold tuning: Calibrate classification probability thresholds using precision-recall curves to meet business tolerance.",
                "Class imbalance is present in almost all real-world production datasets and tests practical applied data science maturity.",
                ["Never rely on accuracy for imbalanced data.", "Use PR-AUC, Recall, and F1.", "Apply SMOTE or Tomek Links.", "Use class weights in loss functions.", "Tune decision thresholds based on business cost of false positives vs false negatives."],
                "from imblearn.over_sampling import SMOTE\nfrom sklearn.metrics import classification_report, average_precision_score\nX_res, y_res = SMOTE(random_state=42).fit_resample(X_train, y_train)",
                ["Applying SMOTE before train-test split (causes severe data leakage).", "Reporting high accuracy while the model fails to detect any positive cases."],
                ["Class Imbalance", "SMOTE", "Precision-Recall", "F1-Score", "Cost-Sensitive Learning"]
              )
            ]
          }
        ]
      }
    ]
  },
  "Machine Learning Engineer": {
    overview: "ML Engineering preparation covering deep learning, model deployment, inference optimization, vector search, MLOps, and scalable ML pipelines.",
    tips: [
      "Understand model serving frameworks (Triton, ONNX Runtime, TorchScript, FastAPI).",
      "Be ready to discuss distributed training (Data Parallelism vs Model Parallelism).",
      "Understand monitoring for concept drift and data drift in production ML systems.",
      "Know vector databases (Pinecone, Milvus, Qdrant) and RAG (Retrieval-Augmented Generation) patterns."
    ],
    generalQuestions: sharedGeneralQuestions,
    tracks: [
      {
        title: "Deep Learning & MLOps Pipelines",
        description: "Model serving, quantization, vector embeddings, and production drift monitoring.",
        requiredSkills: [{ name: "Python", requiredLevel: "Advanced" }, { name: "Deep Learning", requiredLevel: "Intermediate" }, { name: "Docker", requiredLevel: "Intermediate" }],
        resources: [
          { title: "Hugging Face Course", url: "https://huggingface.co/course", type: "Documentation" },
          { title: "Full Stack Deep Learning MLOps", url: "https://fullstackdeeplearning.com", type: "Article" }
        ],
        topics: [
          {
            title: "Model Serving & Inference Optimization",
            description: "Quantization, ONNX, batch inference, latency budgets, and caching.",
            questions: [
              createQuestion(
                "How do you optimize a large deep learning model for low-latency production inference on edge or cloud servers?",
                "Technical",
                "Hard",
                "Model optimization follows several key techniques: 1) Quantization: Convert FP32 weights to INT8 or FP16, reducing model size by up to 75% and speeding up tensor operations with minimal accuracy degradation (Post-Training Quantization or QAT). 2) Graph Optimization: Export to ONNX or TensorRT to fuse layers (e.g. Conv + BatchNorm + ReLU into a single kernel) and prune redundant graph operations. 3) Pruning & Distillation: Remove low-magnitude weights or train a smaller student model from a large teacher model. 4) Dynamic Batching: Use serving engines like Triton Inference Server or vLLM to batch concurrent requests asynchronously, maximizing GPU utilization.",
                "Bridging the gap between raw PyTorch models and sub-50ms production inference is the hallmark of a senior ML engineer.",
                ["Quantization (FP32 to INT8/FP16) reduces memory and compute latency.", "Layer fusion via ONNX Runtime or TensorRT.", "Knowledge distillation from teacher to student models.", "Dynamic request batching in specialized model servers (Triton, vLLM)."],
                "# PyTorch dynamic quantization example:\nimport torch\nquantized_model = torch.quantization.quantize_dynamic(\n    model, {torch.nn.Linear}, dtype=torch.qint8\n)",
                ["Deploying raw unoptimized PyTorch models directly inside vanilla Flask without worker concurrency.", "Failing to verify post-quantization accuracy on a holdout evaluation dataset."],
                ["Model Optimization", "Quantization", "ONNX", "TensorRT", "Inference Latency", "MLOps"]
              )
            ]
          }
        ]
      }
    ]
  },
  "Data Analyst": {
    overview: "Data analyst interview preparation covering advanced SQL, data cleaning, exploratory data analysis, business intelligence dashboards, and storytelling with data.",
    tips: [
      "Master advanced SQL: Window functions (ROW_NUMBER, DENSE_RANK, LEAD, LAG), CTEs, and aggregations.",
      "Be prepared to translate vague business questions into concrete analytical queries and hypotheses.",
      "Understand dashboard design principles in Power BI or Tableau: clarity, user hierarchy, and actionability.",
      "Communicate data findings clearly to non-technical stakeholders using the STAR method."
    ],
    generalQuestions: sharedGeneralQuestions,
    tracks: [
      {
        title: "Advanced SQL & Business Analytics",
        description: "Window functions, Common Table Expressions, Cohort analysis, and metrics calculation.",
        requiredSkills: [{ name: "SQL", requiredLevel: "Advanced" }, { name: "Power BI", requiredLevel: "Intermediate" }, { name: "Data Analysis", requiredLevel: "Advanced" }],
        resources: [
          { title: "Mode Analytics Advanced SQL Guide", url: "https://mode.com/sql-tutorial/", type: "Documentation" },
          { title: "Storytelling with Data Guide", url: "https://www.storytellingwithdata.com", type: "Article" }
        ],
        topics: [
          {
            title: "Advanced SQL & Analytical Queries",
            description: "Window functions, partition by, cohort retention, and aggregate metrics.",
            questions: [
              createQuestion(
                "Write and explain an SQL query using Window Functions to calculate month-over-month revenue growth percentage and user retention.",
                "Technical",
                "Medium",
                "To calculate month-over-month growth, we aggregate monthly revenue and use the LAG() window function to access the prior month's revenue without self-joining. We use: WITH MonthlyRevenue AS (SELECT DATE_TRUNC('month', order_date) AS month, SUM(amount) AS revenue FROM orders GROUP BY 1) SELECT month, revenue, LAG(revenue, 1) OVER (ORDER BY month) AS prev_rev, ROUND(((revenue - LAG(revenue, 1) OVER (ORDER BY month)) / LAG(revenue, 1) OVER (ORDER BY month)) * 100, 2) AS growth_pct FROM MonthlyRevenue. Window functions allow running calculations across a set of table rows related to the current row without collapsing the rows like GROUP BY.",
                "Window functions are tested in virtually every technical data analytics interview.",
                ["Use CTE (WITH clause) for clean modular steps.", "LAG(col, offset) retrieves previous row values.", "LEAD(col, offset) retrieves subsequent row values.", "PARTITION BY resets the calculation window across categories or users."],
                "SELECT employee_id, department_id, salary,\n  DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) as rank\nFROM employees;",
                ["Using subqueries and self-joins where window functions are cleaner and significantly faster.", "Forgetting to handle division by zero in growth percentage calculations."],
                ["SQL", "Window Functions", "LAG", "LEAD", "Cohort Retention", "MoM Growth"]
              )
            ]
          }
        ]
      }
    ]
  },
  "DevOps Engineer": {
    overview: "DevOps interview preparation covering CI/CD pipelines, Docker containerization, Kubernetes orchestration, Infrastructure as Code (Terraform), and Linux systems engineering.",
    tips: [
      "Understand multi-stage Docker builds to produce minimal, secure container images.",
      "Be prepared to explain Kubernetes architecture: API Server, etcd, Kubelet, Pods, Deployments, Services, and Ingress.",
      "Master CI/CD automation principles, canary vs blue-green deployment strategies, and rollback automation.",
      "Review Linux system diagnostics (top, htop, netstat/ss, lsof, iostat, strace, journalctl)."
    ],
    generalQuestions: sharedGeneralQuestions,
    tracks: [
      {
        title: "Docker, Kubernetes & Infrastructure as Code",
        description: "Containers, orchestration, networking, Helm, Terraform, and automated CI/CD.",
        requiredSkills: [{ name: "Docker", requiredLevel: "Advanced" }, { name: "Linux", requiredLevel: "Advanced" }, { name: "Git", requiredLevel: "Advanced" }],
        resources: [
          { title: "Kubernetes Documentation", url: "https://kubernetes.io/docs/home/", type: "Documentation" },
          { title: "Docker Best Practices Guide", url: "https://docs.docker.com/develop/develop-images/guidelines/", type: "Article" }
        ],
        topics: [
          {
            title: "Containerization & Multi-Stage Builds",
            description: "Docker security, rootless containers, multi-stage builds, and layer caching.",
            questions: [
              createQuestion(
                "How do multi-stage Docker builds optimize image size and security, and what are container hardening best practices?",
                "Technical",
                "Medium",
                "Multi-stage Docker builds use multiple FROM instructions in a single Dockerfile. The first stage contains heavy build tools (compilers, npm dependencies, SDKs) to compile the application. The final stage copies only the compiled production artifacts into a minimal base image (such as Alpine or distroless), discarding build dependencies, test suites, and temporary caches. This shrinks image sizes from 1GB+ down to <50MB, significantly reducing transfer time and eliminating package vulnerabilities. Security hardening practices include: 1) Never run containers as root (USER appuser). 2) Use read-only root filesystems where possible. 3) Scan images for CVEs using Trivy or Snyk. 4) Pin specific digest tags instead of :latest.",
                "Container security and build optimization are core competencies for production DevOps environments.",
                ["Multi-stage builds copy only compiled artifacts into a lightweight runtime container.", "Minimizes attack surface by removing compilers and build tools.", "Enforce non-root users inside containers (USER nonroot).", "Use distroless or Alpine base images."],
                "# Multi-stage example:\nFROM node:20-alpine AS builder\nWORKDIR /app\nCOPY . .\nRUN npm ci && npm run build\n\nFROM node:20-alpine\nWORKDIR /app\nUSER node\nCOPY --from=builder /app/dist ./dist\nCMD [\"node\", \"dist/index.js\"]",
                ["Running container processes as the default root user.", "Copying node_modules or secret credentials directly into the image without .dockerignore."],
                ["Docker", "Multi-Stage Build", "Container Hardening", "Non-Root", "Security", "DevOps"]
              )
            ]
          }
        ]
      }
    ]
  },
  "Cloud Engineer": {
    overview: "Cloud engineering interview preparation covering AWS/Azure architectures, VPC networking, IAM security policies, serverless computing, and cost optimization.",
    tips: [
      "Master cloud networking: VPCs, subnets (public/private), NAT Gateways, Route Tables, and Security Groups vs NACLs.",
      "Understand IAM least privilege principles, cross-account access, and role-based policies.",
      "Be prepared to design high-availability and disaster recovery architectures (Multi-AZ vs Multi-Region).",
      "Understand serverless architectures (AWS Lambda, API Gateway) and event-driven patterns."
    ],
    generalQuestions: sharedGeneralQuestions,
    tracks: [
      {
        title: "Cloud Architecture, Networking & IAM",
        description: "VPC design, Security Groups, High Availability, Serverless, and Cloud Security.",
        requiredSkills: [{ name: "AWS", requiredLevel: "Advanced" }, { name: "Docker", requiredLevel: "Intermediate" }, { name: "Computer Networks", requiredLevel: "Intermediate" }],
        resources: [
          { title: "AWS Well-Architected Framework", url: "https://aws.amazon.com/architecture/well-architected/", type: "Documentation" },
          { title: "Cloud Design Patterns", url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/", type: "Article" }
        ],
        topics: [
          {
            title: "VPC Networking & Security Groups",
            description: "Subnetting, NAT gateways, stateful vs stateless firewalls, and bastion hosts.",
            questions: [
              createQuestion(
                "What is the difference between Security Groups and Network Access Control Lists (NACLs) in AWS VPC networking?",
                "Technical",
                "Medium",
                "Security Groups and NACLs are both virtual firewalls within a VPC, but operate at different layers: 1) Scope: Security Groups operate at the individual ENI (instance) level, while NACLs operate at the subnet boundary level. 2) Statefulness: Security Groups are stateful (if inbound traffic is allowed, outbound response is automatically allowed regardless of outbound rules). NACLs are stateless (both inbound and outbound rules must be explicitly defined). 3) Rule evaluation: Security Groups evaluate all rules before deciding to allow traffic (allow-only rules, no deny rules). NACLs evaluate rules in numerical order (lowest rule number first) and support both explicit ALLOW and DENY rules.",
                "Cloud networking security forms the backbone of AWS certifications and enterprise cloud infrastructure interviews.",
                ["Security Groups are instance-level and stateful (return traffic automatically permitted).", "NACLs are subnet-level and stateless (require inbound and outbound rules).", "NACLs evaluate rules in numerical order; Security Groups evaluate all rules.", "NACLs support explicit DENY rules, enabling instant IP blacklisting."],
                "// Typical secure setup:\n// Public Subnet: ALB with Security Group allowing 443 from 0.0.0.0/0\n// Private Subnet: EC2 instances allowing port 80 only from ALB Security Group\n// DB Subnet: RDS allowing port 5432 only from EC2 Security Group",
                ["Attempting to write an explicit DENY rule in a Security Group (Security Groups only have ALLOW rules).", "Forgetting to open ephemeral ports in a stateless NACL for outbound response packets."],
                ["AWS", "VPC", "Security Group", "NACL", "Stateful Firewall", "Cloud Security"]
              )
            ]
          }
        ]
      }
    ]
  }
};

module.exports = {
  generalPlacementTips,
  sharedGeneralQuestions,
  careerDataMap
};
