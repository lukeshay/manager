import { ReactNode } from "react"

import { ThemeToggle } from "./theme-toggle"

export type NavbarProperties = {
	left?: ReactNode
	right?: ReactNode
}

export function Navbar({ left, right }: NavbarProperties) {
	return (
		<div className="border-b bg-background z-10 fixed w-full top-0">
			<div className="h-16 items-center px-4 hidden: md:flex">
				<h1 className="scroll-m-20 text-xl font-semibold tracking-tight pr-6">
					Manager
				</h1>
				{left}
				<div className="ml-auto flex items-center space-x-4">
					{right}
					<ThemeToggle />
				</div>
			</div>
		</div>
	)
}
