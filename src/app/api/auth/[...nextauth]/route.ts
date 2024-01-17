import NextAuth from "next-auth"
import CognitoProvider from "next-auth/providers/cognito"

import { serverEnvironment } from "../../../../server-environment"

const handler = NextAuth({
	providers: [
		CognitoProvider({
			clientId: serverEnvironment.COGNITO_CLIENT_ID,
			clientSecret: serverEnvironment.COGNITO_CLIENT_SECRET,
			issuer: serverEnvironment.COGNITO_ISSUER,
		}),
	],
	secret: serverEnvironment.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
