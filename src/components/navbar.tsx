import { Button, buttonVariants } from "@lshay/ui/components/new-york/button"
import { PersonIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { signIn } from "next-auth/react"
import { ReactNode, use } from "react"

import { ThemeToggle } from "./theme-toggle"

export type NavbarProperties = {
	left?: ReactNode
	right?: ReactNode
}

export function Navbar({ left, right }: NavbarProperties) {
	const session = use(getServerSession())

	return (
		<div className="border-b bg-background z-10 fixed w-full top-0">
			<div className="h-16 items-center px-4 hidden: md:flex">
				<h1 className="scroll-m-20 text-xl font-semibold tracking-tight pr-6">
					Manager
				</h1>
				<div className="flex">
					<Link className={buttonVariants({ variant: "ghost" })} href="/books">
						Books
					</Link>
				</div>
				<div className="ml-auto flex items-center space-x-4">
					<Link
						className={buttonVariants({ size: "icon", variant: "outline" })}
						href={session ? "/profile" : "/api/auth/signin"}
					>
						<PersonIcon className="h-[1.2rem] w-[1.2rem] transition-all" />
					</Link>
					<ThemeToggle />
				</div>
			</div>
		</div>
	)
}
