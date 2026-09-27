// All career-path content lives here. Edit this file to change what every page shows.
// NOTE: placeholder demo content. Check course numbers against the UMBC catalog before launch.

export type Task = { id: string; title: string; kind: "Class" | "Skill" | "Experience" | "Career" };
export type Semester = { term: string; tasks: Task[] };
export type CareerPath = {
  slug: string;
  role: string;
  major: string;
  summary: string;
  skills: string[];
  resources: string[];
  plan: Semester[];
};

export const majors = ["Computer Science", "Information Systems", "Biological Sciences", "Computer Engineering"] as const;
export const years = ["Freshman", "Sophomore", "Junior", "Senior"] as const;

export const paths: CareerPath[] = [
  {
    slug: "software-engineer",
    role: "Software Engineer",
    major: "Computer Science",
    summary: "Design, build, and ship software people use every day, from web apps to large systems.",
    skills: ["Data structures", "Git", "Testing", "System design"],
    resources: ["UMBC Career Center résumé reviews", "Hackathons like hackUMBC", "Club project teams"],
    plan: [
      { term: "Year 1", tasks: [
        { id: "se-1", title: "CMSC 201: Computer Science I", kind: "Class" },
        { id: "se-2", title: "Set up GitHub and push your first project", kind: "Skill" },
        { id: "se-3", title: "Go to your first hackathon", kind: "Experience" },
      ]},
      { term: "Year 2", tasks: [
        { id: "se-4", title: "CMSC 341: Data Structures", kind: "Class" },
        { id: "se-5", title: "Join a club project team", kind: "Experience" },
        { id: "se-6", title: "Get your résumé reviewed", kind: "Career" },
      ]},
      { term: "Year 3", tasks: [
        { id: "se-7", title: "Apply to 15+ summer internships", kind: "Career" },
        { id: "se-8", title: "Practice technical interviews weekly", kind: "Skill" },
        { id: "se-9", title: "Build a portfolio project with real users", kind: "Experience" },
      ]},
      { term: "Year 4", tasks: [
        { id: "se-10", title: "Take an upper-level systems elective", kind: "Class" },
        { id: "se-11", title: "Apply to full-time roles in the fall", kind: "Career" },
        { id: "se-12", title: "Mentor a first-year student", kind: "Experience" },
      ]},
    ],
  },
  {
    slug: "data-scientist",
    role: "Data Scientist",
    major: "Information Systems",
    summary: "Turn messy data into answers that help teams make better decisions.",
    skills: ["Python", "Statistics", "SQL", "Data visualization"],
    resources: ["Kaggle practice datasets", "Data science club", "Research with faculty"],
    plan: [
      { term: "Year 1", tasks: [
        { id: "ds-1", title: "Intro programming course (Python)", kind: "Class" },
        { id: "ds-2", title: "Learn spreadsheets and basic charts", kind: "Skill" },
        { id: "ds-3", title: "Join the data science club", kind: "Experience" },
      ]},
      { term: "Year 2", tasks: [
        { id: "ds-4", title: "Intro statistics course", kind: "Class" },
        { id: "ds-5", title: "Learn SQL with a practice database", kind: "Skill" },
        { id: "ds-6", title: "Finish one Kaggle project", kind: "Experience" },
      ]},
      { term: "Year 3", tasks: [
        { id: "ds-7", title: "Database systems course", kind: "Class" },
        { id: "ds-8", title: "Apply to data analyst internships", kind: "Career" },
        { id: "ds-9", title: "Publish a data story on your portfolio", kind: "Experience" },
      ]},
      { term: "Year 4", tasks: [
        { id: "ds-10", title: "Machine learning elective", kind: "Class" },
        { id: "ds-11", title: "Apply to full-time roles", kind: "Career" },
        { id: "ds-12", title: "Present your capstone project", kind: "Experience" },
      ]},
    ],
  },
  {
    slug: "biomedical-researcher",
    role: "Biomedical Researcher",
    major: "Biological Sciences",
    summary: "Run experiments and analyze data to understand disease and develop new treatments.",
    skills: ["Lab methods", "Research", "Data analysis", "Scientific writing"],
    resources: ["Undergraduate research programs", "Summer research fellowships", "URCAD research showcase"],
    plan: [
      { term: "Year 1", tasks: [
        { id: "br-1", title: "Intro biology and chemistry sequence", kind: "Class" },
        { id: "br-2", title: "Learn how to read a research paper", kind: "Skill" },
        { id: "br-3", title: "Email 3 faculty about their labs", kind: "Career" },
      ]},
      { term: "Year 2", tasks: [
        { id: "br-4", title: "Genetics or cell biology course", kind: "Class" },
        { id: "br-5", title: "Join a research lab", kind: "Experience" },
        { id: "br-6", title: "Learn basic R or Python for data", kind: "Skill" },
      ]},
      { term: "Year 3", tasks: [
        { id: "br-7", title: "Apply to summer research programs", kind: "Career" },
        { id: "br-8", title: "Present a poster at URCAD", kind: "Experience" },
        { id: "br-9", title: "Upper-level lab course", kind: "Class" },
      ]},
      { term: "Year 4", tasks: [
        { id: "br-10", title: "Write an honors thesis or lab report", kind: "Experience" },
        { id: "br-11", title: "Apply to grad school or research jobs", kind: "Career" },
        { id: "br-12", title: "Ask your PI for a recommendation letter", kind: "Career" },
      ]},
    ],
  },
  {
    slug: "ml-engineer",
    role: "ML Engineer",
    major: "Computer Engineering",
    summary: "Build and deploy machine learning models that power real products.",
    skills: ["Linear algebra", "Machine learning", "Python", "Cloud deployment"],
    resources: ["Open-source ML projects", "AI club", "Research with faculty"],
    plan: [
      { term: "Year 1", tasks: [
        { id: "ml-1", title: "Calculus and intro programming", kind: "Class" },
        { id: "ml-2", title: "Learn Python and Jupyter notebooks", kind: "Skill" },
        { id: "ml-3", title: "Join the AI club", kind: "Experience" },
      ]},
      { term: "Year 2", tasks: [
        { id: "ml-4", title: "Linear algebra course", kind: "Class" },
        { id: "ml-5", title: "Train your first model on a public dataset", kind: "Skill" },
        { id: "ml-6", title: "Build an ML project at a hackathon", kind: "Experience" },
      ]},
      { term: "Year 3", tasks: [
        { id: "ml-7", title: "Machine learning course", kind: "Class" },
        { id: "ml-8", title: "Apply to ML or software internships", kind: "Career" },
        { id: "ml-9", title: "Deploy a model as a web app", kind: "Skill" },
      ]},
      { term: "Year 4", tasks: [
        { id: "ml-10", title: "Deep learning or AI elective", kind: "Class" },
        { id: "ml-11", title: "Contribute to an open-source ML library", kind: "Experience" },
        { id: "ml-12", title: "Apply to full-time roles", kind: "Career" },
      ]},
    ],
  },
];

export function getPath(slug: string) {
  return paths.find((p) => p.slug === slug);
}

export const kindStyle: Record<Task["kind"], string> = {
  Class: "bg-teal-tint text-teal",
  Skill: "bg-gold-tint text-gold-deep",
  Experience: "bg-mint-tint text-mint",
  Career: "bg-surface-2 text-ink-2",
};
