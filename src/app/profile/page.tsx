import { buttonVariants } from "@lshay/ui/components/new-york/button"
import Link from "next/link"

export default function Profile() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
				<Link
					className={buttonVariants({ variant: "outline" })}
					href="/api/auth/signout"
				>
					Sign Out
				</Link>
			</div>
		</main>
	)
}
