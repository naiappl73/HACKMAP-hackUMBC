const salaryByTrack = [
  { key: "software", salary: "$80,000 - $130,000" },
  { key: "data", salary: "$75,000 - $125,000" },
  { key: "cyber", salary: "$85,000 - $140,000" },
  { key: "research", salary: "$60,000 - $110,000" },
  { key: "business", salary: "$65,000 - $115,000" }
];

const recommendationMap = {
  software: ["Software Engineer", "Product Engineer", "Cloud Developer"],
  data: ["Data Analyst", "Machine Learning Engineer", "Data Engineer"],
  cyber: ["Security Analyst", "Penetration Tester", "Cloud Security Engineer"],
  research: ["Research Assistant", "UX Researcher", "Policy Research Analyst"],
  business: ["Business Analyst", "Operations Associate", "Program Manager"]
};

function sanitizeText(value) {
  return value.trim().replace(/\s+/g, " ");
}

function parseDomains(value) {
  return value
    .split(",")
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean);
}

function detectTrack(text) {
  const normalized = text.toLowerCase();
  const match = salaryByTrack.find(({ key }) => normalized.includes(key));
  return match ? match.key : "software";
}

function buildCareerPlan({ degreePath, niche, projects, careerGoal }) {
  return [
    `Complete foundational coursework for ${degreePath} and strengthen core skills each semester.`,
    `Build at least 2 portfolio projects focused on ${projects}.`,
    `Join a student organization or lab connected to ${niche} for practical exposure.`,
    `Find an internship aligned with your goal of becoming ${careerGoal}.`,
    `Develop a research and networking plan: attend career fairs, connect with mentors, and publish project outcomes.`
  ];
}

function createList(items, elementId) {
  const target = document.getElementById(elementId);
  target.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    target.appendChild(li);
  });
}

document.getElementById("careerForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const studentEmail = sanitizeText(document.getElementById("studentEmail").value);
  const allowedDomainsInput = sanitizeText(document.getElementById("allowedDomains").value);
  const degreePath = sanitizeText(document.getElementById("degreePath").value);
  const niche = sanitizeText(document.getElementById("niche").value);
  const projects = sanitizeText(document.getElementById("projects").value);
  const careerGoal = sanitizeText(document.getElementById("careerGoal").value);

  const errorMessage = document.getElementById("errorMessage");
  errorMessage.textContent = "";

  const allowedDomains = parseDomains(allowedDomainsInput || "umbc.edu");
  const emailDomain = studentEmail.split("@")[1]?.toLowerCase();

  if (!emailDomain || !allowedDomains.includes(emailDomain)) {
    errorMessage.textContent = "Use a valid student email from one of the allowed school domains.";
    return;
  }

  if (!degreePath || !niche || !projects || !careerGoal) {
    errorMessage.textContent = "Please complete all fields to generate your plan.";
    return;
  }

  const track = detectTrack(`${degreePath} ${niche} ${careerGoal}`);
  const salary = salaryByTrack.find((entry) => entry.key === track)?.salary ?? "$70,000 - $110,000";

  const opportunities = [
    `${careerGoal} Intern (${salary})`,
    `${niche} Project Assistant (${salary})`,
    `${degreePath} Co-op Placement (${salary})`
  ];

  const recommendedCareers = recommendationMap[track] ?? recommendationMap.software;
  const careerPlan = buildCareerPlan({ degreePath, niche, projects, careerGoal });

  document.getElementById("summary").textContent =
    `Based on your ${degreePath} path and interest in ${niche}, RetrieversPath found opportunities that support your goal: ${careerGoal}.`;

  createList(opportunities, "opportunities");
  createList(recommendedCareers, "recommendedCareers");
  createList(careerPlan, "careerPlan");

  document.getElementById("results").classList.remove("hidden");
});
