// Loads the two demo accounts, then their projects, tasks, and comments, through the running API.
// Running this again skips an account, project, task, or comment that is already there.
const base = process.env.SAMPLE_API_URL || "http://localhost:3000";

const people = {
  A: {
    email: "user@demo.test",
    password: "user2026",
    username: "user",
    fullName: "User Tester",
    position: "Tester",
  },
  B: {
    email: "admin@demo.test",
    password: "admin2026",
    username: "admin",
    fullName: "Admin Lead",
    position: "Project lead",
    role: "admin",
  },
};

const boards = [
  {
    owner: "A",
    name: "Product launch",
    description: "Checklist for the October release, from the invite to the demo.",
    invites: [{ who: "B", permission: "edit" }],
    tasks: [
      { title: "Confirm the guest list", description: "Check who has replied and who still needs a reminder.", status: "To Do", priority: "Medium", dueDate: "2026-10-18" },
      { title: "Write the launch email", description: "Short note with the date, the link, and what people should bring.", status: "To Do", priority: "Low", dueDate: "2026-10-22", assign: "B" },
      { title: "Prepare the demo script", description: "Walk through register, a shared project, and moving a task.", status: "In Progress", priority: "High", dueDate: "2026-10-10", assign: "B" },
      { title: "Book the room", description: "Reserve the small room for the afternoon walkthrough.", status: "Done", priority: "Medium", dueDate: "2026-10-08" },
      { title: "Print the banners", description: "Hold until the final title is approved.", status: "Hold", priority: "Low", dueDate: "2026-10-28", assign: "B" },
    ],
    comments: [
      { task: "Prepare the demo script", who: "A", text: "Keep the demo under ten minutes and leave time for questions." },
      { task: "Prepare the demo script", who: "B", text: "I will open with the shared board, then the overdue card.", replyTo: "Keep the demo under ten minutes and leave time for questions." },
    ],
  },
  {
    owner: "A",
    name: "Hiring pipeline",
    description: "Open role for a designer. Viewers can follow the board and comment.",
    invites: [{ who: "B", permission: "view" }],
    tasks: [
      { title: "Review the portfolio", description: "Read the three shortlisted portfolios before Friday.", status: "To Do", priority: "High", dueDate: "2026-10-21", assign: "B" },
      { title: "Schedule the interview", description: "Offer two afternoon times next week.", status: "In Progress", priority: "Medium", dueDate: "2026-10-17", assign: "B" },
      { title: "Post the role", description: "The listing is live on the careers page.", status: "Done", priority: "Low" },
    ],
    comments: [
      { task: "Schedule the interview", who: "B", text: "I can sit in on the second interview if that helps." },
    ],
  },
  {
    owner: "A",
    name: "Studio notes",
    description: "Private notes that are not shared yet.",
    invites: [],
    tasks: [
      { title: "Sketch the empty state", description: "Show what a new account sees before the first project.", status: "To Do", priority: "Medium", dueDate: "2026-10-25" },
      { title: "Collect screenshot captions", description: "One line under each picture in the handover notes.", status: "In Progress", priority: "Low" },
    ],
  },
  {
    owner: "A",
    name: "Winter campaign",
    description: "Last season's board, kept for reference.",
    invites: [{ who: "B", permission: "edit" }],
    after: "archive",
    tasks: [
      { title: "Retire the old banner", description: "Take the holiday artwork off the homepage.", status: "Done", priority: "Medium", dueDate: "2026-01-15" },
      { title: "Archive the photo set", description: "Move the unused exports into the shared folder.", status: "Hold", priority: "Low", dueDate: "2026-02-01", assign: "B" },
    ],
  },
  {
    owner: "B",
    name: "Website Redesign",
    description: "New layout for the marketing site.",
    tasks: [
      { title: "Redesign the homepage hero", description: "One headline, one action, and a short supporting line.", status: "To Do", priority: "High", dueDate: "2026-10-24", assign: "A" },
      { title: "Collect the brand colors", description: "Pull the approved teal and stone values into the style notes.", status: "In Progress", priority: "Low", dueDate: "2026-10-16", assign: "A" },
      { title: "Inventory the current pages", description: "List every public page and who owns the copy.", status: "Done", priority: "Medium", dueDate: "2026-10-09" },
      { title: "Pause the mobile menu", description: "Wait for the final navigation labels.", status: "Hold", priority: "High", dueDate: "2026-10-30", assign: "A" },
    ],
    comments: [
      { task: "Redesign the homepage hero", who: "B", text: "Please keep the headline to one sentence." },
      { task: "Redesign the homepage hero", who: "A", text: "I will draft two options and drop them on the card.", replyTo: "Please keep the headline to one sentence." },
    ],
  },
  {
    owner: "B",
    name: "Sprint retro",
    description: "Notes from the last sprint. Closed so the board stays read only.",
    invites: [{ who: "A", permission: "view" }],
    after: "close",
    tasks: [
      { title: "Write the retro summary", description: "Three things that worked and three that slowed the sprint.", status: "Done", priority: "Medium", dueDate: "2026-10-12" },
      { title: "Assign the follow-ups", description: "Turn the action items into tasks on the launch board.", status: "In Progress", priority: "High", dueDate: "2026-10-14", assign: "A" },
    ],
  },
  {
    owner: "B",
    name: "Reading list",
    description: "Articles to read before the next planning meeting.",
    invites: [],
    tasks: [
      { title: "Read the accessibility notes", description: "Focus on form labels and the contrast of the status colors.", status: "To Do", priority: "Medium", dueDate: "2026-10-19" },
      { title: "Skim the deployment guide", description: "Note anything we still do by hand.", status: "Hold", priority: "Low" },
    ],
  },
];

function failureText(body, status) {
  return body.message || JSON.stringify(body).slice(0, 180) || String(status);
}

async function ensureAccount(person, created) {
  const loginRes = await fetch(base + "/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: person.email, password: person.password }),
  });
  const loginBody = await loginRes.json();
  if (loginRes.ok) {
    person.token = loginBody.token;
    person.id = loginBody.user._id;
    person.label = loginBody.user.fullName || loginBody.user.username;
    return;
  }
  if (loginBody.message === "Wrong password!") {
    throw new Error(person.email + " already exists with a different password.");
  }
  if (loginBody.message !== "Can't find this user") {
    throw new Error("Login failed for " + person.email + ": " + failureText(loginBody, loginRes.status));
  }

  const registerRes = await fetch(base + "/api/users/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: person.fullName,
      position: person.position,
      username: person.username,
      email: person.email,
      password: person.password,
      ...(person.role ? { role: person.role } : {}),
    }),
  });
  const registerBody = await registerRes.json();
  if (!registerRes.ok) {
    throw new Error("Could not create " + person.email + ": " + failureText(registerBody, registerRes.status));
  }
  person.token = registerBody.token;
  person.id = registerBody.user._id;
  person.label = registerBody.user.fullName || registerBody.user.username;
  created.push("account " + person.label);
}

async function api(person, method, path, payload) {
  const res = await fetch(base + path, {
    method,
    headers: {
      Authorization: "Bearer " + person.token,
      "Content-Type": "application/json",
    },
    ...(payload !== undefined ? { body: JSON.stringify(payload) } : {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data.message || JSON.stringify(data).slice(0, 180);
    throw new Error(method + " " + path + " -> " + res.status + " " + message);
  }
  return data;
}

(async () => {
  const created = [];
  await ensureAccount(people.A, created);
  await ensureAccount(people.B, created);

  for (const board of boards) {
    const owner = people[board.owner];
    const projects = await api(owner, "GET", "/api/projects");
    let project = projects.find((item) => item.name === board.name && item.access === "owner");

    if (!project && !board.existing) {
      project = await api(owner, "POST", "/api/projects", {
        name: board.name,
        description: board.description,
        invites: (board.invites || []).map((invite) => ({
          email: people[invite.who].email,
          permission: invite.permission,
        })),
      });
      created.push("project " + board.name);
    } else if ((board.invites || []).length > 0 && (project.collaborators || []).length === 0) {
      project = await api(owner, "PUT", "/api/projects/" + project._id, {
        name: project.name,
        description: project.description,
        invites: board.invites.map((invite) => ({
          email: people[invite.who].email,
          permission: invite.permission,
        })),
      });
    }

    if ((project.status || "active") !== "active") {
      console.log("skip " + board.name + " because it is " + project.status);
      continue;
    }

    const tasks = await api(owner, "GET", "/api/projects/" + project._id + "/tasks");
    const taskByTitle = new Map(tasks.map((task) => [task.title, task]));

    for (const task of board.tasks || []) {
      if (taskByTitle.has(task.title)) {
        continue;
      }
      const saved = await api(owner, "POST", "/api/projects/" + project._id + "/tasks", {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate || null,
        assignees: task.assign ? [people[task.assign].id] : [],
      });
      taskByTitle.set(saved.title, saved);
      created.push("task " + board.name + " / " + saved.title);
    }

    const commentIds = new Map();
    for (const comment of board.comments || []) {
      const task = taskByTitle.get(comment.task);
      if (!task) {
        continue;
      }
      const author = people[comment.who];
      const existing = await api(author, "GET", "/api/projects/" + project._id + "/tasks/" + task._id + "/comments");
      const already = existing.find((item) => item.text === comment.text);
      if (already) {
        commentIds.set(comment.text, already._id);
        continue;
      }
      const parent = comment.replyTo ? commentIds.get(comment.replyTo) : undefined;
      const saved = await api(author, "POST", "/api/projects/" + project._id + "/tasks/" + task._id + "/comments", {
        text: comment.text,
        ...(parent ? { parent } : {}),
      });
      commentIds.set(saved.text, saved._id);
      created.push("comment on " + comment.task);
    }

    if (board.after) {
      await api(owner, "PUT", "/api/projects/" + project._id + "/" + board.after);
      created.push(board.after + " " + board.name);
    }
  }

  console.log("Sample data is ready for " + people.A.label + " and " + people.B.label + ".");
  if (created.length === 0) {
    console.log("Nothing new was added. Those projects and tasks are already there.");
  } else {
    for (const line of created) {
      console.log("+ " + line);
    }
  }
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
