"use strict";

const RocketData = Object.freeze({
    applications: [
        {
            id: "app-myut",
            name: "myUT Portal",
            url: "https://myut.utoledo.edu/",
            category: "University",
            icon: "🎓",
            color: "blue",
            favorite: true,
            custom: false,
            openCount: 0,
            lastOpenedAt: null
        },
        {
            id: "app-blackboard",
            name: "Blackboard",
            url: "https://blackboard.utdl.edu/",
            category: "Classes",
            icon: "📚",
            color: "purple",
            favorite: true,
            custom: false,
            openCount: 0,
            lastOpenedAt: null
        },
        {
            id: "app-email",
            name: "Rocket Email",
            url: "https://outlook.office.com/",
            category: "Communication",
            icon: "✉️",
            color: "gold",
            favorite: true,
            custom: false,
            openCount: 0,
            lastOpenedAt: null
        },
        {
            id: "app-calendar",
            name: "Academic Calendar",
            url: "https://www.utoledo.edu/offices/provost/calendar/",
            category: "Planning",
            icon: "📅",
            color: "green",
            favorite: true,
            custom: false,
            openCount: 0,
            lastOpenedAt: null
        },
        {
            id: "app-library",
            name: "University Libraries",
            url: "https://www.utoledo.edu/library/",
            category: "University",
            icon: "📖",
            color: "blue",
            favorite: false,
            custom: false,
            openCount: 0,
            lastOpenedAt: null
        },
        {
            id: "app-map",
            name: "Campus Map",
            url: "https://www.utoledo.edu/campus/directions/",
            category: "Campus",
            icon: "📍",
            color: "red",
            favorite: false,
            custom: false,
            openCount: 0,
            lastOpenedAt: null
        },
        {
            id: "app-financial-aid",
            name: "Financial Aid",
            url: "https://www.utoledo.edu/financialaid/",
            category: "University",
            icon: "💳",
            color: "green",
            favorite: false,
            custom: false,
            openCount: 0,
            lastOpenedAt: null
        },
        {
            id: "app-parking",
            name: "Parking Services",
            url: "https://www.utoledo.edu/parkingservices/",
            category: "Campus",
            icon: "🚗",
            color: "slate",
            favorite: false,
            custom: false,
            openCount: 0,
            lastOpenedAt: null
        },
        {
            id: "app-support",
            name: "Student Success",
            url: "https://www.utoledo.edu/success/",
            category: "University",
            icon: "✅",
            color: "gold",
            favorite: false,
            custom: false,
            openCount: 0,
            lastOpenedAt: null
        }
    ],

    tasks: [
        {
            id: "task-blackboard",
            title: "Review Blackboard announcements",
            subject: "Classes",
            dueDate: "",
            priority: "normal",
            completed: false,
            createdAt: "2026-09-05T12:00:00.000Z"
        },
        {
            id: "task-email",
            title: "Check Rocket Email",
            subject: "University",
            dueDate: "",
            priority: "normal",
            completed: false,
            createdAt: "2026-09-05T12:01:00.000Z"
        },
        {
            id: "task-schedule",
            title: "Review this week's class schedule",
            subject: "Planning",
            dueDate: "",
            priority: "low",
            completed: false,
            createdAt: "2026-09-05T12:02:00.000Z"
        }
    ],

    classes: [
        {
            id: "class-expl",
            code: "EXPL 1000",
            name: "Exploratory Studies",
            instructor: "Instructor",
            location: "University Hall",
            days: ["Monday", "Wednesday"],
            time: "10:00 AM",
            endTime: "10:50 AM",
            online: false,
            color: "#2368c4",
            blackboardUrl: "https://blackboard.utdl.edu/"
        },
        {
            id: "class-english",
            code: "ENGL 1110",
            name: "College Composition",
            instructor: "Instructor",
            location: "Memorial Field House",
            days: ["Tuesday", "Thursday"],
            time: "11:00 AM",
            endTime: "12:15 PM",
            online: false,
            color: "#8a52c7",
            blackboardUrl: "https://blackboard.utdl.edu/"
        },
        {
            id: "class-math",
            code: "MATH 1200",
            name: "Mathematics",
            instructor: "Instructor",
            location: "Online",
            days: ["Monday", "Wednesday", "Friday"],
            time: "1:00 PM",
            endTime: "1:50 PM",
            online: true,
            color: "#16865a",
            blackboardUrl: "https://blackboard.utdl.edu/"
        }
    ],

    settings: {
        theme: "light",
        applicationLayout: "grid"
    }
});
