
const MAX_IN_PROGRESS = 3;

const PRIORITY_SCORE = {
    high: 3,
    medium: 2,
    low: 1
};

const STATUS_INFO = [
    { id: "todo", title: "To do", containerId: "todo-column" },
    { id: "progress", title: "In progress", containerId: "progress-column" },
    { id: "done", title: "Done", containerId: "done-column" }
];

let tasks = [
    { id: 1, title: "Review JavaScript variables", tag: "Study", priority: "high", status: "todo", estimate: 30 },
    { id: 2, title: "Practice DOM selectors", tag: "Coding", priority: "medium", status: "todo", estimate: 45 },
    { id: 3, title: "Read about event bubbling", tag: "Study", priority: "low", status: "todo", estimate: 25 },
    { id: 4, title: "Build a responsive header", tag: "Coding", priority: "high", status: "progress", estimate: 60 },
    { id: 5, title: "Create project screenshots", tag: "Personal", priority: "medium", status: "progress", estimate: 20 },
    { id: 6, title: "Write validation rules", tag: "Coding", priority: "high", status: "progress", estimate: 50 },
    { id: 7, title: "Plan weekly study goals", tag: "Personal", priority: "low", status: "done", estimate: 15 },
    { id: 8, title: "Review array methods", tag: "Study", priority: "medium", status: "done", estimate: 35 },
    { id: 9, title: "Research accessibility", tag: "Research", priority: "medium", status: "todo", estimate: 40 },
    { id: 10, title: "Test mobile layout", tag: "Coding", priority: "high", status: "done", estimate: 30 }
];

let nextId = 11;

const boardMessage = document.querySelector("#board-message");
const taskForm = document.querySelector("#task-form");
const board = document.querySelector("#board");
const searchInput = document.querySelector("#search");
const tagFilter = document.querySelector("#filter-tag");
const prioritySort = document.querySelector("#sort-priority");
const progressLabel = document.querySelector("#progress-label");
const progressTrack = document.querySelector("#progress-track");

function showBoardMessage(text, type = "") {
    boardMessage.textContent = text;
    boardMessage.className = `status ${type}`.trim();
}

function getVisibleTasks() {
    const query = searchInput.value.trim().toLowerCase();
    const selectedTag = tagFilter.value;

    const visibleTasks = tasks.filter(function (task) {
        const matchesSearch = task.title.toLowerCase().includes(query);
        const matchesTag =
            selectedTag === "all" || task.tag === selectedTag;

        return matchesSearch && matchesTag;
    });

    if (prioritySort.value === "priority") {
        visibleTasks.sort(function (a, b) {
            return (
                PRIORITY_SCORE[b.priority] - PRIORITY_SCORE[a.priority] ||
                a.id - b.id
            );
        });
    } else {
        visibleTasks.sort(function (a, b) {
            return a.id - b.id;
        });
    }

    return visibleTasks;
}

function makeTaskCard(task) {
    const article = document.createElement("article");
    article.className = "task-card";
    article.dataset.taskId = String(task.id);

    const title = document.createElement("h3");
    title.textContent = task.title;

    const description = document.createElement("p");
    description.textContent = `Estimated time: ${task.estimate} minutes`;

    const meta = document.createElement("div");
    meta.className = "task-meta";

    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = task.tag;

    const priority = document.createElement("span");
    priority.className = `priority ${task.priority}`;
    priority.textContent = `${task.priority} priority`;

    meta.append(tag, priority);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const destinations = STATUS_INFO.filter(function (status) {
        return status.id !== task.status;
    });

    for (const destination of destinations) {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "secondary";
        button.dataset.action = "move";
        button.dataset.destination = destination.id;
        button.textContent = `Move to ${destination.title}`;

        button.setAttribute(
            "aria-label",
            `Move ${task.title} to ${destination.title}`
        );

        actions.append(button);
    }

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "danger";
    deleteButton.dataset.action = "delete";
    deleteButton.textContent = "Delete";

    deleteButton.setAttribute(
        "aria-label",
        `Delete ${task.title}`
    );

    actions.append(deleteButton);
    article.append(title, description, meta, actions);

    return article;
}

function updateProgress() {
    let finished = 0;

    for (const task of tasks) {
        if (task.status === "done") {
            finished++;
        }
    }

    const percentage = tasks.length === 0
        ? 0
        : Math.round((finished / tasks.length) * 100);

    progressLabel.textContent =
        `${finished} / ${tasks.length} (${percentage}%)`;

    progressTrack.value = percentage;
}

function render() {
    const visibleTasks = getVisibleTasks();

    for (const status of STATUS_INFO) {
        const column = document.getElementById(status.containerId);

        column.replaceChildren();

        const heading = document.createElement("div");
        heading.className = "column-heading";

        const title = document.createElement("h2");
        title.textContent = status.title;

        const columnTasks = visibleTasks.filter(function (task) {
            return task.status === status.id;
        });

        const count = document.createElement("span");
        count.className = "count";
        count.textContent = String(columnTasks.length);

        heading.append(title, count);

        const list = document.createElement("div");
        list.className = "task-list";

        for (const task of columnTasks) {
            list.append(makeTaskCard(task));
        }

        if (columnTasks.length === 0) {
            const empty = document.createElement("p");
            empty.className = "empty-message";
            empty.textContent = "No tasks found in this column.";
            list.append(empty);
        }

        column.append(heading, list);
    }

    if (visibleTasks.length === 0) {
        showBoardMessage(
            "No tasks match your search or selected tag.",
            "error"
        );
    }

    updateProgress();
}

function moveTask(taskId, destination) {
    const task = tasks.find(function (item) {
        return item.id === taskId;
    });

    if (!task) {
        return;
    }

    const validDestination = STATUS_INFO.some(function (status) {
        return status.id === destination;
    });

    if (!validDestination) {
        showBoardMessage("Invalid destination.", "error");
        return;
    }

    if (
        destination === "progress" &&
        task.status !== "progress"
    ) {
        let activeCount = 0;

        for (const item of tasks) {
            if (item.status === "progress") {
                activeCount++;
            }
        }

        if (activeCount >= MAX_IN_PROGRESS) {
            showBoardMessage(
                `Move blocked: In Progress can contain at most ${MAX_IN_PROGRESS} tasks. Move another task out first.`,
                "error"
            );
            return;
        }
    }

    task.status = destination;

    const destinationTitle = STATUS_INFO.find(function (status) {
        return status.id === destination;
    }).title;

    showBoardMessage(
        `Moved "${task.title}" to ${destinationTitle}.`,
        "success"
    );

    render();
}

board.addEventListener("click", function (event) {
    if (!(event.target instanceof Element)) {
        return;
    }

    const button = event.target.closest("button[data-action]");

    if (!button || !board.contains(button)) {
        return;
    }

    const card = button.closest("[data-task-id]");

    if (!card) {
        return;
    }

    const taskId = Number(card.dataset.taskId);

    if (button.dataset.action === "move") {
        moveTask(taskId, button.dataset.destination);
    }

    if (button.dataset.action === "delete") {
        const task = tasks.find(function (item) {
            return item.id === taskId;
        });

        if (!task) {
            return;
        }

        tasks = tasks.filter(function (item) {
            return item.id !== taskId;
        });

        showBoardMessage(`Deleted "${task.title}".`, "success");
        render();
    }
});

taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(taskForm);
    const title = String(formData.get("title")).trim();
    const tag = String(formData.get("tag"));
    const priority = String(formData.get("priority"));
    const status = String(formData.get("status"));

    if (title.length === 0) {
        showBoardMessage(
            "Enter a task title before adding a task.",
            "error"
        );

        document.querySelector("#task-title").focus();
        return;
    }

    if (
        status === "progress" &&
        tasks.filter(function (task) {
            return task.status === "progress";
        }).length >= MAX_IN_PROGRESS
    ) {
        showBoardMessage(
            `Task not added: In Progress can contain at most ${MAX_IN_PROGRESS} tasks. Choose another column.`,
            "error"
        );

        document.querySelector("#task-status").focus();
        return;
    }

    tasks.push({
        id: nextId,
        title: title,
        tag: tag,
        priority: priority,
        status: status,
        estimate: 30
    });

    nextId++;

    taskForm.reset();

    showBoardMessage(`Added "${title}".`, "success");
    render();
});

searchInput.addEventListener("input", render);
tagFilter.addEventListener("change", render);
prioritySort.addEventListener("change", render);

render();
