"use strict";

const RocketStorage = (() => {
    const STORAGE_KEYS = Object.freeze({
        links: "rocketLaunchpad.links",
        tasks: "rocketLaunchpad.tasks",
        settings: "rocketLaunchpad.settings"
    });

    const DEFAULT_LINKS = Object.freeze([
        {
            id: "default-myut",
            name: "myUT Portal",
            url: "https://myut.utoledo.edu/",
            category: "University",
            icon: "🎓",
            protected: true
        },
        {
            id: "default-blackboard",
            name: "Blackboard",
            url: "https://blackboard.utdl.edu/",
            category: "Classes",
            icon: "📚",
            protected: true
        },
        {
            id: "default-email",
            name: "Rocket Email",
            url: "https://outlook.office.com/",
            category: "Communication",
            icon: "✉️",
            protected: true
        },
        {
            id: "default-calendar",
            name: "Academic Calendar",
            url: "https://www.utoledo.edu/offices/provost/calendar/",
            category: "Planning",
            icon: "📅",
            protected: true
        },
        {
            id: "default-library",
            name: "University Libraries",
            url: "https://www.utoledo.edu/library/",
            category: "University",
            icon: "📖",
            protected: true
        },
        {
            id: "default-map",
            name: "Campus Map",
            url: "https://www.utoledo.edu/campus/directions/",
            category: "University",
            icon: "📍",
            protected: true
        }
    ]);

    const DEFAULT_TASKS = Object.freeze([
        {
            id: "default-task-blackboard",
            title: "Review Blackboard announcements",
            dueDate: "",
            completed: false
        },
        {
            id: "default-task-email",
            title: "Check Rocket Email",
            dueDate: "",
            completed: false
        }
    ]);

    const DEFAULT_SETTINGS = Object.freeze({
        theme: "light"
    });

    function cloneData(data) {
        return JSON.parse(JSON.stringify(data));
    }

    function read(key, fallback) {
        try {
            const storedValue = localStorage.getItem(key);

            if (storedValue === null) {
                return cloneData(fallback);
            }

            return JSON.parse(storedValue);
        } catch (error) {
            console.error(`Could not read "${key}" from localStorage.`, error);
            return cloneData(fallback);
        }
    }

    function write(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Could not save "${key}" to localStorage.`, error);
            return false;
        }
    }

    function getLinks() {
        const links = read(STORAGE_KEYS.links, DEFAULT_LINKS);

        if (!Array.isArray(links)) {
            return cloneData(DEFAULT_LINKS);
        }

        return links;
    }

    function saveLinks(links) {
        return write(STORAGE_KEYS.links, links);
    }

    function getTasks() {
        const tasks = read(STORAGE_KEYS.tasks, DEFAULT_TASKS);

        if (!Array.isArray(tasks)) {
            return cloneData(DEFAULT_TASKS);
        }

        return tasks;
    }

    function saveTasks(tasks) {
        return write(STORAGE_KEYS.tasks, tasks);
    }

    function getSettings() {
        const settings = read(STORAGE_KEYS.settings, DEFAULT_SETTINGS);

        if (
            typeof settings !== "object" ||
            settings === null ||
            Array.isArray(settings)
        ) {
            return cloneData(DEFAULT_SETTINGS);
        }

        return {
            ...cloneData(DEFAULT_SETTINGS),
            ...settings
        };
    }

    function saveSettings(settings) {
        return write(STORAGE_KEYS.settings, settings);
    }

    function exportData() {
        return {
            version: 1,
            exportedAt: new Date().toISOString(),
            links: getLinks(),
            tasks: getTasks(),
            settings: getSettings()
        };
    }

    function validateImportedData(data) {
        if (
            typeof data !== "object" ||
            data === null ||
            Array.isArray(data)
        ) {
            return false;
        }

        if (!Array.isArray(data.links) || !Array.isArray(data.tasks)) {
            return false;
        }

        if (
            typeof data.settings !== "object" ||
            data.settings === null ||
            Array.isArray(data.settings)
        ) {
            return false;
        }

        return true;
    }

    function importData(data) {
        if (!validateImportedData(data)) {
            throw new Error("The selected file is not a valid backup.");
        }

        saveLinks(data.links);
        saveTasks(data.tasks);
        saveSettings({
            ...cloneData(DEFAULT_SETTINGS),
            ...data.settings
        });
    }

    function resetAll() {
        saveLinks(cloneData(DEFAULT_LINKS));
        saveTasks(cloneData(DEFAULT_TASKS));
        saveSettings(cloneData(DEFAULT_SETTINGS));
    }

    return Object.freeze({
        getLinks,
        saveLinks,
        getTasks,
        saveTasks,
        getSettings,
        saveSettings,
        exportData,
        importData,
        resetAll
    });
})();
