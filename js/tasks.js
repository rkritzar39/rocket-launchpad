"use strict";

const RocketTasks = (() => {
    let tasks = [];

    function initialize() {
        tasks = RocketStorage.getTasks();
        sortTasks();
        render();
    }

    function createId() {
        if (
            typeof crypto !== "undefined" &&
            typeof crypto.randomUUID === "function"
        ) {
            return crypto.randomUUID();
        }

        return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }

    function cleanTitle(value) {
        return String(value ?? "")
            .trim()
            .replace(/\s+/g, " ")
            .slice(0, 120);
    }

    function isValidDateString(value) {
        if (value === "") {
            return true;
        }

        return /^\d{4}-\d{2}-\d{2}$/.test(value);
    }

    function addTask(titleValue, dueDateValue = "") {
        const title = cleanTitle(titleValue);
        const dueDate = String(dueDateValue ?? "").trim();

        if (!title) {
            throw new Error("Enter a task name.");
        }

        if (!isValidDateString(dueDate)) {
            throw new Error("Enter a valid due date.");
        }

        const newTask = {
            id: createId(),
            title,
            dueDate,
            completed: false
        };

        tasks.push(newTask);
        sortTasks();
        saveAndRender();

        return newTask;
    }

    function toggleTask(taskId) {
        tasks = tasks.map((task) => {
            if (task.id !== taskId) {
                return task;
            }

            return {
                ...task,
                completed: !task.completed
            };
        });

        sortTasks();
        saveAndRender();
    }

    function removeTask(taskId) {
        const task = tasks.find((item) => item.id === taskId);

        if (!task) {
            return false;
        }

        const approved = window.confirm(`Delete "${task.title}"?`);

        if (!approved) {
            return false;
        }

        tasks = tasks.filter((item) => item.id !== taskId);
        saveAndRender();

        return true;
    }

    function sortTasks() {
        tasks.sort((firstTask, secondTask) => {
            if (firstTask.completed !== secondTask.completed) {
                return Number(firstTask.completed) -
                    Number(secondTask.completed);
            }

            if (firstTask.dueDate && secondTask.dueDate) {
                return firstTask.dueDate.localeCompare(secondTask.dueDate);
            }

            if (firstTask.dueDate) {
                return -1;
            }

            if (secondTask.dueDate) {
                return 1;
            }

            return firstTask.title.localeCompare(secondTask.title);
        });
    }

    function saveAndRender() {
        RocketStorage.saveTasks(tasks);
        render();
    }

    function formatDueDate(dateString) {
        if (!dateString) {
            return "No due date";
        }

        const dateParts = dateString.split("-").map(Number);

        if (dateParts.length !== 3) {
            return "No due date";
        }

        const localDate = new Date(
            dateParts[0],
            dateParts[1] - 1,
            dateParts[2]
        );

        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        }).format(localDate);
    }

    function createTaskItem(task) {
        const taskItem = document.createElement("div");
        taskItem.className = task.completed
            ? "task-item task-item--completed"
            : "task-item";

        const toggleButton = document.createElement("button");
        toggleButton.className = "task-item__toggle";
        toggleButton.type = "button";
        toggleButton.setAttribute(
            "aria-label",
            task.completed
                ? `Mark ${task.title} incomplete`
                : `Mark ${task.title} complete`
        );
        toggleButton.textContent = "✓";

        toggleButton.addEventListener("click", () => {
            toggleTask(task.id);
        });

        const content = document.createElement("div");
        content.className = "task-item__content";

        const title = document.createElement("span");
        title.className = "task-item__title";
        title.textContent = task.title;

        const dueDate = document.createElement("span");
        dueDate.className = "task-item__due";
        dueDate.textContent = formatDueDate(task.dueDate);

        content.append(title, dueDate);

        const deleteButton = document.createElement("button");
        deleteButton.className = "task-item__delete";
        deleteButton.type = "button";
        deleteButton.setAttribute("aria-label", `Delete ${task.title}`);
        deleteButton.title = "Delete task";
        deleteButton.textContent = "×";

        deleteButton.addEventListener("click", () => {
            const removed = removeTask(task.id);

            if (
                removed &&
                typeof RocketApp !== "undefined" &&
                typeof RocketApp.showToast === "function"
            ) {
                RocketApp.showToast("Task deleted.");
            }
        });

        taskItem.append(toggleButton, content, deleteButton);

        return taskItem;
    }

    function renderList(containerId, visibleTasks) {
        const container = document.getElementById(containerId);

        if (!container) {
            return;
        }

        container.replaceChildren();

        visibleTasks.forEach((task) => {
            container.append(createTaskItem(task));
        });
    }

    function render() {
        const homeTasks = tasks
            .filter((task) => !task.completed)
            .slice(0, 4);

        renderList("home-tasks-list", homeTasks);
        renderList("all-tasks-list", tasks);

        const allTasksList = document.getElementById("all-tasks-list");
        const emptyState = document.getElementById("tasks-empty");
        const taskCount = document.getElementById("task-count");

        if (allTasksList && emptyState) {
            const isEmpty = tasks.length === 0;

            allTasksList.hidden = isEmpty;
            emptyState.hidden = !isEmpty;
        }

        if (taskCount) {
            const remainingCount = tasks.filter(
                (task) => !task.completed
            ).length;

            taskCount.textContent =
                `${remainingCount} ${remainingCount === 1
                    ? "remaining"
                    : "remaining"}`;
        }

        const homeTasksList = document.getElementById("home-tasks-list");

        if (homeTasksList && homeTasks.length === 0) {
            const finishedMessage = document.createElement("div");
            finishedMessage.className = "empty-state";

            const heading = document.createElement("h3");
            heading.textContent = "You are caught up";

            const description = document.createElement("p");
            description.textContent =
                "Add another task whenever you need it.";

            finishedMessage.append(heading, description);
            homeTasksList.append(finishedMessage);
        }
    }

    function reload() {
        tasks = RocketStorage.getTasks();
        sortTasks();
        render();
    }

    return Object.freeze({
        initialize,
        addTask,
        reload,
        render
    });
})();
