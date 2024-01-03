"use client"
import { Button } from "@lshay/ui/components/new-york/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@lshay/ui/components/new-york/dropdown-menu"
import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { useEffect, useState } from "react"

const STORAGE_KEY = "theme"

type Theme = "dark" | "light" | "system"

export function ThemeToggle() {
	const [theme, setTheme] = useState<Theme>(
		() =>
			(globalThis.window?.localStorage.getItem(STORAGE_KEY) as Theme) ??
			"system",
	)

	useEffect(() => {
		if (globalThis.window) {
			const root = globalThis.window.document.documentElement

			root.classList.remove("light", "dark")

			if (theme === "system") {
				const systemTheme = globalThis.window.matchMedia(
					"(prefers-color-scheme: dark)",
				).matches
					? "dark"
					: "light"

				root.classList.add(systemTheme)
				return
			}

			root.classList.add(theme)
		}
	}, [theme])

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button size="icon" variant="outline">
					<SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
					<MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
					<span className="sr-only">Toggle theme</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => setTheme("light")}>
					Light
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("dark")}>
					Dark
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("system")}>
					System
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
