"use strict";

const RocketApp = (() => {
    let currentView = "home";
    let toastTimeoutId = null;

    function initialize() {
        initializeTheme();
        initializeNavigation();
        initializeSidebar();
        initializeSearch();
        initializeLinkDialog();
        initializeTaskForm();
        initializeSettings();

        RocketLinks.initialize();
        RocketTasks.initialize();
    }

    function initializeTheme() {
        const settings = RocketStorage.getSettings();
        const savedTheme = settings.theme === "dark" ? "dark" : "light";

        applyTheme(savedTheme);
    }

    function applyTheme(theme) {
        const normalizedTheme = theme === "dark" ? "dark" : "light";

        document.documentElement.dataset.theme = normalizedTheme;

        const settings = RocketStorage.getSettings();
        settings.theme = normalizedTheme;
        RocketStorage.saveSettings(settings);

        const themeIcon = document.getElementById("theme-button-icon");
        const themeButton = document.getElementById("theme-button");

        if (themeIcon) {
            themeIcon.textContent =
                normalizedTheme === "dark" ? "☀️" : "🌙";
        }

        if (themeButton) {
            themeButton.setAttribute(
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
        const navigationButtons = document.querySelectorAll("[data-view]");
        const viewButtons = document.querySelectorAll("[data-open-view]");

        navigationButtons.forEach((button) => {
            button.addEventListener("click", () => {
                openView(button.dataset.view);
            });
        });

        viewButtons.forEach((button) => {
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

        document.querySelectorAll("[data-view-panel]").forEach((panel) => {
            const isActive = panel.dataset.viewPanel === viewName;

            panel.classList.toggle("view--active", isActive);
            panel.hidden = !isActive;
        });

        document.querySelectorAll("[data-view]").forEach((button) => {
            const isActive = button.dataset.view === viewName;

            button.classList.toggle(
                "navigation__item--active",
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

        const mainContent = document.getElementById("main-content");

        if (mainContent) {
            mainContent.focus({
                preventScroll: true
            });
        }
    }

    function initializeSidebar() {
        const menuButton = document.getElementById("menu-button");
        const overlay = document.getElementById("sidebar-overlay");

        menuButton?.addEventListener("click", toggleSidebar);
        overlay?.addEventListener("click", closeSidebar);

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

        const shouldOpen = !sidebar.classList.contains("sidebar--open");

        sidebar.classList.toggle("sidebar--open", shouldOpen);
        overlay.hidden = !shouldOpen;
        menuButton.setAttribute("aria-expanded", String(shouldOpen));
    }

    function closeSidebar() {
        const sidebar = document.getElementById("sidebar");
        const overlay = document.getElementById("sidebar-overlay");
        const menuButton = document.getElementById("menu-button");

        sidebar?.classList.remove("sidebar--open");

        if (overlay) {
            overlay.hidden = true;
        }

        menuButton?.setAttribute("aria-expanded", "false");
    }

    function initializeSearch() {
        const desktopSearch = document.getElementById("desktop-search");
        const mobileSearch = document.getElementById("mobile-search");
        const clearSearchButton = document.getElementById(
            "clear-search-button"
        );

        function updateSearch(value, source) {
            const otherInput =
                source === desktopSearch ? mobileSearch : desktopSearch;

            if (otherInput) {
                otherInput.value = value;
            }

            RocketLinks.setSearchQuery(value);
        }

        desktopSearch?.addEventListener("input", (event) => {
            updateSearch(event.target.value, desktopSearch);
        });

        mobileSearch?.addEventListener("input", (event) => {
            updateSearch(event.target.value, mobileSearch);
        });

        clearSearchButton?.addEventListener("click", () => {
            if (desktopSearch) {
                desktopSearch.value = "";
            }

            if (mobileSearch) {
                mobileSearch.value = "";
            }

            RocketLinks.clearSearch();
        });
    }

    function initializeLinkDialog() {
        const dialog = document.getElementById("link-dialog");
        const form = document.getElementById("link-form");
        const addLinkButton = document.getElementById("add-link-button");
        const heroAddLinkButton = document.getElementById(
            "hero-add-link-button"
        );

        const closeButton = document.getElementById(
            "close-link-dialog-button"
        );

        const cancelButton = document.getElementById("cancel-link-button");

        addLinkButton?.addEventListener("click", openLinkDialog);
        heroAddLinkButton?.addEventListener("click", openLinkDialog);
        closeButton?.addEventListener("click", closeLinkDialog);
        cancelButton?.addEventListener("click", closeLinkDialog);

        document.querySelectorAll("[data-add-link]").forEach((button) => {
            button.addEventListener("click", openLinkDialog);
        });

        dialog?.addEventListener("click", (event) => {
            if (event.target === dialog) {
                closeLinkDialog();
            }
        });

        form?.addEventListener("submit", handleLinkFormSubmission);
    }

    function openLinkDialog() {
        const dialog = document.getElementById("link-dialog");
        const form = document.getElementById("link-form");
        const errorMessage = document.getElementById("link-form-error");

        form?.reset();

        if (errorMessage) {
            errorMessage.hidden = true;
            errorMessage.textContent = "";
        }

        if (dialog && typeof dialog.showModal === "function") {
            dialog.showModal();

            window.setTimeout(() => {
                document.getElementById("link-name")?.focus();
            }, 20);
        }
    }

    function closeLinkDialog() {
        const dialog = document.getElementById("link-dialog");

        if (dialog?.open) {
            dialog.close();
        }
    }

    function handleLinkFormSubmission(event) {
        event.preventDefault();

        const errorMessage = document.getElementById("link-form-error");
        const nameInput = document.getElementById("link-name");
        const urlInput = document.getElementById("link-url");
        const categoryInput = document.getElementById("link-category");
        const iconInput = document.getElementById("link-icon");

        try {
            RocketLinks.addLink({
                name: nameInput?.value ?? "",
                url: urlInput?.value ?? "",
                category: categoryInput?.value ?? "Personal",
                icon: iconInput?.value ?? "🔗"
            });

            closeLinkDialog();
            showToast("Link added to your launchpad.");
        } catch (error) {
            if (errorMessage) {
                errorMessage.textContent =
                    error instanceof Error
                        ? error.message
                        : "The link could not be added.";

                errorMessage.hidden = false;
            }
        }
    }

    function initializeTaskForm() {
        const form = document.getElementById("task-form");

        form?.addEventListener("submit", (event) => {
            event.preventDefault();

            const titleInput = document.getElementById("task-title");
            const dueDateInput = document.getElementById("task-due-date");

            try {
                RocketTasks.addTask(
                    titleInput?.value ?? "",
                    dueDateInput?.value ?? ""
                );

                form.reset();
                titleInput?.focus();
                showToast("Task added.");
            } catch (error) {
                showToast(
                    error instanceof Error
                        ? error.message
                        : "The task could not be added."
                );
            }
        });
    }

    function initializeSettings() {
        const themeButton = document.getElementById("theme-button");
        const settingsThemeButton = document.getElementById(
            "settings-theme-button"
        );

        const exportButton = document.getElementById(
            "export-data-button"
        );

        const importButton = document.getElementById(
            "import-data-button"
        );

        const importInput = document.getElementById(
            "import-data-input"
        );

        const resetButton = document.getElementById(
            "reset-data-button"
        );

        themeButton?.addEventListener("click", toggleTheme);
        settingsThemeButton?.addEventListener("click", toggleTheme);
        exportButton?.addEventListener("click", exportDashboard);

        importButton?.addEventListener("click", () => {
            importInput?.click();
        });

        importInput?.addEventListener("change", handleImport);
        resetButton?.addEventListener("click", resetDashboard);
    }

    function exportDashboard() {
        const backupData = RocketStorage.exportData();
        const serializedData = JSON.stringify(backupData, null, 2);
        const dataBlob = new Blob([serializedData], {
            type: "application/json"
        });

        const downloadUrl = URL.createObjectURL(dataBlob);
        const downloadLink = document.createElement("a");
        const dateStamp = new Date().toISOString().slice(0, 10);

        downloadLink.href = downloadUrl;
        downloadLink.download =
            `rocket-launchpad-backup-${dateStamp}.json`;

        document.body.append(downloadLink);
        downloadLink.click();
        downloadLink.remove();

        URL.revokeObjectURL(downloadUrl);
        showToast("Dashboard backup downloaded.");
    }

    async function handleImport(event) {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        try {
            const fileContents = await file.text();
            const importedData = JSON.parse(fileContents);

            RocketStorage.importData(importedData);
            reloadDashboardData();

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
            "Reset all links, tasks, and settings to their default values? " +
            "This cannot be undone unless you exported a backup."
        );

        if (!approved) {
            return;
        }

        RocketStorage.resetAll();
        reloadDashboardData();
        applyTheme("light");

        showToast("Dashboard reset.");
    }

    function reloadDashboardData() {
        RocketLinks.reload();
        RocketTasks.reload();

        const settings = RocketStorage.getSettings();
        applyTheme(settings.theme);
    }

    function showToast(message) {
        const toast = document.getElementById("toast");

        if (!toast) {
            return;
        }

        if (toastTimeoutId !== null) {
            window.clearTimeout(toastTimeoutId);
        }

        toast.textContent = String(message);
        toast.hidden = false;

        toastTimeoutId = window.setTimeout(() => {
            toast.hidden = true;
            toast.textContent = "";
            toastTimeoutId = null;
        }, 3200);
    }

    document.addEventListener("DOMContentLoaded", initialize);

    return Object.freeze({
        openView,
        showToast,
        getCurrentView() {
            return currentView;
        }
    });
})();
