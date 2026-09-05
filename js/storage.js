"use strict";

const RocketStorage = (() => {
    const KEYS = Object.freeze({
        applications: "rocketLaunchpad.applications",
        tasks: "rocketLaunchpad.tasks",
        settings: "rocketLaunchpad.settings"
    });

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function read(key, fallback) {
        try {
            const value = localStorage.getItem(key);

            if (value === null) {
                return clone(fallback);
            }

            return JSON.parse(value);
        } catch (error) {
            console.error(`Unable to read ${key}.`, error);
            return clone(fallback);
        }
    }

    function write(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Unable to save ${key}.`, error);
            return false;
        }
    }

    function getApplications() {
        const applications = read(
            KEYS.applications,
            RocketData.applications
        );

        return Array.isArray(applications)
            ? applications
            : clone(RocketData.applications);
    }

    function saveApplications(applications) {
        return write(KEYS.applications, applications);
    }

    function getTasks() {
        const tasks = read(KEYS.tasks, RocketData.tasks);

        return Array.isArray(tasks)
            ? tasks
            : clone(RocketData.tasks);
    }

    function saveTasks(tasks) {
        return write(KEYS.tasks, tasks);
    }

    function getSettings() {
        const settings = read(KEYS.settings, RocketData.settings);

        if (
            typeof settings !== "object" ||
            settings === null ||
            Array.isArray(settings)
        ) {
            return clone(RocketData.settings);
        }

        return {
            ...clone(RocketData.settings),
            ...settings
        };
    }

    function saveSettings(settings) {
        return write(KEYS.settings, settings);
    }

    function exportData() {
        return {
            application: "Rocket Launchpad",
            version: 1,
            exportedAt: new Date().toISOString(),
            applications: getApplications(),
            tasks: getTasks(),
            settings: getSettings()
        };
    }

    function validateImport(data) {
        if (
            typeof data !== "object" ||
            data === null ||
            Array.isArray(data)
        ) {
            return false;
        }

        if (
            !Array.isArray(data.applications) ||
            !Array.isArray(data.tasks)
        ) {
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
        if (!validateImport(data)) {
            throw new Error(
                "The selected file is not a valid Rocket Launchpad backup."
            );
        }

        saveApplications(data.applications);
        saveTasks(data.tasks);
        saveSettings({
            ...clone(RocketData.settings),
            ...data.settings
        });
    }

    function resetAll() {
        saveApplications(clone(RocketData.applications));
        saveTasks(clone(RocketData.tasks));
        saveSettings(clone(RocketData.settings));
    }

    return Object.freeze({
        getApplications,
        saveApplications,
        getTasks,
        saveTasks,
        getSettings,
        saveSettings,
        exportData,
        importData,
        resetAll
    });
})();
