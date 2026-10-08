export const mockCourses = [
  {
    id: 1,
    title: "Data Structures and Algorithms",
    description: "Master the core concepts of DSA to ace your technical interviews.",
    difficulty: "Intermediate",
    lessons: 45,
    duration: "10 Weeks",
    progress: 30,
    category: "Computer Science",
    modules: [
      { id: "m1", title: "Arrays and Strings", lessons: 5 },
      { id: "m2", title: "Linked Lists", lessons: 4 },
      { id: "m3", title: "Trees and Graphs", lessons: 8 },
    ]
  },
  {
    id: 2,
    title: "React Development",
    description: "Learn modern React with Hooks, Context API, and React Router.",
    difficulty: "Beginner",
    lessons: 30,
    duration: "6 Weeks",
    progress: 0,
    category: "Web Development",
    modules: [
      { id: "m1", title: "React Basics", lessons: 6 },
      { id: "m2", title: "Hooks and State", lessons: 5 },
    ]
  },
  {
    id: 3,
    title: "Java Programming",
    description: "Comprehensive guide to Java for enterprise applications.",
    difficulty: "Beginner",
    lessons: 50,
    duration: "12 Weeks",
    progress: 80,
    category: "Programming Languages",
    modules: [
      { id: "m1", title: "Java Fundamentals", lessons: 10 },
      { id: "m2", title: "Object-Oriented Programming", lessons: 8 },
    ]
  },
  {
    id: 4,
    title: "Python Programming",
    description: "From basics to advanced concepts in Python.",
    difficulty: "Beginner",
    lessons: 40,
    duration: "8 Weeks",
    progress: 100,
    category: "Programming Languages",
    modules: [
      { id: "m1", title: "Python Basics", lessons: 12 },
    ]
  },
  {
    id: 5,
    title: "SQL and DBMS",
    description: "Learn database design, querying, and optimization.",
    difficulty: "Intermediate",
    lessons: 25,
    duration: "5 Weeks",
    progress: 10,
    category: "Database",
    modules: [
      { id: "m1", title: "Relational Algebra", lessons: 3 },
      { id: "m2", title: "Advanced SQL", lessons: 7 },
    ]
  }
];

export const mockUser = {
  name: "Harini",
  email: "harini@example.com",
  learningGoal: "Software Engineer",
  skillLevel: "Intermediate",
  streak: 15,
  overallReadiness: 72,
  skillsLearning: ["DSA", "React", "Java"],
  achievements: [
    { id: 1, title: "7 Day Streak", icon: "🔥" },
    { id: 2, title: "First Course Completed", icon: "🏆" }
  ]
};

export const mockProjects = [
  {
    id: 1,
    title: "Student Management System",
    description: "Build a complete CRUD application using React and mock API.",
    requiredSkills: ["React", "State Management"],
    difficulty: "Intermediate",
    estimatedTime: "4 Hours",
    status: "Not Started"
  },
  {
    id: 2,
    title: "Task Management Web App",
    description: "Create a drag-and-drop Kanban board.",
    requiredSkills: ["React", "CSS"],
    difficulty: "Beginner",
    estimatedTime: "2 Hours",
    status: "In Progress"
  },
  {
    id: 3,
    title: "DSA Problem Tracker",
    description: "Track your LeetCode progress with analytics.",
    requiredSkills: ["React", "Recharts"],
    difficulty: "Advanced",
    estimatedTime: "8 Hours",
    status: "Completed"
  }
];

export const mockAnalytics = {
  overallProgress: 65,
  learningConsistency: [
    { day: 'Mon', hours: 2 },
    { day: 'Tue', hours: 1.5 },
    { day: 'Wed', hours: 3 },
    { day: 'Thu', hours: 1 },
    { day: 'Fri', hours: 4 },
    { day: 'Sat', hours: 0.5 },
    { day: 'Sun', hours: 2.5 },
  ],
  topicMastery: [
    { subject: 'Arrays', A: 90, fullMark: 100 },
    { subject: 'Trees', A: 65, fullMark: 100 },
    { subject: 'React Hooks', A: 80, fullMark: 100 },
    { subject: 'SQL Joins', A: 50, fullMark: 100 },
    { subject: 'Dynamic Programming', A: 40, fullMark: 100 },
  ],
  strongTopics: ["Arrays", "React Basics", "Java OOP"],
  weakTopics: ["Dynamic Programming", "SQL Joins", "Graphs"]
};

export const mockQuiz = {
  title: "Data Structures - Arrays and Linked Lists",
  questions: [
    {
      id: 1,
      text: "What is the time complexity of accessing an element in an array by its index?",
      options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
      correct: "O(1)"
    },
    {
      id: 2,
      text: "Which data structure is better for frequent insertions and deletions at the beginning?",
      options: ["Array", "Linked List", "Stack", "Queue"],
      correct: "Linked List"
    },
    {
      id: 3,
      text: "In a singly linked list, each node contains data and what else?",
      options: ["A pointer to the previous node", "A pointer to the next node", "Both next and previous pointers", "An array index"],
      correct: "A pointer to the next node"
    }
  ]
};
