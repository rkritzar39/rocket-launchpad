"use strict";

const RocketLinks = (() => {
    let links = [];
    let searchQuery = "";

    function initialize() {
        links = RocketStorage.getLinks();
        render();
    }

    function createId() {
        if (
            typeof crypto !== "undefined" &&
            typeof crypto.randomUUID === "function"
        ) {
            return crypto.randomUUID();
        }

        return `link-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }

    function normalizeUrl(value) {
        const trimmedValue = value.trim();

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
            throw new Error("Only HTTP and HTTPS links are supported.");
        }

        return parsedUrl.href;
    }

    function cleanText(value, maximumLength) {
        return String(value ?? "")
            .trim()
            .replace(/\s+/g, " ")
            .slice(0, maximumLength);
    }

    function addLink(linkData) {
        const name = cleanText(linkData.name, 60);
        const category = cleanText(linkData.category, 30) || "Personal";
        const icon = cleanText(linkData.icon, 4) || "🔗";

        if (!name) {
            throw new Error("Enter a name for this link.");
        }

        const url = normalizeUrl(linkData.url);

        const newLink = {
            id: createId(),
            name,
            url,
            category,
            icon,
            protected: false
        };

        links.push(newLink);
        RocketStorage.saveLinks(links);
        render();

        return newLink;
    }

    function removeLink(linkId) {
        const link = links.find((item) => item.id === linkId);

        if (!link) {
            return false;
        }

        const approved = window.confirm(
            `Remove "${link.name}" from your launchpad?`
        );

        if (!approved) {
            return false;
        }

        links = links.filter((item) => item.id !== linkId);
        RocketStorage.saveLinks(links);
        render();

        return true;
    }

    function setSearchQuery(value) {
        searchQuery = String(value ?? "").trim().toLowerCase();
        render();
    }

    function getFilteredLinks() {
        if (!searchQuery) {
            return [...links];
        }

        return links.filter((link) => {
            const searchableText = [
                link.name,
                link.category,
                link.url
            ]
                .join(" ")
                .toLowerCase();

            return searchableText.includes(searchQuery);
        });
    }

    function createLinkCard(link) {
        const card = document.createElement("article");
        card.className = "link-card";

        const top = document.createElement("div");
        top.className = "link-card__top";

        const icon = document.createElement("span");
        icon.className = "link-card__icon";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = link.icon || "🔗";

        const deleteButton = document.createElement("button");
        deleteButton.className = "link-card__delete";
        deleteButton.type = "button";
        deleteButton.setAttribute(
            "aria-label",
            `Remove ${link.name} from the launchpad`
        );
        deleteButton.title = "Remove link";
        deleteButton.textContent = "×";

        deleteButton.addEventListener("click", () => {
            const removed = removeLink(link.id);

            if (
                removed &&
                typeof RocketApp !== "undefined" &&
                typeof RocketApp.showToast === "function"
            ) {
                RocketApp.showToast("Link removed.");
            }
        });

        top.append(icon, deleteButton);

        const content = document.createElement("div");
        content.className = "link-card__content";

        const anchor = document.createElement("a");
        anchor.href = link.url;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        anchor.title = `Open ${link.name} in a new tab`;

        const name = document.createElement("strong");
        name.textContent = link.name;

        const externalIcon = document.createElement("span");
        externalIcon.className = "link-card__external-icon";
        externalIcon.setAttribute("aria-hidden", "true");
        externalIcon.textContent = "↗";

        anchor.append(name, externalIcon);

        const category = document.createElement("span");
        category.className = "link-card__category";
        category.textContent = link.category || "Personal";

        content.append(anchor, category);
        card.append(top, content);

        return card;
    }

    function renderGrid(gridId, emptyStateId, maximumItems = null) {
        const grid = document.getElementById(gridId);
        const emptyState = document.getElementById(emptyStateId);

        if (!grid || !emptyState) {
            return;
        }

        grid.replaceChildren();

        let visibleLinks = getFilteredLinks();

        if (Number.isInteger(maximumItems)) {
            visibleLinks = visibleLinks.slice(0, maximumItems);
        }

        visibleLinks.forEach((link) => {
            grid.append(createLinkCard(link));
        });

        const isEmpty = visibleLinks.length === 0;

        grid.hidden = isEmpty;
        emptyState.hidden = !isEmpty;
    }

    function render() {
        renderGrid("quick-links-grid", "quick-links-empty", 6);
        renderGrid("all-links-grid", "all-links-empty");
    }

    function reload() {
        links = RocketStorage.getLinks();
        render();
    }

    function clearSearch() {
        searchQuery = "";
        render();
    }

    function getSearchQuery() {
        return searchQuery;
    }

    return Object.freeze({
        initialize,
        addLink,
        setSearchQuery,
        clearSearch,
        getSearchQuery,
        reload,
        render
    });
})();
