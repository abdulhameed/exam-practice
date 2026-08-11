import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabaseClient";

// ─────────────────────────────────────────────────────────────────────────────
// BUILT-IN QUESTIONS (Software Engineering Fundamentals)
// ─────────────────────────────────────────────────────────────────────────────
const BUILTIN_QUESTIONS = [
  { id: 1, question: "A student claims: “Object‑Oriented Analysis (OOA) is the same as structured analysis.” Evaluate.", options: ["OOA is a subset.", "They are identical in notation.", "False – OOA focuses on objects and classes; structured analysis focuses on functions and data flow.", "True."], answer: 2 },
  { id: 2, question: "Create a technical feasibility checklist for a real‑time tracking app. Which item is LEAST relevant?", options: ["Availability of GPS APIs on target phones", "Number of UI color schemes", "Server capacity for handling location updates", "Team’s knowledge of WebSockets or similar"], answer: 1 },
  { id: 3, question: "Compare ad‑hoc and systematic engineering regarding *testing*. Which statement is true?", options: ["Ad‑hoc always uses automated testing", "Systematic engineering skips testing", "Systematic engineering has defined test phases matching requirements", "Ad‑hoc includes rigorous test plans"], answer: 2 },
  { id: 4, question: "In the software life cycle, the design phase’s typical output is:", options: ["Architecture diagrams, interface specifications, data models", "Test cases", "User manual", "Executable code"], answer: 0 },
  { id: 5, question: "Which type of maintenance improves software performance or maintainability without changing functionality?", options: ["Preventive", "Perfective", "Adaptive", "Corrective"], answer: 1 },
  { id: 6, question: "Design a software model (UML) for a banking system. Which diagram best shows the static structure?", options: ["Activity diagram", "Class diagram", "Sequence diagram", "State machine diagram"], answer: 1 },
  { id: 7, question: "A team estimates effort for a food delivery app using analogy with a library app but ignores that food delivery has real‑time GPS and payment. Evaluate their estimate.", options: ["It will be perfect.", "It will overestimate.", "It will likely underestimate because the extra complexities are not fully accounted.", "Analogy cannot be used."], answer: 2 },
  { id: 8, question: "Create a requirement for a mobile banking app that is non‑functional (security). Which one?", options: ["All data transmitted shall be encrypted using TLS 1.3", "User can transfer to other banks", "User can log in with fingerprint", "User can view last 10 transactions"], answer: 0 },
  { id: 9, question: "Design a test phase pairing using V‑model for the design of a database schema (detailed design). Which test?", options: ["Acceptance test", "System test", "Unit test (on individual modules)", "Integration test"], answer: 2 },
  { id: 10, question: "Create a scenario where the Waterfall model fails but the V‑model might succeed.", options: ["Requirements are unclear and change often. (Both fail)", "No testing needed.", "Very small project.", "Requirements are clear but safety‑critical; V‑model’s paired testing catches design errors earlier."], answer: 3 },
  { id: 11, question: "A library system’s software model decision: “We define a `Book` class with `title`, `author`, and `isAvailable()` method.” This is part of:", options: ["Testing strategy", "Feasibility study", "Software model (structural/design model)", "Process model"], answer: 2 },
  { id: 12, question: "For a mobile banking app, a functional requirement is:", options: ["The app shall respond within 2 seconds", "The app shall support 1000 concurrent users", "The app shall use 128‑bit encryption", "The app shall allow user to transfer money between accounts"], answer: 3 },
  { id: 13, question: "A project manager says, “We don’t need a feasibility study; we’ll just start coding the campus food delivery app.” Evaluate this approach.", options: ["Risky; feasibility (technical, economic) should be checked to avoid wasted effort.", "Good, coding solves everything.", "Feasibility is only for large companies.", "Always unnecessary."], answer: 0 },
  { id: 14, question: "A student argues that the V‑model is just the Waterfall model drawn differently. Evaluate this statement.", options: ["V‑model is older.", "They differ only in diagram shape.", "False, V‑model explicitly pairs test phases, changing the emphasis and planning.", "True, no difference."], answer: 2 },
  { id: 15, question: "Create a process model decision for a safety‑critical medical system – choose between Waterfall and V‑model and justify in one sentence.", options: ["Waterfall because it’s linear.", "V‑model because it integrates testing with each phase, ensuring verification and validation."], answer: 1 },
  { id: 16, question: "A developer wants to skip the design phase and go directly to coding. Evaluate based on software engineering principles.", options: ["Only acceptable if using ad‑hoc for tiny personal scripts; for any maintainable system, design is essential.", "Design is only documentation.", "Coding is design.", "Acceptable for all projects."], answer: 0 },
  { id: 17, question: "A team of 20 developers builds an airline reservation system with 5‑year support. This is an example of:", options: ["Software", "A simple program", "A single algorithm", "An ad‑hoc script"], answer: 0 },
  { id: 18, question: "Produce a perfective maintenance example for WhatsApp.", options: ["Update due to GDPR changes", "Patch a security vulnerability", "Release “Channels” feature (new functionality)", "Fix a memory leak"], answer: 2 },
  { id: 19, question: "Evaluate the statement: “Upper CASE tools are more important than Lower CASE tools.”", options: ["True – design is everything.", "CASE tools are obsolete.", "False – both are important; upper helps get requirements right, lower helps implementation efficiency.", "Lower is always more important."], answer: 2 },
  { id: 20, question: "Plan the economic feasibility: Team of 5 students, 12 weeks, 8 hours/week. Total person‑hours?", options: ["420", "500", "600", "480"], answer: 3 },
  { id: 21, question: "For a smart campus parking app, in the requirements phase, the team would:", options: ["Write Java code for parking sensors", "Install servers", "Gather what features the app needs (e.g., find empty spot, reserve, pay)", "Design the database tables"], answer: 2 },
  { id: 22, question: "A student writes a Python script to compute average grades. This is best classified as:", options: ["A software model", "A program", "A process model", "Software"], answer: 1 },
  { id: 23, question: "A product manager says “We don’t need preventive maintenance; we only fix bugs when they occur.” Evaluate this long‑term view.", options: ["Correct, preventive is waste.", "Only adaptive matters.", "Preventive maintenance reduces future corrective costs; skipping it increases technical debt and future bugs.", "Preventive is only for hardware."], answer: 2 },
  { id: 24, question: "A student claims: “Ad‑hoc development is faster and better for small projects than systematic engineering.” Justify whether this is valid.", options: ["Systematic is always faster.", "It can be true for one‑person, throwaway scripts, but for any project needing longevity or team work, systematic is better.", "Always false.", "Ad‑hoc always produces better quality."], answer: 1 },
  { id: 25, question: "The V‑model’s testing approach differs from Waterfall by:", options: ["Pairing each development phase with a corresponding test phase", "Skipping unit tests", "Doing all tests at the end", "Testing only after deployment"], answer: 0 },
  { id: 26, question: "In OOP, the pillar that hides internal details and exposes only necessary interfaces is:", options: ["Abstraction", "Polymorphism", "Encapsulation", "Inheritance"], answer: 2 },
  { id: 27, question: "Which maintenance type for WhatsApp is most expensive over the long term?", options: ["Perfective – continuous new features", "Corrective – occasional bug fixes", "Preventive – code refactoring", "Adaptive – frequent OS updates"], answer: 0 },
  { id: 28, question: "Create an analogy estimation: Previous e‑commerce site: 500h. New food delivery app adds: payment gateway (70h), delivery tracking (80h), restaurant ratings (30h). Total?", options: ["680h", "650h", "500h", "700h"], answer: 0 },
  { id: 29, question: "Which of the following is an example of a software model?", options: ["V‑model", "Waterfall model", "Agile model", "Class diagram in UML"], answer: 3 },
  { id: 30, question: "A bank requires 99.999% availability. Evaluate which maintenance type is most critical.", options: ["Preventive and corrective (to avoid downtime)", "Perfective", "None", "Adaptive only"], answer: 0 },
  { id: 31, question: "Create a process model decision for a library system where requirements are expected to change frequently. Which model would you choose?", options: ["V‑model", "Waterfall (sequential)", "Spiral model", "Agile (iterative, not named in exam but implied “not Waterfall”)"], answer: 3 },
  { id: 32, question: "A team uses the analogy estimation technique but the previous project had different complexity. This method’s main risk is:", options: ["It cannot be used for hours", "Differences between projects may be ignored, leading to inaccurate estimates", "It requires no historical data", "It is too precise"], answer: 1 },
  { id: 33, question: "A requirement: “The system shall never allow withdrawal exceeding balance.” This is both functional and non‑functional? Analyze.", options: ["Not a requirement", "Functional (specific behavior) but also a reliability/security constraint", "Purely non‑functional", "Purely aesthetic"], answer: 1 },
  { id: 34, question: "For a mobile banking app, a non‑functional requirement is:", options: ["The app shall have a login screen", "User can view transaction history", "The app shall support 1000 concurrent users", "User can change password"], answer: 2 },
  { id: 35, question: "Create a software model (UML) for a library system that shows the dynamic behavior of borrowing a book. Which diagram?", options: ["Sequence diagram", "Deployment diagram", "Class diagram", "Component diagram"], answer: 0 },
  { id: 36, question: "A project has no documentation and original developers have left. Evaluate the difficulty of maintenance.", options: ["No effect.", "Extremely difficult and expensive; software engineering emphasizes documentation to mitigate this.", "Only corrective maintenance possible.", "Easy, code is self‑documenting."], answer: 1 },
  { id: 37, question: "Plan the testing activities using V‑model: If you are in requirements phase, design which test?", options: ["Acceptance test (system acceptance)", "Unit test", "Integration test", "Component test"], answer: 0 },
  { id: 38, question: "A student claims that UML is always necessary. Evaluate.", options: ["Yes, always mandatory.", "UML is never useful.", "No, for very small, simple programs, UML can be overhead; but for any team or long‑lived software, it helps.", "Only for banking systems."], answer: 2 },
  { id: 39, question: "Create a requirement for a parking app that is a constraint (non‑functional).", options: ["The app shall allow reservation.", "The app shall generate a receipt.", "The app shall use the university’s OAuth 2.0 for login.", "The app shall show parking spot availability."], answer: 2 },
  { id: 40, question: "A student developer writes a script without any design or documentation, directly coding. This is:", options: ["Systematic engineering", "V‑model", "Ad‑hoc development", "Waterfall model"], answer: 2 },
  { id: 41, question: "Which symptom of the software crisis meant that software often did not meet user expectations?", options: ["Difficult maintenance", "Missed schedules", "Poor quality and unreliability", "Budget overrun"], answer: 2 },
  { id: 42, question: "Create a preventive maintenance task for a library system.", options: ["Add a new book search algorithm", "Correct a bug in fine calculation", "Refactor the database access layer to reduce future errors", "Update the library OS"], answer: 2 },
  { id: 43, question: "Which component of software refers to the logical organization of modules and their interactions?", options: ["Data", "Documentation", "Structure", "Executable code"], answer: 2 },
  { id: 44, question: "Which of the following is a real‑world example of a *program* (as opposed to software)?", options: ["A student’s Python script to calculate Fibonacci numbers", "A hospital management system", "Microsoft Windows", "An airline reservation system"], answer: 0 },
  { id: 45, question: "A bank’s system uses a `Transaction` class with `execute()` method. `TransferTransaction` and `DepositTransaction` override `execute()`. This is an example of:", options: ["Encapsulation violation", "Multiple inheritance", "Polymorphism via inheritance", "Data hiding"], answer: 2 },
  { id: 46, question: "A team holds regular design reviews, writes a software requirements specification, and performs unit testing. This follows:", options: ["No process", "Systematic engineering", "Code‑and‑fix", "Ad‑hoc development"], answer: 1 },
  { id: 47, question: "The four pillars of Object‑Oriented Programming are:", options: ["Encapsulation, Inheritance, Polymorphism, Abstraction", "Analysis, Design, Coding, Testing", "Sequence, Selection, Iteration, Recursion", "Compilation, Interpretation, Linking, Loading"], answer: 0 },
  { id: 48, question: "Create a functional requirement for a smart campus parking app.", options: ["The app shall support 500 concurrent users", "The app shall use less than 50 MB memory", "The app shall respond within 1 second", "The app shall display available parking spots in real time"], answer: 3 },
  { id: 49, question: "Compare the Waterfall model and the V‑model in terms of structure, testing approach, and suitability for safety‑critical systems. When would you choose the V‑model over Waterfall?", options: ["For one‑day hackathons", "For safety‑critical systems that require rigorous testing", "For small experimental projects with unclear requirements", "For projects where the customer changes mind daily"], answer: 1 },
  { id: 50, question: "Design a software model (UML) to show how a user interacts with a food delivery app (use cases). Which diagram?", options: ["Use case diagram", "Component diagram", "Class diagram", "Sequence diagram"], answer: 0 },
  { id: 51, question: "A library system’s process model decision: “We will deliver a working prototype every two weeks.” Which process model does this indicate?", options: ["Agile (iterative delivery)", "Spiral model", "Waterfall", "V‑model"], answer: 0 },
  { id: 52, question: "Create a new process model that combines Waterfall’s phase discipline with V‑model’s test pairing. What would you call the testing activity after requirements?", options: ["Code review", "Integration test", "Acceptance test design", "Requirements validation test"], answer: 2 },
  { id: 53, question: "In the program vs. software distinction, “primary focus” for software is:", options: ["Minimizing lines of code", "Getting a single correct output", "Maintainability, scalability, and user needs", "Solving a specific small problem quickly"], answer: 2 },
  { id: 54, question: "A team of 4 has 400 person‑hours available. They estimate 350 person‑hours. However, they have no experience with real‑time tracking. Evaluate feasibility.", options: ["Definitely feasible.", "Likely feasible but with risk; add contingency.", "Feasibility cannot be determined without budget.", "Not feasible."], answer: 1 },
  { id: 55, question: "Create an analogy estimation for a ride‑sharing app: Reference project (taxi dispatch) 600h. Ride‑sharing adds: fare splitting (50h), real‑time ETA (70h), driver rating (30h). Total?", options: ["600h", "700h", "750h", "800h"], answer: 2 },
  { id: 56, question: "The birth of software engineering addressed the software crisis by introducing:", options: ["Individual coding without design", "Ad‑hoc development", "Elimination of documentation", "Systematic methods, tools, and processes"], answer: 3 },
  { id: 57, question: "For a library management system, choosing the Agile process model (iterative) vs. Waterfall (sequential) affects:", options: ["The final code’s class hierarchy", "How requirements are gathered and how often feedback is obtained", "The choice of programming language", "The database schema"], answer: 1 },
  { id: 58, question: "The V‑model is most suitable for:", options: ["Safety‑critical systems that require rigorous testing", "Projects where the customer changes mind daily", "One‑day hackathons", "Small experimental projects with unclear requirements"], answer: 0 },
  { id: 59, question: "Evaluate the following project decision: “We will skip the feasibility study because the project is mandatory.” Is this wise?", options: ["No, feasibility (technical, economic, legal) should still be checked to avoid impossible or overly costly execution.", "Always skip.", "Feasibility only for optional projects.", "Yes, mandatory projects don’t need feasibility."], answer: 0 },
  { id: 60, question: "Create a preventive maintenance schedule for a library system: what interval for code refactoring?", options: ["Only when bugs occur", "Every 6 months or after major feature additions", "After every user complaint", "Never"], answer: 1 },
  { id: 61, question: "RAISE Specification Language (RSL) is used for:", options: ["GUI prototyping", "Database design", "Formal specification of software systems", "Low‑level coding"], answer: 2 },
  { id: 62, question: "Compare the V‑model and Waterfall in terms of testing. Which analysis is correct?", options: ["Waterfall has more rigorous testing", "Both have no testing phase", "Waterfall integrates testing after coding; V‑model plans tests in parallel with each development phase", "V‑model has no validation"], answer: 2 },
  { id: 63, question: "Design a non‑functional requirement (maintainability) for a banking app.", options: ["The code shall be modular with documentation so that a new developer can fix a bug within 1 hour.", "The app shall transfer money.", "The app shall have a blue interface.", "The app shall store data in MySQL."], answer: 0 },
  { id: 64, question: "Evaluate the use of UML in a small one‑week project: Is it always necessary?", options: ["Yes, always mandatory.", "UML is never useful.", "No, for very small, simple programs, UML can be overhead; but for any team or long‑lived software, it helps.", "Only for banking systems."], answer: 2 },
  { id: 65, question: "A symptom of the software crisis – “software was often delivered but users refused to use it” – relates to:", options: ["Poor quality and unmet expectations", "Late delivery", "High maintenance", "Budget overrun"], answer: 0 },
  { id: 66, question: "The Waterfall model’s structure is:", options: ["Sequential with phases flowing downward", "Spiral with risk analysis", "Iterative and incremental", "Random and ad‑hoc"], answer: 0 },
  { id: 67, question: "An example of a process model decision for a library management system is:", options: ["Choosing between SQL and NoSQL database", "Designing the Book class with attributes", "Setting the font size of the UI", "Deciding to use Waterfall or Agile"], answer: 3 },
  { id: 68, question: "A student’s Python script to calculate Fibonacci numbers is best classified as:", options: ["A software model", "Software", "A process model", "A program"], answer: 3 },
  { id: 69, question: "A team uses the V‑model but skips the “system test design” phase. Evaluate the risk.", options: ["They lose the main benefit of V‑model – pairing verification/validation, likely leading to inadequate testing.", "V‑model doesn’t require test design.", "No risk.", "They can add later."], answer: 0 },
  { id: 70, question: "You are developing a medical device control system. According to the exam, which model would you choose over Waterfall?", options: ["Ad‑hoc", "Spiral model", "Big bang model", "V‑model (due to safety-critical nature and rigorous testing pairing)"], answer: 3 },
  { id: 71, question: "Which of the following best analyzes why the maintenance phase is so costly?", options: ["Software ages, environment changes, new bugs appear, and new features are requested continuously", "Only one person can work on maintenance", "Maintenance contracts are overpriced", "Developers are lazy after release"], answer: 0 },
  { id: 72, question: "Create an analogy estimation: Previous messaging app (250h). New social media app adds: photo filters (60h), stories (40h), comment system (30h). Total?", options: ["250h", "380h", "400h", "350h"], answer: 1 },
  { id: 73, question: "In systematic engineering, requirements are typically:", options: ["Not documented", "Written and agreed upon before design", "Changed every day without control", "Ignored until testing"], answer: 1 },
  { id: 74, question: "Produce a corrective maintenance plan for a banking app: after a bug is found, what steps?", options: ["Add new features", "Reproduce, fix, test, deploy patch", "Change database schema", "Ignore"], answer: 1 },
  { id: 75, question: "A student argues that documentation is a waste of time because only code matters. Evaluate this using the IEEE definition of software.", options: ["Neutral, depends on project size.", "Disagree, documentation is a core component essential for maintenance and understanding.", "Agree for all projects.", "Agree, code is all that executes."], answer: 1 },
  { id: 76, question: "Design a process model decision for a library system. Which is an example?", options: ["Deciding on database schema", "Choosing programming language", "Choosing Waterfall or Agile", "Creating a UML class diagram"], answer: 2 },
  { id: 77, question: "In the V‑model, the “verification” leg pairs:", options: ["High‑level design with integration testing", "Detailed design with unit testing", "All of the above", "Requirements with system testing"], answer: 2 },
  { id: 78, question: "The birth of software engineering introduced structured programming. This addressed which crisis symptom?", options: ["Legal issues", "Budget overrun", "Unreliable and error‑prone software", "Lack of hardware"], answer: 2 },
  { id: 79, question: "Create a non‑functional requirement (performance) for a banking app:", options: ["“The app shall store data in SQL.”", "“The app shall have a blue theme.”", "“The app shall allow funds transfer.”", "“The app shall support 5000 concurrent users with average response < 2 seconds.”"], answer: 3 },
  { id: 80, question: "Which type of maintenance for WhatsApp changes the app to work with a new Android version?", options: ["Adaptive", "Perfective", "Preventive", "Corrective"], answer: 0 },
  { id: 81, question: "Create a process model selection justification: For a project with stable requirements and need for rigorous testing, you select V‑model over Waterfall because:", options: ["V‑model is cheaper.", "Waterfall is iterative.", "V‑model reduces defects by testing each phase’s output early.", "Waterfall has no testing."], answer: 2 },
  { id: 82, question: "In a banking system applying OOP, using the same method `calculateInterest()` for SavingsAccount and CurrentAccount is an example of:", options: ["Abstraction", "Polymorphism", "Encapsulation", "Inheritance"], answer: 1 },
  { id: 83, question: "Which maintenance type in WhatsApp adds end‑to‑end encryption for voice calls?", options: ["Adaptive", "Preventive", "Perfective (new feature)", "Corrective"], answer: 2 },
  { id: 84, question: "A real‑world analogy for encapsulation is:", options: ["A car’s steering wheel (interface) hiding the engine details", "A remote control that works for multiple TV brands", "A child inheriting eye color from parents", "A blueprint for a house"], answer: 0 },
  { id: 85, question: "The software crisis of the 1960s was characterized by:", options: ["Lack of demand for software", "Budget overruns, missed deadlines, and unreliable software", "Projects delivered on time and within budget", "Abundance of reliable software"], answer: 1 },
  { id: 86, question: "A manager argues that documentation is a waste of time because only code matters. Evaluate.", options: ["Disagree, documentation is a core component essential for maintenance and understanding.", "Agree for all projects.", "Agree, code is all that executes.", "Neutral, depends on project size."], answer: 0 },
  { id: 87, question: "A project fails because the team started coding without understanding user needs. Which phase was skipped or poorly done?", options: ["Requirements", "Implementation", "Maintenance", "Design"], answer: 0 },
  { id: 88, question: "Create an analogy estimation for a parking app: A previous parking app took 250 hours. Your new app adds license plate recognition (+80h) and SMS notification (+20h). What is your analogy estimate?", options: ["250h", "350h", "270h", "330h"], answer: 1 },
  { id: 89, question: "The Z Specification Language is based on:", options: ["Flowcharts", "Natural language", "Set theory and predicate logic", "XML"], answer: 2 },
  { id: 90, question: "For a campus food delivery app, you have 4 students working 10 hours/week for 10 weeks. Total person‑hours available?", options: ["350", "450", "400", "300"], answer: 2 },
  { id: 91, question: "Documentation as a software component primarily serves to:", options: ["Compile the source code", "Store user information", "Execute instructions", "Support future maintenance and understanding"], answer: 3 },
  { id: 92, question: "A client insists that all requirements be fixed before any design. Evaluate this in light of the Waterfall model’s strength and weakness.", options: ["It is never possible.", "It reduces ambiguity but risks late discovery of errors; good for stable requirements, bad for changing needs.", "This is always ideal.", "It only applies to maintenance."], answer: 1 },
  { id: 93, question: "Design a high‑level architecture for a smart campus parking app. Which component is essential?", options: ["Chat system", "GPS sensor interface module", "Student grade calculator", "Library book scanner"], answer: 1 },
  { id: 94, question: "A program differs from software mainly in that a program:", options: ["Requires formal design phase", "Is typically developed by a large team", "Always has extensive documentation", "Has a narrower scope and shorter lifetime"], answer: 3 },
  { id: 95, question: "The main activity of the design phase is:", options: ["Translating requirements into architectural and detailed design", "Writing user stories", "Deploying to production", "Executing test scripts"], answer: 0 },
  { id: 96, question: "Create a scope statement for a campus food delivery app. Which is a proper OUT OF SCOPE item?", options: ["Real‑time driver tracking", "Integration with the university’s legacy human resources system", "User login via student ID", "Push notifications for order status"], answer: 1 },
  { id: 97, question: "A student claims: “A program is just a smaller version of software.” Is this accurate?", options: ["No, they are completely unrelated.", "Yes, only size differs.", "Yes, but documentation is optional.", "No, software includes documentation, structure, longer lifetime, and team coordination beyond just code."], answer: 3 },
  { id: 98, question: "In the V‑model, the “validation” leg corresponds to which development phase?", options: ["Coding → Unit testing", "Maintenance → Regression testing", "Design → Integration testing", "Requirements → Acceptance testing"], answer: 3 },
  { id: 99, question: "Upper CASE tools support:", options: ["Code generation and reverse engineering", "Early phases: requirements and design", "Project management and system testing", "Coding and debugging"], answer: 1 },
  { id: 100, question: "Plan the economic feasibility for a final year project: team of 3, 15 weeks, 5 hours/week. Available person‑hours = ?", options: ["225", "150", "300", "250"], answer: 0 },
  { id: 101, question: "A student team of 4 has 400 person‑hours available. They estimate 350 person‑hours, but have no experience with real‑time tracking. Evaluate feasibility.", options: ["Not feasible.", "Likely feasible but with risk; add contingency.", "Feasibility cannot be determined without budget.", "Definitely feasible."], answer: 1 },
  { id: 102, question: "Which of the following is NOT a core phase of the software life cycle?", options: ["Requirements", "Maintenance", "Marketing", "Design"], answer: 2 },
  { id: 103, question: "Compare the Waterfall and V‑model: The main structural difference is that Waterfall is strictly linear, while V‑model:", options: ["Combines coding and testing", "Is iterative", "Is also linear but bends the testing phase upward to mirror development phases", "Has no design phase"], answer: 2 },
  { id: 104, question: "The software crisis symptom “difficult maintenance” was addressed by software engineering through:", options: ["Structured programming and modular design", "Using faster computers", "Eliminating testing", "Hiring more programmers"], answer: 0 },
  { id: 105, question: "Create a test plan for a food delivery app using V‑model pairing. If you are in detailed design phase, which test level should you design?", options: ["Integration test", "Acceptance test", "System test", "Unit test"], answer: 3 },
  { id: 106, question: "Produce a feasibility study: List three items for technical feasibility of a drone delivery app. Which is correct?", options: ["Battery life, airspace regulations, GPS precision", "Number of users, marketing budget, brand name", "Menu prices, color scheme, font size", "Office location, furniture, coffee machine"], answer: 0 },
  { id: 107, question: "A previous library app took 300 hours. Your food delivery app adds payment integration (+60h) and real‑time tracking (+40h). Using analogy estimation, total effort = ?", options: ["300h", "360h", "400h", "340h"], answer: 2 },
  { id: 108, question: "A student team of 4 has 400 person‑hours available. Estimated effort is 350 person‑hours. Is the project economically feasible?", options: ["Only if budget allows", "Cannot determine", "No, because estimate > available", "Yes, because available >= estimate"], answer: 3 },
  { id: 109, question: "Compare ad‑hoc vs systematic in terms of documentation. Which is accurate?", options: ["Documentation is irrelevant", "Systematic engineering produces documentation as a standard output", "Both skip documentation", "Ad‑hoc has detailed documentation"], answer: 1 },
  { id: 110, question: "Produce an analogy estimation for a library system: Reference project – student registration system (400h). New system adds: book search (50h), fine calculation (30h), reservation (40h). Total?", options: ["520h", "480h", "400h", "550h"], answer: 0 },
  { id: 111, question: "Object‑Oriented Analysis (OOA) emphasizes:", options: ["Functional decomposition", "Data flow diagrams", "Identifying objects, classes, and their relationships", "Entity‑relationship diagrams only"], answer: 2 },
  { id: 112, question: "A team of 4 students working 10 hours/week for 10 weeks. Available person‑hours = 400. Estimated effort = 350. Feasibility?", options: ["Not feasible", "Feasibility depends on budget", "Feasible (available >= estimated)", "Marginally feasible but risky"], answer: 2 },
  { id: 113, question: "Which type of maintenance refers to modifying software to cope with changes in environment (e.g., new OS version)?", options: ["Corrective", "Preventive", "Adaptive", "Perfective"], answer: 2 },
  { id: 114, question: "A student claims that the V‑model is just the Waterfall model drawn differently. Evaluate.", options: ["They differ only in diagram shape.", "True, no difference.", "False, V‑model explicitly pairs test phases, changing the emphasis and planning.", "V‑model is older."], answer: 2 },
  { id: 115, question: "A project has stable, clear requirements and safety‑critical nature. You analyze Waterfall vs V‑model. You should choose:", options: ["V‑model because it integrates verification and validation at each level", "Any model randomly", "Waterfall because it’s simpler", "Ad‑hoc because safety is not important"], answer: 0 },
  { id: 116, question: "For a safety‑critical system like an autopilot, the V‑model’s advantage is:", options: ["It is cheaper than Waterfall", "Each development phase has a corresponding test level (e.g., design → integration test)", "No testing required", "It does not need requirements"], answer: 1 },
  { id: 117, question: "A student writes a Python script to compute average grades. This is best classified as:", options: ["A program", "A process model", "A software model", "Software"], answer: 0 },
  { id: 118, question: "A requirement for a mobile banking app: “The app shall display account balance within 1 second.” This is:", options: ["Functional requirement", "Non‑functional requirement (performance)", "User story", "Design decision"], answer: 1 },
  { id: 119, question: "In the software life cycle, if you are in the design phase of a parking app, which artifact are you likely to produce that would NOT be produced in requirements phase?", options: ["Component diagram showing communication between app server and IoT devices", "User interview transcripts", "List of stakeholders", "Use case diagram"], answer: 0 },
  { id: 120, question: "Design a UML class diagram for a banking system showing inheritance. Which pair shows inheritance?", options: ["`Customer` – `Account` (association)", "`Bank` – `ATM` (composition)", "`SavingsAccount` – `Account` (inheritance)", "`Transaction` – `Ledger` (dependency)"], answer: 2 },
  { id: 121, question: "Lower CASE tools focus on:", options: ["Implementation, testing, and maintenance", "Feasibility study", "Requirements analysis", "Stakeholder meetings"], answer: 0 },
  { id: 122, question: "A student argues that the V‑model is just the Waterfall model drawn differently. Evaluate.", options: ["True, no difference.", "False, V‑model explicitly pairs test phases, changing the emphasis and planning.", "They differ only in diagram shape.", "V‑model is older."], answer: 1 },
  { id: 123, question: "Create a software model (UML) showing the order of operations for “track delivery” in a food delivery app. Which diagram?", options: ["Activity diagram or sequence diagram", "Use case diagram", "Deployment diagram", "Class diagram"], answer: 0 },
  { id: 124, question: "Evaluate the statement: “A program is just a smaller version of software.” Is this accurate?", options: ["Yes, but documentation is optional.", "No, software includes documentation, structure, longer lifetime, and team coordination beyond just code.", "Yes, only size differs.", "No, they are completely unrelated."], answer: 1 },
  { id: 125, question: "Which phase of the software life cycle typically consumes 60–70% of total project costs?", options: ["Testing", "Implementation", "Maintenance", "Design"], answer: 2 },
  { id: 126, question: "A team chooses to follow the Waterfall model but later discovers that requirements were misunderstood. According to Waterfall’s drawback, what should they do?", options: ["Skip testing", "Go back to requirements phase formally (difficult in pure Waterfall)", "Deliver anyway", "Ignore the issue"], answer: 1 },
  { id: 127, question: "For a mobile banking app, a functional requirement is:", options: ["The app shall allow user to transfer money between accounts", "The app shall be available 99.9% of time", "The app shall respond within 2 seconds", "The app shall use 128‑bit encryption"], answer: 0 },
  { id: 128, question: "A requirement: “The banking app shall allow funds transfer.” This is:", options: ["Security requirement", "Usability metric", "Functional", "Non‑functional"], answer: 2 },
  { id: 129, question: "You are writing a scope statement for a campus food delivery app. Which item is IN scope?", options: ["University library system integration", "Building a new parking system", "Redesigning the university website", "Student login, restaurant menu browsing, order placement"], answer: 3 },
  { id: 130, question: "Evaluate the cost of fixing a requirements error in the design phase vs. in the maintenance phase. Which is more expensive? Justify.", options: ["Requirements errors cannot be fixed.", "Same cost.", "Maintenance phase is far more expensive due to rework, regression, and deployed system impact.", "Design phase is more expensive."], answer: 2 },
  { id: 131, question: "The four pillars of Object‑Oriented Programming are:", options: ["Encapsulation, Inheritance, Polymorphism, Abstraction", "Compilation, Interpretation, Linking, Loading", "Analysis, Design, Coding, Testing", "Sequence, Selection, Iteration, Recursion"], answer: 0 },
  { id: 132, question: "A real‑world analogy for encapsulation is:", options: ["A remote control that works for multiple TV brands", "A child inheriting eye color from parents", "A car’s steering wheel (interface) hiding the engine details", "A blueprint for a house"], answer: 2 },
  { id: 133, question: "A student’s script without any design or documentation, directly coding. This is:", options: ["Ad‑hoc development", "V‑model", "Waterfall model", "Systematic engineering"], answer: 0 },
  { id: 134, question: "Design a verification and validation plan using the V‑model for a smart parking app. Which pairing is correct?", options: ["High‑level design → Integration testing", "Coding → System testing", "Detailed design → Acceptance testing", "Requirements → Unit testing"], answer: 0 },
  { id: 135, question: "Which of the following is an example of a software model?", options: ["Agile model", "V‑model", "Waterfall model", "Class diagram in UML"], answer: 3 },
  { id: 136, question: "In a banking system, the `Account` class hiding the `balance` attribute and providing `deposit()`/`withdraw()` methods is:", options: ["Polymorphism", "Inheritance", "Encapsulation", "Abstraction"], answer: 2 },
  { id: 137, question: "For a smart campus parking app, describe what would happen in the requirements phase.", options: ["Install servers", "Gather what features the app needs (e.g., find empty spot, reserve, pay)", "Write Java code for parking sensors", "Design the database tables"], answer: 1 },
  { id: 138, question: "In the software life cycle, the design phase’s typical output is:", options: ["User manual", "Test cases", "Executable code", "Architecture diagrams, interface specifications, data models"], answer: 3 },
  { id: 139, question: "Create a maintenance categorization: WhatsApp updates the app to support new emoji – which type?", options: ["Corrective", "Perfective", "Adaptive", "Preventive"], answer: 1 },
  { id: 140, question: "Adaptive maintenance in WhatsApp refers to:", options: ["Rewriting the app in a new language", "Modifying software to cope with changes in environment (e.g., new OS version)", "Adding voice calling feature", "Fixing a crash when sending images"], answer: 1 },
  { id: 141, question: "A food delivery app team estimates 350 person‑hours but only has 320 available. Analyze feasibility.", options: ["Feasible because close enough", "Not economically feasible because available < estimated", "Feasibility depends only on technical issues", "Always feasible with overtime"], answer: 1 },
  { id: 142, question: "Evaluate the analogy estimation technique: Is it generally more reliable than expert judgment?", options: ["It depends on how similar the past project is; it can be good but may miss unique aspects.", "Always more reliable.", "Only for hardware.", "Never reliable."], answer: 0 },
  { id: 143, question: "Compare the Waterfall model and the V‑model. The V‑model is most suitable for:", options: ["Projects where the customer changes mind daily", "Safety‑critical systems that require rigorous testing", "One‑day hackathons", "Small experimental projects with unclear requirements"], answer: 1 },
  { id: 144, question: "A student’s Python script to calculate Fibonacci numbers is best classified as:", options: ["A program", "A software model", "Software", "A process model"], answer: 0 },
  { id: 145, question: "A team of 20 developers builds an airline reservation system with 5‑year support. This is an example of:", options: ["A simple program", "A single algorithm", "Software", "An ad‑hoc script"], answer: 2 },
  { id: 146, question: "A program differs from software mainly in that a program:", options: ["Is typically developed by a large team", "Has a narrower scope and shorter lifetime", "Requires formal design phase", "Always has extensive documentation"], answer: 1 },
  { id: 147, question: "The birth of software engineering addressed the software crisis by introducing:", options: ["Systematic methods, tools, and processes", "Ad‑hoc development", "Elimination of documentation", "Individual coding without design"], answer: 0 },
  { id: 148, question: "Create a scope statement for a campus food delivery app. Which is IN scope?", options: ["Building a new sports complex", "Library book checkout", "Student registration, restaurant listing, order placement, payment integration", "Redesigning the university grading system"], answer: 2 },
  { id: 149, question: "A requirement: “The banking app shall allow funds transfer.” This is:", options: ["Functional", "Usability metric", "Non‑functional", "Security requirement"], answer: 0 },
  { id: 150, question: "The four pillars of Object‑Oriented Programming are:", options: ["Analysis, Design, Coding, Testing", "Compilation, Interpretation, Linking, Loading", "Sequence, Selection, Iteration, Recursion", "Encapsulation, Inheritance, Polymorphism, Abstraction"], answer: 3 },
  { id: 151, question: "Software maintenance is defined as:", options: ["The process of modifying software after delivery to correct faults, improve performance, or adapt to environment", "Designing the database", "Writing the user manual", "Only fixing bugs after release"], answer: 0 },
  { id: 152, question: "A student argues that the V‑model is just the Waterfall model drawn differently. Evaluate.", options: ["V‑model is older.", "True, no difference.", "False, V‑model explicitly pairs test phases, changing the emphasis and planning.", "They differ only in diagram shape."], answer: 2 },
  { id: 153, question: "For a safety‑critical system like an autopilot, the V‑model’s advantage is:", options: ["Each development phase has a corresponding test level (e.g., design → integration test)", "It does not need requirements", "It is cheaper than Waterfall", "No testing required"], answer: 0 },
  { id: 154, question: "A student claims: “Ad‑hoc development is faster and better for small projects than systematic engineering.” Justify.", options: ["Always false.", "It can be true for one‑person, throwaway scripts, but for any project needing longevity or team work, systematic is better.", "Systematic is always faster.", "Ad‑hoc always produces better quality."], answer: 1 },
  { id: 155, question: "A library system’s process model decision: “We will deliver a working prototype every two weeks.” Which process model does this indicate?", options: ["Agile (iterative delivery)", "Spiral model", "V‑model", "Waterfall"], answer: 0 },
  { id: 156, question: "A library system’s software model decision: “We define a `Book` class with `title`, `author`, and `isAvailable()` method.” This is part of:", options: ["Feasibility study", "Testing strategy", "Software model (structural/design model)", "Process model"], answer: 2 },
  { id: 157, question: "Create a non‑functional requirement (performance) for a banking app:", options: ["“The app shall support 5000 concurrent users with average response < 2 seconds.”", "“The app shall store data in SQL.”", "“The app shall allow funds transfer.”", "“The app shall have a blue theme.”"], answer: 0 },
  { id: 158, question: "In a banking system, using the same method `calculateInterest()` for SavingsAccount and CurrentAccount is an example of:", options: ["Encapsulation", "Polymorphism", "Abstraction", "Inheritance"], answer: 1 },
  { id: 159, question: "A real‑world analogy for encapsulation is:", options: ["A remote control that works for multiple TV brands", "A car’s steering wheel (interface) hiding the engine details", "A child inheriting eye color from parents", "A blueprint for a house"], answer: 1 },
  { id: 160, question: "A student team of 4 has 400 person‑hours available. They estimate 350 person‑hours. However, they have no experience with real‑time tracking. Evaluate feasibility.", options: ["Likely feasible but with risk; add contingency.", "Not feasible.", "Definitely feasible.", "Feasibility cannot be determined without budget."], answer: 0 },
  { id: 161, question: "Create an analogy estimation for a parking app: A previous parking app took 250 hours. Your new app adds license plate recognition (+80h) and SMS notification (+20h). What is your analogy estimate?", options: ["270h", "350h", "250h", "330h"], answer: 1 },
  { id: 162, question: "The Waterfall model’s structure is:", options: ["Spiral with risk analysis", "Sequential with phases flowing downward", "Random and ad‑hoc", "Iterative and incremental"], answer: 1 },
  { id: 163, question: "A student argues that documentation is a waste of time because only code matters. Evaluate.", options: ["Agree for all projects.", "Disagree, documentation is a core component essential for maintenance and understanding.", "Neutral, depends on project size.", "Agree, code is all that executes."], answer: 1 },
  { id: 164, question: "A project fails because the team started coding without understanding user needs. Which phase was skipped or poorly done?", options: ["Requirements", "Implementation", "Maintenance", "Design"], answer: 0 },
  { id: 165, question: "A project manager says, “We don’t need a feasibility study; we’ll just start coding the campus food delivery app.” Evaluate this approach.", options: ["Always unnecessary.", "Good, coding solves everything.", "Feasibility is only for large companies.", "Risky; feasibility (technical, economic) should be checked to avoid wasted effort."], answer: 3 },
  { id: 166, question: "Create a preventive maintenance task for a library system.", options: ["Refactor the database access layer to reduce future errors", "Add a new book search algorithm", "Update the library OS", "Correct a bug in fine calculation"], answer: 0 },
  { id: 167, question: "Which type of maintenance for WhatsApp changes the app to work with a new Android version?", options: ["Preventive", "Adaptive", "Corrective", "Perfective"], answer: 1 },
  { id: 168, question: "A student team of 4 has 400 person‑hours available. Estimated effort is 350 person‑hours. Is the project economically feasible?", options: ["Cannot determine", "Only if budget allows", "Yes, because available >= estimate", "No, because estimate > available"], answer: 2 },
  { id: 169, question: "A previous library app took 300 hours. Your food delivery app adds payment integration (+60h) and real‑time tracking (+40h). Using analogy estimation, total effort = ?", options: ["340h", "300h", "400h", "360h"], answer: 2 },
  { id: 170, question: "In OOP, the pillar that hides internal details and exposes only necessary interfaces is:", options: ["Abstraction", "Encapsulation", "Inheritance", "Polymorphism"], answer: 1 },
  { id: 171, question: "A student claims: “Object‑Oriented Analysis (OOA) is the same as structured analysis.” Evaluate.", options: ["OOA is a subset.", "False – OOA focuses on objects and classes; structured analysis focuses on functions and data flow.", "They are identical in notation.", "True."], answer: 1 },
  { id: 172, question: "A student claims: “A program is just a smaller version of software.” Is this accurate?", options: ["Yes, but documentation is optional.", "No, software includes documentation, structure, longer lifetime, and team coordination beyond just code.", "Yes, only size differs.", "No, they are completely unrelated."], answer: 1 },
  { id: 173, question: "A student writes a Python script to compute average grades. This is best classified as:", options: ["A program", "Software", "A software model", "A process model"], answer: 0 },
  { id: 174, question: "A student’s script without any design or documentation, directly coding. This is:", options: ["V‑model", "Ad‑hoc development", "Waterfall model", "Systematic engineering"], answer: 1 },
  { id: 175, question: "A manager argues that documentation is a waste of time because only code matters. Evaluate.", options: ["Neutral, depends on project size.", "Agree for all projects.", "Disagree, documentation is a core component essential for maintenance and understanding.", "Agree, code is all that executes."], answer: 2 },
  { id: 176, question: "A team of 20 developers builds an airline reservation system with 5‑year support. This is an example of:", options: ["Software", "A simple program", "An ad‑hoc script", "A single algorithm"], answer: 0 },
  { id: 177, question: "The V‑model is most suitable for:", options: ["Safety‑critical systems that require rigorous testing", "One‑day hackathons", "Small experimental projects with unclear requirements", "Projects where the customer changes mind daily"], answer: 0 },
  { id: 178, question: "Compare ad‑hoc and systematic engineering regarding *testing*. Which statement is true?", options: ["Systematic engineering has defined test phases matching requirements", "Ad‑hoc includes rigorous test plans", "Systematic engineering skips testing", "Ad‑hoc always uses automated testing"], answer: 0 },
];
// ─────────────────────────────────────────────────────────────────────────────
// QUESTION PARSER  — supports the format from the uploaded PDF/TXT
// Handles:
//   1. Question text?\n A) opt\n B) opt\n C) opt\n D) opt\n Answer: B
//   Also handles "Answer: A", "Answer: A)", "Answer: B. text", "Ans: C" etc.
// ─────────────────────────────────────────────────────────────────────────────
function parseQuestions(text) {
  const questions = [];
  // Split on numbered question starts: "1." "1)" "Q1." "Q1)"
  const blocks = text.split(/\n(?=\s*(?:Q\s*)?\d+[.)]\s)/i).map(b => b.trim()).filter(Boolean);

  for (const block of blocks) {
    const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length < 3) continue;

    // Question line — strip leading "1." or "Q1."
    const qLine = lines[0].replace(/^(?:Q\s*)?\d+[.)]\s*/i, "").trim();
    if (!qLine) continue;

    // Collect options (A-D)
    const opts = {};
    const optRegex = /^([A-Da-d])\s*[.)]\s*(.+)/;
    let answerLine = "";

    for (let i = 1; i < lines.length; i++) {
      const m = lines[i].match(optRegex);
      if (m) {
        opts[m[1].toUpperCase()] = m[2].trim();
      } else if (/^ans(?:wer)?\s*:/i.test(lines[i])) {
        answerLine = lines[i];
      }
    }

    const optKeys = ["A", "B", "C", "D"];
    const options = optKeys.map(k => opts[k]).filter(Boolean);
    if (options.length < 2) continue; // need at least 2 options

    // Parse answer
    let answerIdx = 0;
    if (answerLine) {
      const am = answerLine.match(/:\s*([A-Da-d])/);
      if (am) answerIdx = optKeys.indexOf(am[1].toUpperCase());
    }
    if (answerIdx < 0) answerIdx = 0;

    questions.push({ id: questions.length + 1, question: qLine, options, answer: answerIdx });
  }

  return questions;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function prepareQs(qs, count) {
  return shuffle(qs).slice(0, count).map(q => {
    const indexed = q.options.map((text, i) => ({ text, orig: i }));
    const sh = shuffle(indexed);
    return { ...q, opts: sh.map(o => o.text), ans: sh.findIndex(o => o.orig === q.answer) };
  });
}

const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
const LABELS = ["A", "B", "C", "D"];

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function Stepper({ val, setVal, min, max, label }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "10px", color: "#7a9ab5", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: "8px", overflow: "hidden" }}>
        <button onClick={() => setVal(v => Math.max(min, v - 1))} style={{ width: "36px", height: "44px", background: "none", border: "none", color: "#c9a84c", cursor: "pointer", fontSize: "20px", fontWeight: "700" }}>−</button>
        <div style={{ width: "54px", textAlign: "center", fontSize: "22px", fontWeight: "700", color: "#e8e0d0", fontFamily: "'JetBrains Mono',monospace" }}>{String(val).padStart(2, "0")}</div>
        <button onClick={() => setVal(v => Math.min(max, v + 1))} style={{ width: "36px", height: "44px", background: "none", border: "none", color: "#c9a84c", cursor: "pointer", fontSize: "20px", fontWeight: "700" }}>+</button>
      </div>
    </div>
  );
}

function Ring({ elapsed, budget, size = 46 }) {
  const r = size / 2 - 5;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(elapsed / Math.max(budget, 1), 1);
  const color = pct > 0.8 ? "#ff5f5f" : pct > 0.55 ? "#ffb347" : "#4cfa80";
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4.5" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4.5"
        strokeDasharray={`${circ * pct} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s linear, stroke 0.5s" }} />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  // ── navigation ──
  const [screen, setScreen] = useState("setup"); // setup | exam | results
  const [setupTab, setSetupTab] = useState("builtin"); // builtin | upload

  // ── question bank ──
  const [activeBank, setActiveBank] = useState(BUILTIN_QUESTIONS);
  const [courseName, setCourseName] = useState("Software Engineering Fundamentals");
  const [uploadedQs, setUploadedQs] = useState(null);
  const [uploadedName, setUploadedName] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [parsePreview, setParsePreview] = useState(null); // parsed but not confirmed
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef(null);
  const [showBuiltinList, setShowBuiltinList] = useState(false);
  const [expandedBankIds, setExpandedBankIds] = useState(() => new Set());

  // ── shared question banks (Supabase) ──
  const [sharedBanks, setSharedBanks] = useState([]);
  const [sharedLoading, setSharedLoading] = useState(false);
  const [sharedError, setSharedError] = useState("");
  const [shareStatus, setShareStatus] = useState(""); // "" | "sharing" | "shared" | "share-failed"
  const [activeSharedId, setActiveSharedId] = useState(null);

  // ── setup config ──
  const [qCount, setQCount] = useState(20);
  const [timed, setTimed] = useState(true);
  const [mins, setMins] = useState(30);
  const [secs, setSecs] = useState(0);

  // ── exam state ──
  const [questions, setQuestions] = useState([]);
  const [cur, setCur] = useState(0);
  const [sel, setSel] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [answers, setAnswers] = useState([]);

  // ── timers ──
  const [totalLeft, setTotalLeft] = useState(0);
  const [qElapsed, setQElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const tick = useRef(null);

  // ── review ──
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewIdx, setReviewIdx] = useState(0);

  const totalTime = mins * 60 + secs;
  const budget = timed && questions.length > 0 ? Math.max(1, Math.round(totalTime / questions.length)) : 90;
  const bank = activeBank;

  // ── tick ──
  useEffect(() => {
    clearInterval(tick.current);
    if (screen !== "exam" || paused) return;
    tick.current = setInterval(() => {
      setQElapsed(e => e + 1);
      if (timed) setTotalLeft(t => {
        if (t <= 1) { clearInterval(tick.current); setScreen("results"); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(tick.current);
  }, [screen, paused, timed]);

  // ── fetch shared question banks from Supabase ──
  const loadSharedBanks = useCallback(async () => {
    if (!supabase) return;
    setSharedLoading(true);
    setSharedError("");
    const { data, error } = await supabase
      .from("question_banks")
      .select("id, course_name, filename, questions, question_count, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) setSharedError("Could not load shared question banks: " + error.message);
    else setSharedBanks(data || []);
    setSharedLoading(false);
  }, []);

  useEffect(() => { loadSharedBanks(); }, [loadSharedBanks]);

  // ── file reading ──
  // Uses Blob.text()/Blob.arrayBuffer() (Promise-based) instead of FileReader,
  // since FileReader isn't available in some restricted webview environments.
  const readFile = useCallback(async (file) => {
    setUploadError("");
    setParsePreview(null);
    if (!file) return;

    const name = file.name.toLowerCase();
    const isTxt = name.endsWith(".txt") || name.endsWith(".md");
    const isPdf = name.endsWith(".pdf");

    if (!isTxt && !isPdf) {
      setUploadError("Please upload a .txt, .md, or .pdf file.");
      return;
    }

    if (isTxt) {
      try {
        const text = await file.text();
        const parsed = parseQuestions(text);
        if (parsed.length === 0) {
          setUploadError("No questions found. Make sure your file follows the expected format (see guide below).");
        } else {
          setParsePreview({ qs: parsed, filename: file.name });
        }
      } catch {
        setUploadError("Failed to read file. Please try again.");
      }
    } else if (isPdf) {
      // For PDF: read as text (works for text-based PDFs only)
      // We use a simple approach: read as ArrayBuffer and extract text-like content
      try {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        // Extract readable ASCII text from PDF bytes
        let rawText = "";
        for (let i = 0; i < bytes.length; i++) {
          const c = bytes[i];
          if (c >= 32 && c <= 126) rawText += String.fromCharCode(c);
          else if (c === 10 || c === 13) rawText += "\n";
        }
        // PDF text is often fragmented; try to reassemble lines
        const lines = rawText.split("\n").map(l => l.trim()).filter(l => l.length > 2);
        const joined = lines.join("\n");
        const parsed = parseQuestions(joined);
        if (parsed.length === 0) {
          setUploadError("Could not extract questions from this PDF. For best results use a .txt file. If the PDF is text-based, try copying its content into a .txt file.");
        } else {
          setParsePreview({ qs: parsed, filename: file.name });
        }
      } catch {
        setUploadError("Failed to read PDF. Please try a .txt file instead.");
      }
    }
  }, []);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  };

  const confirmUpload = () => {
    if (!parsePreview) return;
    const name = parsePreview.filename.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
    setUploadedQs(parsePreview.qs);
    setUploadedName(parsePreview.filename);
    setActiveBank(parsePreview.qs);
    setActiveSharedId(null);
    setCourseName(name);
    setQCount(Math.min(20, parsePreview.qs.length));

    // Share with everyone else automatically (open access — no login required).
    if (supabase) {
      setShareStatus("sharing");
      supabase
        .from("question_banks")
        .insert({ course_name: name, filename: parsePreview.filename, questions: parsePreview.qs })
        .then(({ error }) => {
          setShareStatus(error ? "share-failed" : "shared");
          if (!error) loadSharedBanks();
        });
    }

    setParsePreview(null);
    setSetupTab("config");
  };

  const clearUpload = () => {
    setUploadedQs(null);
    setUploadedName("");
    setActiveBank(BUILTIN_QUESTIONS);
    setActiveSharedId(null);
    setCourseName("Software Engineering Fundamentals");
    setParsePreview(null);
    setUploadError("");
    setShareStatus("");
  };

  const loadSharedBank = (b) => {
    setUploadedQs(b.questions);
    setUploadedName(b.filename || b.course_name);
    setActiveBank(b.questions);
    setActiveSharedId(b.id);
    setCourseName(b.course_name);
    setQCount(Math.min(20, b.questions.length));
    setShareStatus("");
    setSetupTab("config");
  };

  const toggleBankExpanded = (id) => {
    setExpandedBankIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Every uploaded exam/course available to browse: the shared list from
  // Supabase when configured, or just the locally-loaded one otherwise.
  const allUploadedBanks = supabase
    ? sharedBanks
    : (uploadedQs ? [{ id: "local", course_name: courseName, filename: uploadedName, questions: uploadedQs, question_count: uploadedQs.length, created_at: null }] : []);

  // ── start exam ──
  const startExam = () => {
    setQuestions(prepareQs(bank, Math.min(qCount, bank.length)));
    setAnswers([]); setCur(0); setSel(null); setConfirmed(false);
    setQElapsed(0); setTotalLeft(totalTime); setPaused(false);
    setScreen("exam");
  };

  // ── exam actions ──
  const recordAnswer = (chosen) => {
    const na = [...answers, { qIdx: cur, chosen, timeTaken: qElapsed }];
    setAnswers(na);
    return na;
  };
  const advance = (na) => {
    if (cur + 1 >= questions.length) setScreen("results");
    else { setCur(c => c + 1); setSel(null); setConfirmed(false); setQElapsed(0); }
  };
  const confirmAnswer = () => { if (sel === null) return; recordAnswer(sel); setConfirmed(true); };
  const skipQ = () => { const na = recordAnswer(-1); advance(na); };
  const nextQ = () => advance();

  // ── derived ──
  const q = questions[cur];
  const scored = answers.filter(a => a.chosen === questions[a.qIdx]?.ans).length;
  const avgTime = answers.length ? Math.round(answers.reduce((s, a) => s + a.timeTaken, 0) / answers.length) : 0;

  // ── STYLE TOKENS ──
  const G = "#c9a84c", GRN = "#4cfa80", RED = "#ff5f5f", MUT = "#7a9ab5", BG = "#0a0f1e";
  const appStyle = { minHeight: "100vh", background: `linear-gradient(150deg,${BG} 0%,#0d1b2e 55%,#0b1624 100%)`, fontFamily: "'Lora',Georgia,serif", color: "#e8e0d0", display: "flex", flexDirection: "column", alignItems: "center", padding: "18px 14px 48px" };
  const cardStyle = { background: "rgba(255,255,255,0.032)", border: "1px solid rgba(201,168,76,0.18)", borderRadius: "14px", padding: "26px", maxWidth: "700px", width: "100%", backdropFilter: "blur(12px)" };
  const B = (v) => ({ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "10px 22px", borderRadius: "7px", border: "none", cursor: "pointer", fontSize: "14px", fontFamily: "'Lora',Georgia,serif", fontWeight: "600", letterSpacing: "0.04em", transition: "all 0.17s", ...(v === "gold" ? { background: `linear-gradient(135deg,${G},#a07828)`, color: BG } : v === "ghost" ? { background: "transparent", color: MUT, border: "1px solid rgba(122,154,181,0.28)" } : v === "outline" ? { background: "rgba(201,168,76,0.06)", color: G, border: `1px solid rgba(201,168,76,0.28)` } : v === "danger" ? { background: "rgba(255,80,80,0.08)", color: RED, border: `1px solid rgba(255,80,80,0.28)` } : { background: "rgba(255,255,255,0.05)", color: "#ccc", border: "1px solid rgba(255,255,255,0.1)" }) });

  // ══════════════════════════════════════════════════════════════════════
  // SETUP SCREEN
  // ══════════════════════════════════════════════════════════════════════
  if (screen === "setup") {
    const tabs = [
      { id: "builtin", label: "📚 Built-in Questions" },
      { id: "upload", label: "📂 Upload Questions" },
      { id: "config", label: "⚙️ Configure & Start" },
    ];

    return (
      <div style={appStyle}>
        <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
        <div style={{ textAlign: "center", margin: "10px 0 24px" }}>
          <div style={{ fontSize: "clamp(18px,3.8vw,34px)", fontWeight: "700", color: G, letterSpacing: "0.06em", textTransform: "uppercase" }}>CBT Exam Practice</div>
          <div style={{ fontSize: "13px", color: MUT, marginTop: "5px" }}>{courseName}</div>
        </div>

        <div style={{ ...cardStyle, marginBottom: "14px" }}>
          {/* Tab bar */}
          <div style={{ display: "flex", gap: "4px", marginBottom: "24px", background: "rgba(0,0,0,0.2)", borderRadius: "9px", padding: "4px" }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setSetupTab(t.id)} style={{ flex: 1, padding: "9px 6px", borderRadius: "6px", border: "none", cursor: "pointer", fontFamily: "'Lora',Georgia,serif", fontSize: "12px", fontWeight: "600", transition: "all 0.18s", background: setupTab === t.id ? "rgba(201,168,76,0.15)" : "transparent", color: setupTab === t.id ? G : MUT, borderBottom: setupTab === t.id ? `2px solid ${G}` : "2px solid transparent" }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── TAB: BUILT-IN ── */}
          {setupTab === "builtin" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.18)", borderRadius: "10px", padding: "16px 18px", marginBottom: "12px" }}>
                <div style={{ fontSize: "36px" }}>📘</div>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "15px", color: G }}>Software Engineering Fundamentals</div>
                  <div style={{ fontSize: "13px", color: MUT, marginTop: "3px" }}>{BUILTIN_QUESTIONS.length} questions</div>
                </div>
                <button onClick={() => { clearUpload(); setSetupTab("config"); }} style={{ ...B("gold"), marginLeft: "auto", whiteSpace: "nowrap" }}>Use This →</button>
              </div>
              <div style={{ fontSize: "13px", color: "#8aabbf", lineHeight: "1.7", marginBottom: "14px" }}>
                This is the built-in question bank covering software process models (Waterfall, V-model, Agile), requirements engineering, feasibility studies, effort estimation, UML/software modeling, OOP principles, and software maintenance.
              </div>

              <button onClick={() => setShowBuiltinList(s => !s)} style={{ ...B("ghost"), width: "100%", justifyContent: "space-between", marginBottom: showBuiltinList ? "10px" : "0" }}>
                <span>📋 {showBuiltinList ? "Hide" : "View"} all {BUILTIN_QUESTIONS.length} questions</span>
                <span>{showBuiltinList ? "▲" : "▼"}</span>
              </button>
              {showBuiltinList && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "340px", overflowY: "auto", marginBottom: "18px", paddingRight: "4px" }}>
                  {BUILTIN_QUESTIONS.map((q, i) => (
                    <div key={i} style={{ background: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "10px 12px", fontSize: "13px" }}>
                      <div style={{ color: "#ccd", marginBottom: "4px" }}><strong style={{ color: G }}>Q{i + 1}.</strong> {q.question}</div>
                      <div style={{ color: MUT }}>{q.options.map((o, j) => `${LABELS[j]}) ${o}`).join(" · ")}</div>
                      <div style={{ color: GRN, marginTop: "3px", fontSize: "11px" }}>Answer: {LABELS[q.answer]}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* All uploaded exams / courses, listed alongside the built-in one */}
              <div style={{ marginTop: "18px" }}>
                <div style={{ fontSize: "11px", color: MUT, letterSpacing: "0.13em", textTransform: "uppercase", marginBottom: "10px" }}>
                  📂 Uploaded Exams / Courses {!supabase && "(this browser only)"}
                </div>
                {allUploadedBanks.length === 0 && (
                  <div style={{ fontSize: "12px", color: MUT }}>No exams uploaded yet — upload one in the "Upload Questions" tab.</div>
                )}
                {allUploadedBanks.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {allUploadedBanks.map(b => {
                      const expanded = expandedBankIds.has(b.id);
                      return (
                        <div key={b.id} style={{ background: "rgba(76,250,128,0.05)", border: `1px solid ${activeSharedId === b.id ? "rgba(76,250,128,0.35)" : "rgba(76,250,128,0.15)"}`, borderRadius: "10px", padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ fontSize: "22px" }}>📂</div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: "600", fontSize: "14px", color: "#e8e0d0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.course_name}</div>
                              <div style={{ fontSize: "11px", color: MUT }}>
                                {b.question_count ?? b.questions.length} questions{b.created_at ? ` · ${new Date(b.created_at).toLocaleDateString()}` : ""}
                              </div>
                            </div>
                            <button onClick={() => toggleBankExpanded(b.id)} style={{ ...B("ghost"), marginLeft: "auto", padding: "6px 10px", fontSize: "12px" }}>
                              {expanded ? "▲ Hide" : "▼ View"}
                            </button>
                            <button onClick={() => loadSharedBank(b)} style={{ ...B(activeSharedId === b.id ? "outline" : "gold"), padding: "6px 14px", fontSize: "12px", whiteSpace: "nowrap" }}>
                              {activeSharedId === b.id ? "✓ Loaded" : "Use →"}
                            </button>
                          </div>
                          {expanded && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "340px", overflowY: "auto", marginTop: "12px", paddingRight: "4px" }}>
                              {b.questions.map((q, i) => (
                                <div key={i} style={{ background: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "10px 12px", fontSize: "13px" }}>
                                  <div style={{ color: "#ccd", marginBottom: "4px" }}><strong style={{ color: G }}>Q{i + 1}.</strong> {q.question}</div>
                                  <div style={{ color: MUT }}>{q.options.map((o, j) => `${LABELS[j]}) ${o}`).join(" · ")}</div>
                                  <div style={{ color: GRN, marginTop: "3px", fontSize: "11px" }}>Answer: {LABELS[q.answer]}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB: UPLOAD ── */}
          {setupTab === "upload" && (
            <div>
              {/* Shared question banks from other users */}
              {supabase ? (
                <div style={{ marginBottom: "18px" }}>
                  <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                    <div style={{ fontSize: "11px", color: MUT, letterSpacing: "0.13em", textTransform: "uppercase" }}>🌐 Shared By Other Users</div>
                    <button onClick={loadSharedBanks} style={{ ...B("ghost"), marginLeft: "auto", padding: "4px 10px", fontSize: "11px" }} disabled={sharedLoading}>
                      {sharedLoading ? "Loading…" : "↻ Refresh"}
                    </button>
                  </div>
                  {sharedError && <div style={{ fontSize: "12px", color: RED, marginBottom: "8px" }}>⚠ {sharedError}</div>}
                  {!sharedError && sharedBanks.length === 0 && !sharedLoading && (
                    <div style={{ fontSize: "12px", color: MUT }}>No shared banks yet — be the first to upload one below.</div>
                  )}
                  {sharedBanks.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "220px", overflowY: "auto" }}>
                      {sharedBanks.map(b => (
                        <div key={b.id} style={{ display: "flex", alignItems: "center", gap: "12px", background: activeSharedId === b.id ? "rgba(76,250,128,0.06)" : "rgba(255,255,255,0.03)", border: `1px solid ${activeSharedId === b.id ? "rgba(76,250,128,0.25)" : "rgba(255,255,255,0.08)"}`, borderRadius: "9px", padding: "10px 14px" }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: "600", fontSize: "13px", color: "#e8e0d0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.course_name}</div>
                            <div style={{ fontSize: "11px", color: MUT }}>{b.question_count ?? b.questions.length} questions · {new Date(b.created_at).toLocaleDateString()}</div>
                          </div>
                          <button onClick={() => loadSharedBank(b)} style={{ ...B(activeSharedId === b.id ? "outline" : "gold"), marginLeft: "auto", padding: "6px 14px", fontSize: "12px", whiteSpace: "nowrap" }}>
                            {activeSharedId === b.id ? "✓ Loaded" : "Use →"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: "12px", color: MUT, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "9px", padding: "12px 14px", marginBottom: "18px" }}>
                  🌐 Shared question banks are disabled — no Supabase connection configured (set <code>REACT_APP_SUPABASE_URL</code> / <code>REACT_APP_SUPABASE_ANON_KEY</code>). Uploads below stay local to this browser only.
                </div>
              )}

              {/* Drop zone */}
              {!parsePreview && (
                <div
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileRef.current?.click()}
                  style={{ border: `2px dashed ${isDragging ? G : "rgba(122,154,181,0.35)"}`, borderRadius: "12px", padding: "36px 20px", textAlign: "center", cursor: "pointer", transition: "all 0.2s", background: isDragging ? "rgba(201,168,76,0.06)" : "rgba(255,255,255,0.02)", marginBottom: "18px" }}
                >
                  <div style={{ fontSize: "40px", marginBottom: "10px" }}>📄</div>
                  <div style={{ fontSize: "16px", fontWeight: "600", color: G, marginBottom: "6px" }}>Drop your question file here</div>
                  <div style={{ fontSize: "13px", color: MUT }}>or click to browse</div>
                  <div style={{ fontSize: "12px", color: "#5a7a90", marginTop: "8px" }}>Supports .txt and .md files (recommended) · .pdf (text-based)</div>
                  <input ref={fileRef} type="file" accept=".txt,.md,.pdf" style={{ display: "none" }} onChange={e => { if (e.target.files[0]) readFile(e.target.files[0]); }} />
                </div>
              )}

              {/* Already have an uploaded bank */}
              {uploadedQs && !parsePreview && (
                <div style={{ background: "rgba(76,250,128,0.06)", border: "1px solid rgba(76,250,128,0.2)", borderRadius: "10px", padding: "14px 16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "20px" }}>✓</span>
                  <div>
                    <div style={{ fontWeight: "600", color: GRN, fontSize: "14px" }}>{uploadedName}</div>
                    <div style={{ fontSize: "12px", color: MUT }}>{uploadedQs.length} questions loaded</div>
                  </div>
                  <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
                    <button onClick={() => setSetupTab("config")} style={{ ...B("gold"), padding: "7px 14px", fontSize: "12px" }}>Configure →</button>
                    <button onClick={clearUpload} style={{ ...B("danger"), padding: "7px 14px", fontSize: "12px" }}>✕ Remove</button>
                  </div>
                </div>
              )}

              {/* Share status */}
              {shareStatus === "sharing" && <div style={{ fontSize: "12px", color: MUT, marginBottom: "16px" }}>🌐 Sharing with other users…</div>}
              {shareStatus === "shared" && <div style={{ fontSize: "12px", color: GRN, marginBottom: "16px" }}>🌐 Shared — other users will now see this bank too.</div>}
              {shareStatus === "share-failed" && <div style={{ fontSize: "12px", color: RED, marginBottom: "16px" }}>⚠ Could not share this bank with others (it's still usable locally).</div>}

              {/* Parse preview */}
              {parsePreview && (
                <div style={{ marginBottom: "18px" }}>
                  <div style={{ background: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: "10px", padding: "16px 18px", marginBottom: "14px" }}>
                    <div style={{ fontWeight: "700", color: G, marginBottom: "6px" }}>✓ Parsed successfully: {parsePreview.filename}</div>
                    <div style={{ fontSize: "13px", color: MUT, marginBottom: "12px" }}>{parsePreview.qs.length} questions found</div>
                    {/* Show first 3 as preview */}
                    {parsePreview.qs.slice(0, 3).map((pq, i) => (
                      <div key={i} style={{ background: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "10px 12px", marginBottom: "8px", fontSize: "13px" }}>
                        <div style={{ color: "#ccd", marginBottom: "4px" }}><strong style={{ color: G }}>Q{i + 1}.</strong> {pq.question}</div>
                        <div style={{ color: MUT }}>{pq.options.map((o, j) => `${LABELS[j]}) ${o}`).join(" · ")}</div>
                        <div style={{ color: GRN, marginTop: "3px", fontSize: "11px" }}>Answer: {LABELS[pq.answer]}</div>
                      </div>
                    ))}
                    {parsePreview.qs.length > 3 && <div style={{ fontSize: "12px", color: MUT }}>…and {parsePreview.qs.length - 3} more</div>}
                  </div>
                  <div style={{ display: "flex", gap: "9px" }}>
                    <button onClick={confirmUpload} style={{ ...B("gold"), flex: 1 }}>✓ Use These Questions →</button>
                    <button onClick={() => { setParsePreview(null); setUploadError(""); }} style={B("ghost")}>Try Again</button>
                  </div>
                </div>
              )}

              {/* Error */}
              {uploadError && (
                <div style={{ background: "rgba(255,80,80,0.07)", border: "1px solid rgba(255,80,80,0.25)", borderRadius: "9px", padding: "12px 16px", marginBottom: "16px", fontSize: "13px", color: RED }}>
                  ⚠ {uploadError}
                </div>
              )}

              {/* Format guide */}
              <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(201,168,76,0.3)" }}>

                {/* Header */}
                <div style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.07))", padding: "16px 20px", borderBottom: "1px solid rgba(201,168,76,0.2)" }}>
                  <div style={{ fontSize: "17px", fontWeight: "700", color: G, letterSpacing: "0.02em" }}>📋 How to Format Your Question File</div>
                  <div style={{ fontSize: "13px", color: "#9ab5c8", marginTop: "5px", fontWeight: "400" }}>Follow this structure — one block per question, separated by a blank line</div>
                </div>

                {/* 5 rules */}
                <div style={{ background: "rgba(0,0,0,0.32)", padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {[
                      { icon: "1️⃣", rule: "Number each question", detail: 'Start with a number and a period or bracket — e.g. "1." or "1)"' },
                      { icon: "🔤", rule: "Label options A through D", detail: 'Use "A)" or "A." before each option. You need at least 2 options per question.' },
                      { icon: "✅", rule: 'End every question with "Answer: X"', detail: 'Write the correct letter only — e.g.  Answer: B — on its own line, right after the options.' },
                      { icon: "↵", rule: "Separate questions with a blank line", detail: "Leave one empty line between every question block. This is what the parser uses to split questions." },
                      { icon: "💾", rule: "Save as .txt or .md (recommended)", detail: "Plain text gives the most reliable results. PDF works only if the text inside is selectable/copyable." },
                    ].map((r, i) => (
                      <div key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                        <span style={{ fontSize: "20px", flexShrink: 0, lineHeight: 1.3 }}>{r.icon}</span>
                        <div>
                          <div style={{ fontSize: "15px", fontWeight: "700", color: "#e8e0d0", letterSpacing: "0.01em" }}>{r.rule}</div>
                          <div style={{ fontSize: "12px", color: "#7a9ab5", marginTop: "3px", lineHeight: "1.6" }}>{r.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live example */}
                <div style={{ background: "rgba(0,0,0,0.45)", padding: "18px 20px" }}>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: G, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "14px" }}>✦ Example</div>
                  <div style={{ background: "#060c18", borderRadius: "9px", padding: "18px 20px", border: "1px solid rgba(255,255,255,0.07)", fontFamily: "'JetBrains Mono',monospace", fontSize: "13px", lineHeight: "2" }}>
                    <div><span style={{ color: "#f0c94e", fontWeight: "700" }}>1. What is photosynthesis?</span></div>
                    <div><span style={{ color: "#b8d4f0" }}>A) A type of rock formation</span></div>
                    <div><span style={{ color: "#b8d4f0" }}>B) The process plants use to make food from sunlight</span></div>
                    <div><span style={{ color: "#b8d4f0" }}>C) A chemical reaction in animals</span></div>
                    <div><span style={{ color: "#b8d4f0" }}>D) A form of cellular respiration</span></div>
                    <div><span style={{ color: "#4cfa80", fontWeight: "700" }}>Answer: B</span></div>
                    <div style={{ height: "12px" }} />
                    <div><span style={{ color: "#f0c94e", fontWeight: "700" }}>2. Which planet is closest to the Sun?</span></div>
                    <div><span style={{ color: "#b8d4f0" }}>A) Venus</span></div>
                    <div><span style={{ color: "#b8d4f0" }}>B) Earth</span></div>
                    <div><span style={{ color: "#b8d4f0" }}>C) Mercury</span></div>
                    <div><span style={{ color: "#b8d4f0" }}>D) Mars</span></div>
                    <div><span style={{ color: "#4cfa80", fontWeight: "700" }}>Answer: C</span></div>
                  </div>

                  {/* Colour legend */}
                  <div style={{ display: "flex", gap: "18px", marginTop: "14px", flexWrap: "wrap" }}>
                    {[
                      { color: "#f0c94e", label: "Question line" },
                      { color: "#b8d4f0", label: "Answer options" },
                      { color: "#4cfa80", label: "Correct answer indicator" },
                    ].map(l => (
                      <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                        <div style={{ width: "13px", height: "13px", borderRadius: "3px", background: l.color, flexShrink: 0 }} />
                        <span style={{ fontSize: "12px", color: "#8aabbf", fontWeight: "600" }}>{l.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ── TAB: CONFIG ── */}
          {setupTab === "config" && (
            <div>
              {/* Active bank indicator */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", background: uploadedQs ? "rgba(76,250,128,0.06)" : "rgba(201,168,76,0.06)", border: `1px solid ${uploadedQs ? "rgba(76,250,128,0.2)" : "rgba(201,168,76,0.18)"}`, borderRadius: "9px", padding: "12px 16px", marginBottom: "22px" }}>
                <span style={{ fontSize: "18px" }}>{uploadedQs ? "📂" : "📘"}</span>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: uploadedQs ? GRN : G }}>{uploadedQs ? uploadedName : "Built-in Bank"}</div>
                  <div style={{ fontSize: "12px", color: MUT }}>{bank.length} questions available</div>
                </div>
                <button onClick={() => setSetupTab(uploadedQs ? "upload" : "builtin")} style={{ ...B("ghost"), marginLeft: "auto", padding: "6px 12px", fontSize: "12px" }}>Change</button>
              </div>

              {/* Q count */}
              <div style={{ marginBottom: "22px" }}>
                <div style={{ fontSize: "11px", color: MUT, letterSpacing: "0.13em", textTransform: "uppercase", marginBottom: "11px" }}>Number of Questions</div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {[10, 20, 50, bank.length].filter((v, i, arr) => arr.indexOf(v) === i && v <= bank.length).map(n => (
                    <button key={n} onClick={() => setQCount(n)} style={{ flex: 1, minWidth: "52px", padding: "11px 4px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "15px", fontFamily: "'Lora',Georgia,serif", fontWeight: "700", transition: "all 0.17s", background: qCount === n ? `linear-gradient(135deg,${G},#a07828)` : "rgba(255,255,255,0.05)", color: qCount === n ? BG : "#ccc", boxShadow: qCount === n ? `0 3px 14px rgba(201,168,76,0.28)` : "none" }}>
                      {n === bank.length ? `All (${n})` : n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timer */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "11px", color: MUT, letterSpacing: "0.13em", textTransform: "uppercase", marginBottom: "11px" }}>Timer Mode</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {[{ l: "⏱  Timed", v: true }, { l: "∞  Untimed", v: false }].map(o => (
                    <button key={String(o.v)} onClick={() => setTimed(o.v)} style={{ padding: "13px", borderRadius: "8px", cursor: "pointer", fontFamily: "'Lora',Georgia,serif", fontSize: "14px", fontWeight: "600", border: timed === o.v ? `1px solid ${G}` : "1px solid rgba(255,255,255,0.08)", background: timed === o.v ? "rgba(201,168,76,0.1)" : "rgba(255,255,255,0.03)", color: timed === o.v ? G : MUT, transition: "all 0.17s" }}>{o.l}</button>
                  ))}
                </div>
              </div>

              {timed && (
                <div style={{ background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: "10px", padding: "18px 20px", marginBottom: "18px" }}>
                  <div style={{ fontSize: "11px", color: MUT, letterSpacing: "0.13em", textTransform: "uppercase", marginBottom: "16px", textAlign: "center" }}>Set Total Time</div>
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: "14px" }}>
                    <Stepper val={mins} setVal={setMins} min={1} max={999} label="Minutes" />
                    <div style={{ fontSize: "28px", fontWeight: "700", color: G, paddingBottom: "10px" }}>:</div>
                    <Stepper val={secs} setVal={setSecs} min={0} max={59} label="Seconds" />
                  </div>
                  <div style={{ textAlign: "center", marginTop: "12px", fontSize: "13px", color: "#8aabbf" }}>
                    Total: <strong style={{ color: G }}>{fmt(totalTime)}</strong>
                    {qCount > 0 && <span style={{ marginLeft: "12px" }}>≈ <strong style={{ color: G }}>{fmt(Math.round(totalTime / qCount))}</strong> per question</span>}
                  </div>
                  <div style={{ display: "flex", gap: "7px", flexWrap: "wrap", justifyContent: "center", marginTop: "12px" }}>
                    {[{ l: "15m", m: 15, s: 0 }, { l: "30m", m: 30, s: 0 }, { l: "45m", m: 45, s: 0 }, { l: "1h", m: 60, s: 0 }, { l: "1.5h", m: 90, s: 0 }, { l: "2h", m: 120, s: 0 }].map(p => (
                      <button key={p.l} onClick={() => { setMins(p.m); setSecs(p.s); }} style={{ padding: "5px 12px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: MUT, cursor: "pointer", fontSize: "12px", fontFamily: "'Lora',Georgia,serif" }}>{p.l}</button>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={startExam} style={{ ...B("gold"), width: "100%", padding: "14px", fontSize: "16px" }}>
                Begin Examination →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // EXAM SCREEN
  // ══════════════════════════════════════════════════════════════════════
  if (screen === "exam" && q) {
    const isOk = confirmed && sel === q.ans;
    const prog = (cur / questions.length) * 100;
    const tWarn = timed && totalLeft < 60;
    const tAlert = timed && totalLeft < 20;
    const qColor = qElapsed > budget * 0.8 ? RED : qElapsed > budget * 0.55 ? "#ffb347" : GRN;

    return (
      <div style={appStyle}>
        <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />

        {paused && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(8,12,24,0.93)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(10px)" }}>
            <div style={{ fontSize: "64px", marginBottom: "10px" }}>⏸</div>
            <div style={{ fontSize: "30px", fontWeight: "700", color: G, marginBottom: "6px" }}>Exam Paused</div>
            <div style={{ color: MUT, marginBottom: "30px", fontSize: "14px" }}>Timer is frozen</div>
            <button onClick={() => setPaused(false)} style={{ ...B("gold"), padding: "14px 44px", fontSize: "18px" }}>▶ Resume</button>
          </div>
        )}

        <div style={{ width: "100%", maxWidth: "700px", display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
          <span style={{ fontSize: "12px", color: MUT, whiteSpace: "nowrap" }}>Q <strong style={{ color: G, fontSize: "15px" }}>{cur + 1}</strong>/{questions.length}</span>
          <div style={{ flex: 1, height: "5px", background: "rgba(255,255,255,0.07)", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${prog}%`, background: `linear-gradient(90deg,${G},#f0c94e)`, borderRadius: "3px", transition: "width 0.3s" }} />
          </div>
          <span style={{ fontSize: "12px", color: MUT, whiteSpace: "nowrap" }}>✓ <strong style={{ color: GRN }}>{scored}</strong>/{answers.length}</span>
          <button onClick={() => setPaused(true)} style={{ ...B("outline"), padding: "7px 13px", fontSize: "12px", whiteSpace: "nowrap" }}>⏸ Pause</button>
        </div>

        <div style={{ width: "100%", maxWidth: "700px", display: "flex", gap: "10px", marginBottom: "14px" }}>
          {timed && (
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.035)", border: `1px solid ${tAlert ? "rgba(255,80,80,0.4)" : tWarn ? "rgba(255,180,60,0.3)" : "rgba(255,255,255,0.09)"}`, borderRadius: "10px", padding: "10px 14px", transition: "border 0.4s" }}>
              <div>
                <div style={{ fontSize: "10px", color: MUT, letterSpacing: "0.1em", textTransform: "uppercase" }}>Total Left</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "24px", fontWeight: "700", color: tAlert ? RED : tWarn ? "#ffb347" : "#e8e0d0", letterSpacing: "0.06em", lineHeight: 1.1, transition: "color 0.4s" }}>{fmt(totalLeft)}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ height: "5px", background: "rgba(255,255,255,0.07)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${((totalTime - totalLeft) / Math.max(totalTime, 1)) * 100}%`, background: tAlert ? RED : tWarn ? "#ffb347" : G, borderRadius: "3px", transition: "width 1s linear, background 0.4s" }} />
                </div>
                <div style={{ fontSize: "10px", color: MUT, marginTop: "4px" }}>{Math.round(((totalTime - totalLeft) / Math.max(totalTime, 1)) * 100)}% used</div>
              </div>
            </div>
          )}
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "10px", padding: "10px 14px" }}>
            <div style={{ position: "relative", width: "46px", height: "46px", flexShrink: 0 }}>
              <Ring elapsed={qElapsed} budget={budget} size={46} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700", color: qColor, fontFamily: "'JetBrains Mono',monospace" }}>
                {qElapsed > 99 ? "99+" : qElapsed}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "10px", color: MUT, letterSpacing: "0.1em", textTransform: "uppercase" }}>This Question</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "22px", fontWeight: "700", color: qColor, lineHeight: 1.1, transition: "color 0.4s" }}>{fmt(qElapsed)}</div>
            </div>
            {answers.length > 0 && (
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <div style={{ fontSize: "10px", color: MUT, textTransform: "uppercase" }}>Avg/Q</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "16px", color: MUT }}>{fmt(avgTime)}</div>
              </div>
            )}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: "10px", color: G, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "9px" }}>Question {cur + 1}</div>
          <div style={{ fontSize: "18px", lineHeight: "1.6", color: "#e8e0d0", marginBottom: "24px", fontWeight: "600" }}>{q.question}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "20px" }}>
            {q.opts.map((opt, i) => {
              let bg = "rgba(255,255,255,0.04)", border = "1px solid rgba(255,255,255,0.09)", color = "#bcc8d8", lbg = "rgba(255,255,255,0.08)", lc = "#777";
              if (!confirmed && sel === i) { bg = "rgba(201,168,76,0.1)"; border = `1px solid ${G}`; color = G; lbg = G; lc = BG; }
              if (confirmed && i === q.ans) { bg = "rgba(76,250,128,0.07)"; border = "1px solid #3dcb68"; color = GRN; lbg = "#3dcb68"; lc = BG; }
              if (confirmed && sel === i && i !== q.ans) { bg = "rgba(255,80,80,0.07)"; border = `1px solid ${RED}`; color = RED; lbg = RED; lc = BG; }
              return (
                <button key={i} onClick={() => !confirmed && setSel(i)} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px 14px", borderRadius: "9px", background: bg, border, color, cursor: confirmed ? "default" : "pointer", textAlign: "left", fontFamily: "'Lora',Georgia,serif", fontSize: "15px", lineHeight: "1.5", transition: "all 0.16s", width: "100%" }}>
                  <span style={{ flexShrink: 0, width: "25px", height: "25px", borderRadius: "50%", background: lbg, color: lc, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", transition: "all 0.16s" }}>{LABELS[i]}</span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
          {confirmed && (
            <div style={{ padding: "12px 16px", borderRadius: "8px", marginBottom: "14px", background: isOk ? "rgba(76,250,128,0.07)" : "rgba(255,80,80,0.07)", border: `1px solid ${isOk ? "rgba(76,250,128,0.3)" : "rgba(255,80,80,0.3)"}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
              <span style={{ fontSize: "15px", fontWeight: "700", color: isOk ? GRN : RED }}>{isOk ? "✓ Correct!" : `✗ Wrong — Correct: ${LABELS[q.ans]}`}</span>
              <span style={{ fontSize: "12px", color: MUT, fontFamily: "'JetBrains Mono',monospace" }}>⏱ {fmt(qElapsed)}</span>
            </div>
          )}
          <div style={{ display: "flex", gap: "9px" }}>
            {!confirmed ? (
              <>
                <button onClick={confirmAnswer} disabled={sel === null} style={{ ...B("gold"), flex: 1, opacity: sel === null ? 0.35 : 1, cursor: sel === null ? "not-allowed" : "pointer", padding: "12px" }}>Confirm Answer</button>
                <button onClick={skipQ} style={{ ...B("ghost"), padding: "12px 18px" }}>Skip →</button>
              </>
            ) : (
              <button onClick={nextQ} style={{ ...B("gold"), flex: 1, padding: "12px" }}>{cur + 1 >= questions.length ? "View Results →" : "Next Question →"}</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // RESULTS SCREEN
  // ══════════════════════════════════════════════════════════════════════
  if (screen === "results") {
    const correct = answers.filter(a => a.chosen === questions[a.qIdx]?.ans).length;
    const wrong = answers.filter(a => a.chosen !== questions[a.qIdx]?.ans && a.chosen !== -1).length;
    const skipped = answers.filter(a => a.chosen === -1).length;
    const pct = Math.round((correct / questions.length) * 100);
    const pass = pct >= 70;
    const totalUsed = answers.reduce((s, a) => s + a.timeTaken, 0);
    const avg = answers.length ? Math.round(totalUsed / answers.length) : 0;
    const slowest = answers.reduce((m, a) => a.timeTaken > m.t ? { t: a.timeTaken, i: a.qIdx } : m, { t: 0, i: 0 });
    const fastest = answers.filter(a => a.chosen !== -1).reduce((m, a) => a.timeTaken < m.t ? { t: a.timeTaken, i: a.qIdx } : m, { t: Infinity, i: 0 });

    if (reviewMode) {
      const rq = questions[reviewIdx];
      const ra = answers[reviewIdx];
      const ok = ra?.chosen === rq?.ans;
      const sk = ra?.chosen === -1;
      return (
        <div style={appStyle}>
          <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
          <div style={{ width: "100%", maxWidth: "700px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <button onClick={() => setReviewMode(false)} style={B("ghost")}>← Results</button>
            <span style={{ color: MUT, fontSize: "12px", fontFamily: "'JetBrains Mono',monospace" }}>{reviewIdx + 1} / {questions.length}</span>
            <div style={{ display: "flex", gap: "7px" }}>
              <button onClick={() => setReviewIdx(i => Math.max(0, i - 1))} disabled={reviewIdx === 0} style={{ ...B("ghost"), padding: "7px 16px", opacity: reviewIdx === 0 ? 0.3 : 1 }}>‹</button>
              <button onClick={() => setReviewIdx(i => Math.min(questions.length - 1, i + 1))} disabled={reviewIdx === questions.length - 1} style={{ ...B("ghost"), padding: "7px 16px", opacity: reviewIdx === questions.length - 1 ? 0.3 : 1 }}>›</button>
            </div>
          </div>
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "12px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "11px", color: MUT, textTransform: "uppercase", letterSpacing: "0.1em" }}>Q{reviewIdx + 1}</span>
              <span style={{ fontSize: "12px", padding: "2px 10px", borderRadius: "20px", fontWeight: "700", background: sk ? "rgba(180,180,60,0.1)" : ok ? "rgba(76,250,128,0.1)" : "rgba(255,80,80,0.1)", color: sk ? "#ddd040" : ok ? GRN : RED }}>
                {sk ? "SKIPPED" : ok ? "✓ CORRECT" : "✗ INCORRECT"}
              </span>
              {!sk && <span style={{ marginLeft: "auto", fontSize: "12px", color: MUT, fontFamily: "'JetBrains Mono',monospace" }}>⏱ {fmt(ra?.timeTaken || 0)}</span>}
            </div>
            <div style={{ fontSize: "17px", lineHeight: "1.6", fontWeight: "600", marginBottom: "20px" }}>{rq?.question}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {rq?.opts.map((opt, i) => {
                const isAns = i === rq.ans, wasCh = i === ra?.chosen;
                let bg = "rgba(255,255,255,0.03)", border = "1px solid rgba(255,255,255,0.07)", color = "#7a8ea0";
                if (isAns) { bg = "rgba(76,250,128,0.07)"; border = "1px solid #3dcb68"; color = GRN; }
                if (wasCh && !isAns) { bg = "rgba(255,80,80,0.07)"; border = `1px solid ${RED}`; color = RED; }
                return (
                  <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "11px 14px", borderRadius: "8px", background: bg, border, color, fontSize: "15px", lineHeight: "1.45" }}>
                    <span style={{ fontWeight: "700", minWidth: "18px" }}>{LABELS[i]}.</span>
                    <span style={{ flex: 1 }}>{opt}</span>
                    {isAns && <span style={{ fontSize: "11px", color: GRN, whiteSpace: "nowrap" }}>✓ Correct</span>}
                    {wasCh && !isAns && <span style={{ fontSize: "11px", color: RED, whiteSpace: "nowrap" }}>✗ Your answer</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={appStyle}>
        <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
        <div style={{ textAlign: "center", margin: "10px 0 22px" }}>
          <div style={{ fontSize: "56px", marginBottom: "6px" }}>{pass ? "🎓" : "📖"}</div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "52px", fontWeight: "700", color: pass ? GRN : RED, lineHeight: 1 }}>{pct}%</div>
          <div style={{ fontSize: "15px", fontWeight: "700", color: pass ? GRN : RED, letterSpacing: "0.18em", textTransform: "uppercase", marginTop: "4px" }}>{pass ? "Pass" : "Fail"}</div>
          <div style={{ fontSize: "13px", color: MUT, marginTop: "5px" }}>{correct} correct of {questions.length} · {courseName}</div>
        </div>

        <div style={{ ...cardStyle, marginBottom: "12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", marginBottom: "18px" }}>
            {[{ l: "Correct", v: correct, c: GRN }, { l: "Wrong", v: wrong, c: RED }, { l: "Skipped", v: skipped, c: "#ddd040" }].map(s => (
              <div key={s.l} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "9px", padding: "13px", textAlign: "center" }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "30px", fontWeight: "700", color: s.c }}>{s.v}</div>
                <div style={{ fontSize: "10px", color: MUT, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "3px" }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{ height: "7px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden", marginBottom: "6px" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${pass ? GRN : RED},${pass ? "#2dde7a" : "#ff3333"})`, borderRadius: "4px" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: MUT, marginBottom: "18px" }}>
            <span>0%</span><span style={{ color: G }}>Pass 70%</span><span>100%</span>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "16px" }}>
            <div style={{ fontSize: "10px", color: MUT, letterSpacing: "0.13em", textTransform: "uppercase", marginBottom: "12px" }}>Time Analysis</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "9px" }}>
              {[
                { l: "Total Time Used", v: fmt(totalUsed) },
                { l: "Average per Q", v: fmt(avg) },
                { l: "Slowest Q", v: slowest.t > 0 ? `Q${slowest.i + 1} · ${fmt(slowest.t)}` : "—" },
                { l: "Fastest Q", v: fastest.t < Infinity ? `Q${fastest.i + 1} · ${fmt(fastest.t)}` : "—" },
              ].map(s => (
                <div key={s.l} style={{ background: "rgba(255,255,255,0.03)", borderRadius: "8px", padding: "11px 14px" }}>
                  <div style={{ fontSize: "10px", color: MUT, textTransform: "uppercase", marginBottom: "4px" }}>{s.l}</div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "16px", color: G, fontWeight: "600" }}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "9px", width: "100%", maxWidth: "700px" }}>
          <button onClick={() => { setReviewMode(true); setReviewIdx(0); }} style={{ ...B("outline"), flex: 1, padding: "13px" }}>📝 Review Answers</button>
          <button onClick={() => { setScreen("setup"); setSetupTab("config"); }} style={{ ...B("gold"), flex: 1, padding: "13px" }}>🔄 New Exam</button>
        </div>
      </div>
    );
  }

  return null;
}