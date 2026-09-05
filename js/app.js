"use strict";

const RocketApp = (() => {
    let currentView = "home";
    let toastTimeout = null;

    function initialize() {
        initializeTheme();
        initializeNavigation();
        initializeSidebar();
        initializeSearch();
        initializeApplicationControls();
        initializeTaskControls();
        initializeSettings();

        RocketLinks.initialize();
        RocketTasks.initialize();

        renderClasses();
    }

    function initializeTheme() {
        const settings = RocketStorage.getSettings();
        applyTheme(settings.theme);
    }

    function applyTheme(theme) {
        const normalizedTheme = theme === "dark" ? "dark" : "light";

        document.documentElement.dataset.theme = normalizedTheme;

        const settings = RocketStorage.getSettings();
        settings.theme = normalizedTheme;
        RocketStorage.saveSettings(settings);

        const icon = document.getElementById("theme-button-icon");
        const button = document.getElementById("theme-button");

        if (icon) {
            icon.textContent =
                normalizedTheme === "dark" ? "☀️" : "🌙";
        }

        if (button) {
            button.setAttribute(
                "aria-label",
                normalizedTheme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            );
        }
    }

    function toggleTheme() {
        const currentTheme =
            document.documentElement.dataset.theme === "dark"
                ? "dark"
                : "light";

        applyTheme(currentTheme === "dark" ? "light" : "dark");
        showToast("Theme updated.");
    }

    function initializeNavigation() {
        document.querySelectorAll("[data-view]").forEach((button) => {
            button.addEventListener("click", () => {
                openView(button.dataset.view);
            });
        });

        document
            .querySelectorAll("[data-open-view]")
            .forEach((button) => {
                button.addEventListener("click", () => {
                    openView(button.dataset.openView);
                });
            });
    }

    function openView(viewName) {
        const requestedPanel = document.querySelector(
            `[data-view-panel="${viewName}"]`
        );

        if (!requestedPanel) {
            return;
        }

        currentView = viewName;

        document
            .querySelectorAll("[data-view-panel]")
            .forEach((panel) => {
                const isActive =
                    panel.dataset.viewPanel === viewName;

                panel.classList.toggle("view--active", isActive);
                panel.hidden = !isActive;
            });

        document.querySelectorAll("[data-view]").forEach((button) => {
            const isActive = button.dataset.view === viewName;

            button.classList.toggle(
                "navigation-item--active",
                isActive
            );

            if (isActive) {
                button.setAttribute("aria-current", "page");
            } else {
                button.removeAttribute("aria-current");
            }
        });

        closeSidebar();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        document.getElementById("main-content")?.focus({
            preventScroll: true
        });
    }

    function initializeSidebar() {
        document
            .getElementById("menu-button")
            ?.addEventListener("click", toggleSidebar);

        document
            .getElementById("sidebar-overlay")
            ?.addEventListener("click", closeSidebar);

        window.addEventListener("resize", () => {
            if (window.innerWidth > 980) {
                closeSidebar();
            }
        });
    }

    function toggleSidebar() {
        const sidebar = document.getElementById("sidebar");
        const overlay = document.getElementById("sidebar-overlay");
        const menuButton = document.getElementById("menu-button");

        if (!sidebar || !overlay || !menuButton) {
            return;
        }

        const shouldOpen = !sidebar.classList.contains(
            "sidebar--open"
        );

        sidebar.classList.toggle("sidebar--open", shouldOpen);
        overlay.hidden = !shouldOpen;
        menuButton.setAttribute(
            "aria-expanded",
            String(shouldOpen)
        );
    }

    function closeSidebar() {
        document
            .getElementById("sidebar")
            ?.classList.remove("sidebar--open");

        const overlay = document.getElementById("sidebar-overlay");

        if (overlay) {
            overlay.hidden = true;
        }

        document
            .getElementById("menu-button")
            ?.setAttribute("aria-expanded", "false");
    }

    function initializeSearch() {
        const desktopSearch = document.getElementById(
            "desktop-search"
        );

        const mobileSearch = document.getElementById(
            "mobile-search-input"
        );

        const applicationsSearch = document.getElementById(
            "applications-search"
        );

        const searchInputs = [
            desktopSearch,
            mobileSearch,
            applicationsSearch
        ].filter(Boolean);

        function synchronizeSearch(value, sourceInput) {
            searchInputs.forEach((input) => {
                if (input !== sourceInput) {
                    input.value = value;
                }
            });

            RocketLinks.setSearch(value);

            if (value.trim() && currentView === "home") {
                openView("applications");
            }
        }

        searchInputs.forEach((input) => {
            input.addEventListener("input", (event) => {
                synchronizeSearch(event.target.value, input);
            });
        });
    }

    function initializeApplicationControls() {
        document
            .getElementById("add-link-button")
            ?.addEventListener("click", () => {
                openApplicationDialog();
            });

        document.querySelectorAll("[data-add-link]").forEach((button) => {
            button.addEventListener("click", () => {
                openApplicationDialog();
            });
        });

        document
            .getElementById("close-application-dialog-button")
            ?.addEventListener("click", closeApplicationDialog);

        document
            .getElementById("cancel-application-button")
            ?.addEventListener("click", closeApplicationDialog);

        const dialog = document.getElementById(
            "application-dialog"
        );

        dialog?.addEventListener("click", (event) => {
            if (event.target === dialog) {
                closeApplicationDialog();
            }
        });

        document
            .getElementById("application-form")
            ?.addEventListener(
                "submit",
                handleApplicationSubmission
            );

        document
            .getElementById("category-filter")
            ?.addEventListener("change", (event) => {
                RocketLinks.setCategory(event.target.value);
            });

        document
            .getElementById("grid-view-button")
            ?.addEventListener("click", () => {
                RocketLinks.setLayout("grid");
            });

        document
            .getElementById("list-view-button")
            ?.addEventListener("click", () => {
                RocketLinks.setLayout("list");
            });

        document
            .getElementById("clear-app-filters-button")
            ?.addEventListener("click", clearApplicationFilters);
    }

    function openApplicationDialog(applicationId = null) {
        const dialog = document.getElementById(
            "application-dialog"
        );

        const form = document.getElementById("application-form");
        const error = document.getElementById(
            "application-form-error"
        );

        form?.reset();

        if (error) {
            error.hidden = true;
            error.textContent = "";
        }

        const idInput = document.getElementById("application-id");
        const title = document.getElementById(
            "application-dialog-title"
        );

        if (idInput) {
            idInput.value = applicationId || "";
        }

        if (applicationId) {
            const application =
                RocketLinks.getApplication(applicationId);

            if (!application) {
                showToast("The application could not be found.");
                return;
            }

            if (title) {
                title.textContent = "Edit application";
            }

            document.getElementById("application-name").value =
                application.name;

            document.getElementById("application-url").value =
                application.url;

            document.getElementById("application-category").value =
                application.category;

            document.getElementById("application-icon").value =
                application.icon;

            document.getElementById("application-color").value =
                application.color;

            document.getElementById("application-favorite").checked =
                Boolean(application.favorite);
        } else if (title) {
            title.textContent = "Add application";
        }

        if (dialog && typeof dialog.showModal === "function") {
            dialog.showModal();

            window.setTimeout(() => {
                document.getElementById("application-name")?.focus();
            }, 20);
        }
    }

    function closeApplicationDialog() {
        const dialog = document.getElementById(
            "application-dialog"
        );

        if (dialog?.open) {
            dialog.close();
        }
    }

    function handleApplicationSubmission(event) {
        event.preventDefault();

        const error = document.getElementById(
            "application-form-error"
        );

        const applicationData = {
            name:
                document.getElementById("application-name")?.value ??
                "",
            url:
                document.getElementById("application-url")?.value ??
                "",
            category:
                document.getElementById("application-category")
                    ?.value ?? "",
            icon:
                document.getElementById("application-icon")?.value ??
                "🔗",
            color:
                document.getElementById("application-color")?.value ??
                "blue",
            favorite:
                document.getElementById("application-favorite")
                    ?.checked ?? false
        };

        const applicationId =
            document.getElementById("application-id")?.value ?? "";

        try {
            if (applicationId) {
                RocketLinks.updateApplication(
                    applicationId,
                    applicationData
                );

                showToast("Application updated.");
            } else {
                RocketLinks.addApplication(applicationData);
                showToast("Application added.");
            }

            closeApplicationDialog();
        } catch (submissionError) {
            if (error) {
                error.textContent =
                    submissionError instanceof Error
                        ? submissionError.message
                        : "The application could not be saved.";

                error.hidden = false;
            }
        }
    }

    function clearApplicationFilters() {
        const inputs = [
            document.getElementById("desktop-search"),
            document.getElementById("mobile-search-input"),
            document.getElementById("applications-search")
        ];

        inputs.forEach((input) => {
            if (input) {
                input.value = "";
            }
        });

        const categoryFilter = document.getElementById(
            "category-filter"
        );

        if (categoryFilter) {
            categoryFilter.value = "all";
        }

        RocketLinks.clearFilters();
    }

    function initializeTaskControls() {
        document
            .getElementById("task-form")
            ?.addEventListener("submit", handleTaskSubmission);

        document
            .getElementById("task-filter")
            ?.addEventListener("change", (event) => {
                RocketTasks.setFilter(event.target.value);
            });
    }

    function handleTaskSubmission(event) {
        event.preventDefault();

        try {
            RocketTasks.addTask({
                title:
                    document.getElementById("task-title")?.value ??
                    "",
                subject:
                    document.getElementById("task-subject")?.value ??
                    "",
                dueDate:
                    document.getElementById("task-due-date")?.value ??
                    "",
                priority:
                    document.getElementById("task-priority")?.value ??
                    "normal"
            });

            event.target.reset();
            document.getElementById("task-title")?.focus();

            showToast("Task added.");
        } catch (error) {
            showToast(
                error instanceof Error
                    ? error.message
                    : "The task could not be added."
            );
        }
    }

    function initializeSettings() {
        document
            .getElementById("theme-button")
            ?.addEventListener("click", toggleTheme);

        document
            .getElementById("settings-theme-button")
            ?.addEventListener("click", toggleTheme);

        document
            .getElementById("default-layout-select")
            ?.addEventListener("change", (event) => {
                RocketLinks.setLayout(event.target.value);
                showToast("Application layout updated.");
            });

        document
            .getElementById("export-data-button")
            ?.addEventListener("click", exportDashboard);

        const importInput = document.getElementById(
            "import-data-input"
        );

        document
            .getElementById("import-data-button")
            ?.addEventListener("click", () => {
                importInput?.click();
            });

        importInput?.addEventListener("change", importDashboard);

        document
            .getElementById("reset-data-button")
            ?.addEventListener("click", resetDashboard);
    }

    function exportDashboard() {
        const data = RocketStorage.exportData();

        const file = new Blob(
            [JSON.stringify(data, null, 2)],
            {
                type: "application/json"
            }
        );

        const downloadUrl = URL.createObjectURL(file);
        const downloadLink = document.createElement("a");
        const date = new Date().toISOString().slice(0, 10);

        downloadLink.href = downloadUrl;
        downloadLink.download =
            `rocket-launchpad-backup-${date}.json`;

        document.body.append(downloadLink);
        downloadLink.click();
        downloadLink.remove();

        window.setTimeout(() => {
            URL.revokeObjectURL(downloadUrl);
        }, 100);

        showToast("Dashboard backup downloaded.");
    }

    async function importDashboard(event) {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            RocketStorage.importData(data);
            reloadDashboard();

            showToast("Dashboard backup imported.");
        } catch (error) {
            console.error(error);

            showToast(
                error instanceof Error
                    ? error.message
                    : "The backup could not be imported."
            );
        } finally {
            event.target.value = "";
        }
    }

    function resetDashboard() {
        const approved = window.confirm(
            "Reset Rocket Launchpad to its default applications, " +
            "tasks, and settings? This cannot be undone unless you " +
            "exported a backup."
        );

        if (!approved) {
            return;
        }

        RocketStorage.resetAll();
        reloadDashboard();
        showToast("Dashboard reset.");
    }

    function reloadDashboard() {
        RocketLinks.reload();
        RocketTasks.reload();

        const settings = RocketStorage.getSettings();
        applyTheme(settings.theme);
    }

    function renderClasses() {
        const classesGrid = document.getElementById("classes-grid");
        const homeClasses = document.getElementById(
            "home-classes-list"
        );

        if (classesGrid) {
            classesGrid.replaceChildren();
        }

        if (homeClasses) {
            homeClasses.replaceChildren();
        }

        RocketData.classes.forEach((course) => {
            if (classesGrid) {
                classesGrid.append(createClassCard(course));
            }
        });

        RocketData.classes.slice(0, 3).forEach((course) => {
            if (homeClasses) {
                homeClasses.append(createMiniClass(course));
            }
        });

        const classCount = document.getElementById(
            "class-count-stat"
        );

        const meetingCount = document.getElementById(
            "weekly-meeting-stat"
        );

        const campusCount = document.getElementById(
            "campus-class-stat"
        );

        if (classCount) {
            classCount.textContent = String(RocketData.classes.length);
        }

        if (meetingCount) {
            meetingCount.textContent = String(
                RocketData.classes.reduce(
                    (total, course) =>
                        total + course.days.length,
                    0
                )
            );
        }

        if (campusCount) {
            campusCount.textContent = String(
                RocketData.classes.filter(
                    (course) => !course.online
                ).length
            );
        }
    }

    function createMiniClass(course) {
        const item = document.createElement("article");
        item.className = "mini-class";

        const accent = document.createElement("span");
        accent.className = "mini-class__accent";
        accent.style.backgroundColor = course.color;
        accent.setAttribute("aria-hidden", "true");

        const content = document.createElement("div");
        content.className = "mini-class__content";

        const name = document.createElement("strong");
        name.textContent = course.name;

        const details = document.createElement("span");
        details.textContent =
            `${course.code} · ${course.days.join(", ")}`;

        content.append(name, details);

        const time = document.createElement("span");
        time.className = "mini-class__time";
        time.textContent = course.time;

        item.append(accent, content, time);

        return item;
    }

    function createClassCard(course) {
        const card = document.createElement("article");
        card.className = "class-card";

        const accent = document.createElement("span");
        accent.className = "class-card__accent";
        accent.style.backgroundColor = course.color;
        accent.setAttribute("aria-hidden", "true");

        const code = document.createElement("span");
        code.className = "class-card__code";
        code.textContent = course.code;

        const title = document.createElement("h3");
        title.textContent = course.name;

        const details = document.createElement("div");
        details.className = "class-card__details";

        details.append(
            createClassDetail(
                "◷",
                `${course.days.join(", ")} · ${course.time} to ` +
                    `${course.endTime}`
            ),
            createClassDetail("📍", course.location),
            createClassDetail("👤", course.instructor)
        );

        const actions = document.createElement("div");
        actions.className = "class-card__actions";

        const blackboardLink = document.createElement("a");
        blackboardLink.className = "secondary-button";
        blackboardLink.href = course.blackboardUrl;
        blackboardLink.target = "_blank";
        blackboardLink.rel = "noopener noreferrer";
        blackboardLink.textContent = "Open Blackboard";

        actions.append(blackboardLink);

        card.append(accent, code, title, details, actions);

        return card;
    }

    function createClassDetail(iconText, detailText) {
        const detail = document.createElement("div");
        detail.className = "class-detail";

        const icon = document.createElement("span");
        icon.className = "class-detail__icon";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = iconText;

        const text = document.createElement("span");
        text.textContent = detailText;

        detail.append(icon, text);

        return detail;
    }

    function showToast(message) {
        const toast = document.getElementById("toast");

        if (!toast) {
            return;
        }

        if (toastTimeout !== null) {
            window.clearTimeout(toastTimeout);
        }

        toast.textContent = String(message);
        toast.hidden = false;

        toastTimeout = window.setTimeout(() => {
            toast.hidden = true;
            toast.textContent = "";
            toastTimeout = null;
        }, 3200);
    }

    document.addEventListener("DOMContentLoaded", initialize);

    return Object.freeze({
        openView,
        openApplicationDialog,
        showToast,
        getCurrentView() {
            return currentView;
        }
    });
})();
