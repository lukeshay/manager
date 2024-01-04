import type { Metadata } from "next"

import { Inter } from "next/font/google"
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
				<Navbar />
				{children}
			</body>
		</html>
	)
}
