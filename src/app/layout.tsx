import type { Metadata } from "next"

import { buttonVariants } from "@lshay/ui/components/new-york/button"
import { Inter } from "next/font/google"
import Link from "next/link"
import { ReactNode } from "react"

import { Navbar } from "../components/navbar"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
	description: "Life management stuff",
	title: "Personal Manager",
}

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<Navbar
					left={
						<div className="flex">
							<Link
								className={buttonVariants({ variant: "ghost" })}
								href="/books"
							>
								Books
							</Link>
						</div>
					}
				/>
				{children}
			</body>
		</html>
	)
}
