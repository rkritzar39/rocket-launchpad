"use strict";

const RocketLinks = (() => {
    let applications = [];
    let searchQuery = "";
    let categoryFilter = "all";
    let currentLayout = "grid";

    function initialize() {
        applications = RocketStorage.getApplications();

        const settings = RocketStorage.getSettings();
        currentLayout =
            settings.applicationLayout === "list" ? "list" : "grid";

        render();
    }

    function createId() {
        if (
            typeof crypto !== "undefined" &&
            typeof crypto.randomUUID === "function"
        ) {
            return crypto.randomUUID();
        }

        return `app-${Date.now()}-${Math.random()
            .toString(16)
            .slice(2)}`;
    }

    function cleanText(value, maximumLength) {
        return String(value ?? "")
            .trim()
            .replace(/\s+/g, " ")
            .slice(0, maximumLength);
    }

    function normalizeUrl(value) {
        const trimmedValue = String(value ?? "").trim();

        if (!trimmedValue) {
            throw new Error("Enter a website address.");
        }

        const valueWithProtocol = /^https?:\/\//i.test(trimmedValue)
            ? trimmedValue
            : `https://${trimmedValue}`;

        let parsedUrl;

        try {
            parsedUrl = new URL(valueWithProtocol);
        } catch {
            throw new Error("Enter a valid website address.");
        }

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
            throw new Error(
                "Only HTTP and HTTPS website addresses are supported."
            );
        }

        return parsedUrl.href;
    }

    function save() {
        RocketStorage.saveApplications(applications);
    }

    function addApplication(applicationData) {
        const name = cleanText(applicationData.name, 60);
        const category =
            cleanText(applicationData.category, 30) || "Personal";

        if (!name) {
            throw new Error("Enter an application name.");
        }

        const application = {
            id: createId(),
            name,
            url: normalizeUrl(applicationData.url),
            category,
            icon: cleanText(applicationData.icon, 4) || "🔗",
            color: cleanText(applicationData.color, 20) || "blue",
            favorite: Boolean(applicationData.favorite),
            custom: true,
            openCount: 0,
            lastOpenedAt: null
        };

        applications.push(application);
        save();
        render();

        return application;
    }

    function updateApplication(applicationId, applicationData) {
        const index = applications.findIndex(
            (application) => application.id === applicationId
        );

        if (index === -1) {
            throw new Error("The application could not be found.");
        }

        const name = cleanText(applicationData.name, 60);
        const category =
            cleanText(applicationData.category, 30) || "Personal";

        if (!name) {
            throw new Error("Enter an application name.");
        }

        applications[index] = {
            ...applications[index],
            name,
            url: normalizeUrl(applicationData.url),
            category,
            icon: cleanText(applicationData.icon, 4) || "🔗",
            color: cleanText(applicationData.color, 20) || "blue",
            favorite: Boolean(applicationData.favorite)
        };

        save();
        render();

        return applications[index];
    }

    function getApplication(applicationId) {
        return applications.find(
            (application) => application.id === applicationId
        );
    }

    function removeApplication(applicationId) {
        const application = getApplication(applicationId);

        if (!application) {
            return false;
        }

        const approved = window.confirm(
            `Remove "${application.name}" from Rocket Launchpad?`
        );

        if (!approved) {
            return false;
        }

        applications = applications.filter(
            (item) => item.id !== applicationId
        );

        save();
        render();

        return true;
    }

    function toggleFavorite(applicationId) {
        applications = applications.map((application) => {
            if (application.id !== applicationId) {
                return application;
            }

            return {
                ...application,
                favorite: !application.favorite
            };
        });

        save();
        render();
    }

    function recordOpen(applicationId) {
        applications = applications.map((application) => {
            if (application.id !== applicationId) {
                return application;
            }

            return {
                ...application,
                openCount: Number(application.openCount || 0) + 1,
                lastOpenedAt: new Date().toISOString()
            };
        });

        save();
        render();
    }

    function setSearch(value) {
        searchQuery = String(value ?? "").trim().toLowerCase();
        render();
    }

    function setCategory(value) {
        categoryFilter = String(value ?? "all");
        render();
    }

    function clearFilters() {
        searchQuery = "";
        categoryFilter = "all";
        render();
    }

    function setLayout(layout) {
        currentLayout = layout === "list" ? "list" : "grid";

        const settings = RocketStorage.getSettings();
        settings.applicationLayout = currentLayout;
        RocketStorage.saveSettings(settings);

        render();
    }

    function getFilteredApplications() {
        return applications.filter((application) => {
            const matchesSearch =
                !searchQuery ||
                [
                    application.name,
                    application.category,
                    application.url
                ]
                    .join(" ")
                    .toLowerCase()
                    .includes(searchQuery);

            const matchesCategory =
                categoryFilter === "all" ||
                (categoryFilter === "favorites" &&
                    application.favorite) ||
                application.category === categoryFilter;

            return matchesSearch && matchesCategory;
        });
    }

    function createCard(application, allowEditing = true) {
        const card = document.createElement("article");
        card.className = "application-card";

        const top = document.createElement("div");
        top.className = "application-card__top";

        const icon = document.createElement("span");
        icon.className =
            `application-card__icon ` +
            `application-card__icon--${application.color || "blue"}`;

        icon.setAttribute("aria-hidden", "true");
        icon.textContent = application.icon || "🔗";

        const actions = document.createElement("div");
        actions.className = "application-card__actions";

        const favoriteButton = document.createElement("button");
        favoriteButton.className = application.favorite
            ? "card-action-button card-action-button--favorite"
            : "card-action-button";

        favoriteButton.type = "button";
        favoriteButton.title = application.favorite
            ? "Remove from favorites"
            : "Add to favorites";

        favoriteButton.setAttribute(
            "aria-label",
            application.favorite
                ? `Remove ${application.name} from favorites`
                : `Add ${application.name} to favorites`
        );

        favoriteButton.textContent = application.favorite ? "★" : "☆";

        favoriteButton.addEventListener("click", () => {
            toggleFavorite(application.id);
        });

        actions.append(favoriteButton);

        if (allowEditing) {
            const editButton = document.createElement("button");
            editButton.className = "card-action-button";
            editButton.type = "button";
            editButton.title = "Edit application";
            editButton.setAttribute(
                "aria-label",
                `Edit ${application.name}`
            );
            editButton.textContent = "✎";

            editButton.addEventListener("click", () => {
                if (
                    typeof RocketApp !== "undefined" &&
                    typeof RocketApp.openApplicationDialog === "function"
                ) {
                    RocketApp.openApplicationDialog(application.id);
                }
            });

            const deleteButton = document.createElement("button");
            deleteButton.className = "card-action-button";
            deleteButton.type = "button";
            deleteButton.title = "Remove application";
            deleteButton.setAttribute(
                "aria-label",
                `Remove ${application.name}`
            );
            deleteButton.textContent = "×";

            deleteButton.addEventListener("click", () => {
                const removed = removeApplication(application.id);

                if (
                    removed &&
                    typeof RocketApp !== "undefined"
                ) {
                    RocketApp.showToast("Application removed.");
                }
            });

            actions.append(editButton, deleteButton);
        }

        top.append(icon, actions);

        const body = document.createElement("div");
        body.className = "application-card__body";

        const link = document.createElement("a");
        link.className = "application-card__link";
        link.href = application.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.title = `Open ${application.name} in a new tab`;

        link.addEventListener("click", () => {
            recordOpen(application.id);
        });

        const name = document.createElement("span");
        name.className = "application-card__name";
        name.textContent = application.name;

        const externalIcon = document.createElement("span");
        externalIcon.className = "application-card__external";
        externalIcon.setAttribute("aria-hidden", "true");
        externalIcon.textContent = "↗";

        link.append(name, externalIcon);

        const category = document.createElement("span");
        category.className = "application-card__category";
        category.textContent = application.category || "Personal";

        body.append(link, category);
        card.append(top, body);

        return card;
    }

    function renderCards(
        containerId,
        emptyId,
        items,
        allowEditing = true
    ) {
        const container = document.getElementById(containerId);
        const emptyState = document.getElementById(emptyId);

        if (!container || !emptyState) {
            return;
        }

        container.replaceChildren();

        items.forEach((application) => {
            container.append(createCard(application, allowEditing));
        });

        const isEmpty = items.length === 0;
        container.hidden = isEmpty;
        emptyState.hidden = !isEmpty;
    }

    function renderCategories() {
        const categorySelect = document.getElementById("category-filter");

        if (!categorySelect) {
            return;
        }

        const selectedValue = categoryFilter;

        const categories = [
            ...new Set(
                applications
                    .map((application) => application.category)
                    .filter(Boolean)
            )
        ].sort((first, second) => first.localeCompare(second));

        categorySelect.replaceChildren();

        const allOption = new Option("All categories", "all");
        const favoritesOption = new Option("Favorites", "favorites");

        categorySelect.add(allOption);
        categorySelect.add(favoritesOption);

        categories.forEach((category) => {
            categorySelect.add(new Option(category, category));
        });

        const availableValues = Array.from(categorySelect.options).map(
            (option) => option.value
        );

        categorySelect.value = availableValues.includes(selectedValue)
            ? selectedValue
            : "all";
    }

    function renderLayoutControls() {
        const allAppsGrid = document.getElementById("all-apps-grid");
        const gridButton = document.getElementById("grid-view-button");
        const listButton = document.getElementById("list-view-button");
        const defaultLayoutSelect = document.getElementById(
            "default-layout-select"
        );

        allAppsGrid?.classList.toggle(
            "application-grid--list",
            currentLayout === "list"
        );

        gridButton?.classList.toggle(
            "view-toggle__button--active",
            currentLayout === "grid"
        );

        listButton?.classList.toggle(
            "view-toggle__button--active",
            currentLayout === "list"
        );

        if (defaultLayoutSelect) {
            defaultLayoutSelect.value = currentLayout;
        }
    }

    function render() {
        renderCategories();

        const favorites = applications
            .filter((application) => application.favorite)
            .slice(0, 6);

        const recent = applications
            .filter((application) => application.lastOpenedAt)
            .sort(
                (first, second) =>
                    new Date(second.lastOpenedAt).getTime() -
                    new Date(first.lastOpenedAt).getTime()
            )
            .slice(0, 4);

        const filteredApplications = getFilteredApplications();

        renderCards(
            "favorite-apps-grid",
            "favorite-apps-empty",
            favorites,
            false
        );

        renderCards(
            "recent-apps-grid",
            "recent-apps-empty",
            recent,
            false
        );

        renderCards(
            "all-apps-grid",
            "all-apps-empty",
            filteredApplications,
            true
        );

        const resultCount = document.getElementById(
            "applications-result-count"
        );

        if (resultCount) {
            const count = filteredApplications.length;

            resultCount.textContent =
                `${count} ${count === 1
                    ? "application"
                    : "applications"}`;
        }

        renderLayoutControls();
    }

    function reload() {
        applications = RocketStorage.getApplications();

        const settings = RocketStorage.getSettings();
        currentLayout =
            settings.applicationLayout === "list" ? "list" : "grid";

        render();
    }

    return Object.freeze({
        initialize,
        addApplication,
        updateApplication,
        getApplication,
        setSearch,
        setCategory,
        clearFilters,
        setLayout,
        reload,
        render
    });
})();
