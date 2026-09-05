"use strict";

const RocketTasks = (() => {
    let tasks = [];
    let currentFilter = "all";

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

        return `task-${Date.now()}-${Math.random()
            .toString(16)
            .slice(2)}`;
    }

    function cleanText(value, maximumLength) {
        return String(value ?? "")
            .trim()
            .replace(/\s+/g, " ")
            .slice(0, maximumLength);
    }

    function addTask(taskData) {
        const title = cleanText(taskData.title, 120);
        const subject = cleanText(taskData.subject, 60);
        const dueDate = cleanText(taskData.dueDate, 10);
        const priority = ["low", "normal", "high"].includes(
            taskData.priority
        )
            ? taskData.priority
            : "normal";

        if (!title) {
            throw new Error("Enter a task name.");
        }

        if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
            throw new Error("Enter a valid due date.");
        }

        const task = {
            id: createId(),
            title,
            subject,
            dueDate,
            priority,
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.push(task);
        sortTasks();
        saveAndRender();

        return task;
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

    function setFilter(filter) {
        currentFilter = [
            "all",
            "active",
            "completed",
            "overdue"
        ].includes(filter)
            ? filter
            : "all";

        render();
    }

    function isOverdue(task) {
        if (!task.dueDate || task.completed) {
            return false;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dueDate = new Date(`${task.dueDate}T00:00:00`);

        return dueDate.getTime() < today.getTime();
    }

    function getFilteredTasks() {
        if (currentFilter === "active") {
            return tasks.filter((task) => !task.completed);
        }

        if (currentFilter === "completed") {
            return tasks.filter((task) => task.completed);
        }

        if (currentFilter === "overdue") {
            return tasks.filter(isOverdue);
        }

        return [...tasks];
    }

    function sortTasks() {
        const priorityOrder = {
            high: 0,
            normal: 1,
            low: 2
        };

        tasks.sort((first, second) => {
            if (first.completed !== second.completed) {
                return Number(first.completed) - Number(second.completed);
            }

            if (first.dueDate && second.dueDate) {
                const dateComparison = first.dueDate.localeCompare(
                    second.dueDate
                );

                if (dateComparison !== 0) {
                    return dateComparison;
                }
            } else if (first.dueDate) {
                return -1;
            } else if (second.dueDate) {
                return 1;
            }

            return (
                priorityOrder[first.priority] -
                priorityOrder[second.priority]
            );
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

        const parsedDate = new Date(`${dateString}T00:00:00`);

        if (Number.isNaN(parsedDate.getTime())) {
            return "No due date";
        }

        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        }).format(parsedDate);
    }

    function formatPriority(priority) {
        if (priority === "high") {
            return "High priority";
        }

        if (priority === "low") {
            return "Low priority";
        }

        return "Normal priority";
    }

    function createTaskItem(task) {
        const taskItem = document.createElement("article");

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

        const metadata = document.createElement("div");
        metadata.className = "task-item__metadata";

        if (task.subject) {
            const subject = document.createElement("span");
            subject.textContent = task.subject;
            metadata.append(subject);
        }

        const dueDate = document.createElement("span");
        dueDate.className = isOverdue(task)
            ? "task-item__due task-item__due--overdue"
            : "task-item__due";

        dueDate.textContent = isOverdue(task)
            ? `Overdue: ${formatDueDate(task.dueDate)}`
            : formatDueDate(task.dueDate);

        const priority = document.createElement("span");
        priority.className =
            `task-item__priority ` +
            `task-item__priority--${task.priority}`;

        priority.textContent = formatPriority(task.priority);

        metadata.append(dueDate, priority);
        content.append(title, metadata);

        const deleteButton = document.createElement("button");
        deleteButton.className = "task-item__delete";
        deleteButton.type = "button";
        deleteButton.title = "Delete task";
        deleteButton.setAttribute(
            "aria-label",
            `Delete ${task.title}`
        );
        deleteButton.textContent = "×";

        deleteButton.addEventListener("click", () => {
            const removed = removeTask(task.id);

            if (
                removed &&
                typeof RocketApp !== "undefined"
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

        const filteredTasks = getFilteredTasks();

        renderList("home-tasks-list", homeTasks);
        renderList("all-tasks-list", filteredTasks);

        const homeList = document.getElementById("home-tasks-list");
        const homeEmpty = document.getElementById("home-tasks-empty");

        if (homeList && homeEmpty) {
            const isEmpty = homeTasks.length === 0;
            homeList.hidden = isEmpty;
            homeEmpty.hidden = !isEmpty;
        }

        const allList = document.getElementById("all-tasks-list");
        const allEmpty = document.getElementById("all-tasks-empty");

        if (allList && allEmpty) {
            const isEmpty = filteredTasks.length === 0;
            allList.hidden = isEmpty;
            allEmpty.hidden = !isEmpty;
        }

        const remainingCount = tasks.filter(
            (task) => !task.completed
        ).length;

        const summaryBadge = document.getElementById(
            "task-summary-badge"
        );

        if (summaryBadge) {
            summaryBadge.textContent =
                `${remainingCount} remaining`;
        }

        const sidebarCount = document.getElementById(
            "sidebar-task-count"
        );

        if (sidebarCount) {
            sidebarCount.textContent = String(remainingCount);
            sidebarCount.hidden = remainingCount === 0;
        }

        const filterSelect = document.getElementById("task-filter");

        if (filterSelect) {
            filterSelect.value = currentFilter;
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
        setFilter,
        reload,
        render
    });
})();
