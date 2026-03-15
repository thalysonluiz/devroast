import { config } from "dotenv";

config({ path: ".env.local" });

import { faker } from "@faker-js/faker";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { roastIssues, roasts, submissions } from "./schema";

const TOTAL = 100;

const LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "go",
  "rust",
  "php",
  "ruby",
  "c",
  "cpp",
  "csharp",
  "swift",
  "kotlin",
  "bash",
];

const ROAST_QUOTES = [
  "This code looks like it was written during a power outage using a typewriter.",
  "I've seen better structure in a bowl of alphabet soup.",
  "This is what happens when you learn to code from a fortune cookie.",
  "The only thing consistent here is the inconsistency.",
  "Your variable names are a cry for help.",
  "I had to take a shower after reading this.",
  "This code has more issues than a magazine rack.",
  "Even the compiler is embarrassed to run this.",
  "This is the programming equivalent of assembling IKEA furniture blindfolded.",
  "I've seen cleaner code written by a cat walking across a keyboard.",
  "This function does five things and none of them well.",
  "The indentation alone caused me physical pain.",
  "Your future self will read this and weep.",
  "This is less code and more abstract art.",
  "I'm not sure if this was written by a developer or a random number generator.",
  "The comments lie almost as much as the logic.",
  "This code is the reason senior developers drink.",
  "You have achieved the impossible: making a simple task complex.",
  "This looks like it was translated from COBOL via Google Translate.",
  "The technical debt here could fund a startup.",
];

const VERDICTS = [
  "clean_code",
  "needs_work",
  "needs_serious_help",
  "what_is_this",
  "unroastable",
] as const;

const ROAST_MODES = ["honest", "roast"] as const;

const SEVERITIES = ["critical", "warning", "good"] as const;

const ISSUE_TITLES = {
  critical: [
    "SQL injection vulnerability",
    "Hardcoded credentials",
    "No error handling",
    "Memory leak detected",
    "Infinite loop risk",
    "Race condition",
    "Using eval() on user input",
    "Unvalidated user input",
    "Plaintext password storage",
    "Missing null checks",
  ],
  warning: [
    "Using var instead of const/let",
    "Magic numbers everywhere",
    "Deeply nested callbacks",
    "No input validation",
    "Inconsistent naming conventions",
    "Dead code left in",
    "Console.log in production code",
    "Overly complex conditionals",
    "Missing return types",
    "Global state mutation",
  ],
  good: [
    "Descriptive variable names",
    "Good separation of concerns",
    "Proper error propagation",
    "Consistent code style",
    "Well-structured functions",
    "Good use of constants",
    "Appropriate abstractions",
    "Clean imports",
    "Readable control flow",
    "Good use of early returns",
  ],
};

const CODE_SNIPPETS = [
  `function getUserData(id) {
  var data = db.query("SELECT * FROM users WHERE id = " + id);
  console.log(data);
  return data;
}`,
  `const x = (a, b, c, d) => {
  if (a) {
    if (b) {
      if (c) {
        if (d) {
          return true
        }
      }
    }
  }
  return false
}`,
  `async function fetchAll() {
  try {
    const res = await fetch('/api/data')
    return res.json()
  } catch (e) {}
}`,
  `password = "admin123"
username = "root"
db_host = "prod-db.internal"

def connect():
    return psycopg2.connect(host=db_host, user=username, password=password)`,
  `public class Calculator {
    public int add(int a, int b) { return a + b; }
    public int sub(int a, int b) { return a - b; }
    public int mul(int a, int b) { return a * b; }
    public int div(int a, int b) { return a / b; }
}`,
  `const processData = (data) => {
  var result = []
  for (var i = 0; i < data.length; i++) {
    for (var j = 0; j < data[i].items.length; j++) {
      if (data[i].items[j].active == true) {
        if (data[i].items[j].value != null) {
          result.push(data[i].items[j].value * 1.2 + 5 - 3)
        }
      }
    }
  }
  return result
}`,
  `def calculate_total(items):
    total = 0
    for i in range(len(items)):
        total = total + items[i]['price'] * items[i]['qty']
    return total`,
  `func handleRequest(w http.ResponseWriter, r *http.Request) {
    data, _ := ioutil.ReadAll(r.Body)
    var payload map[string]interface{}
    json.Unmarshal(data, &payload)
    result := eval(payload["code"].(string))
    fmt.Fprintf(w, result)
}`,
  `class UserService {
  constructor() {
    this.users = []
    this.admins = []
    this.sessions = []
    this.logs = []
    this.cache = {}
    this.db = new Database()
    this.mailer = new Mailer()
    this.sms = new SMSService()
    this.analytics = new Analytics()
  }
}`,
  `SELECT * FROM users, orders, products WHERE users.id = orders.user_id AND orders.product_id = products.id AND users.active = 1`,
];

const SUGGESTED_FIXES = [
  `// Use parameterized queries to prevent SQL injection
function getUserData(id: string) {
  const data = db.query("SELECT id, name, email FROM users WHERE id = $1", [id]);
  return data;
}`,
  `// Flatten the nested conditions
const check = (a: boolean, b: boolean, c: boolean, d: boolean) => {
  return a && b && c && d;
}`,
  `// Always handle errors explicitly
async function fetchAll() {
  const res = await fetch('/api/data');
  if (!res.ok) throw new Error(\`HTTP error: \${res.status}\`);
  return res.json();
}`,
];

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function scoreFromVerdict(verdict: (typeof VERDICTS)[number]): string {
  const ranges: Record<(typeof VERDICTS)[number], [number, number]> = {
    clean_code: [8.0, 10.0],
    needs_work: [5.0, 7.9],
    needs_serious_help: [2.5, 4.9],
    what_is_this: [0.0, 2.4],
    unroastable: [0.0, 1.0],
  };
  const [min, max] = ranges[verdict];
  return (Math.random() * (max - min) + min).toFixed(1);
}

async function seed() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client, { casing: "snake_case" });

  console.log("Clearing existing data...");
  await db.delete(roastIssues);
  await db.delete(roasts);
  await db.delete(submissions);

  console.log(`Seeding ${TOTAL} roasts...`);

  for (let i = 0; i < TOTAL; i++) {
    const language = pickRandom(LANGUAGES);
    const codeSnippet = pickRandom(CODE_SNIPPETS);
    const lineCount =
      codeSnippet.split("\n").length + faker.number.int({ min: 0, max: 200 });
    const roastMode = pickRandom(ROAST_MODES);
    const verdict = pickRandom(VERDICTS);

    // Insert submission
    const [submission] = await db
      .insert(submissions)
      .values({
        code: codeSnippet,
        language,
        lineCount,
        roastMode,
        createdAt: faker.date.recent({ days: 90 }),
      })
      .returning();

    // Insert roast
    const hasFix = Math.random() > 0.4;
    const [roast] = await db
      .insert(roasts)
      .values({
        submissionId: submission.id,
        score: scoreFromVerdict(verdict),
        verdict,
        roastQuote: pickRandom(ROAST_QUOTES),
        suggestedFix: hasFix ? pickRandom(SUGGESTED_FIXES) : null,
        createdAt: faker.date.recent({ days: 90 }),
      })
      .returning();

    // Insert issues (3–6 per roast)
    const issueCount = faker.number.int({ min: 3, max: 6 });
    const issueValues = Array.from({ length: issueCount }, (_, order) => {
      const severity = pickRandom(SEVERITIES);
      const titles = ISSUE_TITLES[severity];
      return {
        roastId: roast.id,
        severity,
        title: pickRandom(titles),
        description: faker.lorem.sentences({ min: 1, max: 2 }),
        order,
      };
    });

    await db.insert(roastIssues).values(issueValues);

    process.stdout.write(`\r  ${i + 1}/${TOTAL}`);
  }

  console.log("\nDone!");
  await client.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
