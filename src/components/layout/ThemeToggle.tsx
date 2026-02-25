"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    const cycle = () => {
        if (theme === "light") setTheme("dark");
        else if (theme === "dark") setTheme("system");
        else setTheme("light");
    };

    return (
        <button
            onClick={cycle}
            aria-label="Toggle theme"
            className="relative flex items-center justify-center w-9 h-9 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
        >
            {theme === "dark" ? (
                <Moon size={18} />
            ) : theme === "light" ? (
                <Sun size={18} />
            ) : (
                <Monitor size={18} />
            )}
        </button>
    );
}
