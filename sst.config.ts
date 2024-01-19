/// <reference path="./.sst/src/global.d.ts" />

const NAME = "manager"

export default $config({
	app(input) {
		return {
			name: NAME,
			providers: {
				aws: {
					region: "us-west-2",
				},
			},
			removalPolicy: input?.stage === "production" ? "retain" : "remove",
		}
	},
	async run() {
		const DOMAIN = [
			$app.stage === "prod" ? undefined : $app.stage,
			"manager.aws.lshay.land",
		]
			.filter(Boolean)
			.join(".")

		const parameter = await aws.ssm.getParameter({
			name: `/manager/${$app.stage}/parameters`,
			withDecryption: true,
		})

		const parameters = JSON.parse(parameter.value)

		const preSignUpFunction = new sst.Function("PreSignUp", {
			handler: "src/handlers/cognito/pre-sign-up.handler",
			runtime: "nodejs20.x",
		})

		const pool = new aws.cognito.UserPool("Pool", {
			autoVerifiedAttributes: ["email"],
			lambdaConfig: {
				preSignUp: preSignUpFunction.nodes.function.arn,
			},
			userPoolAddOns: {
				advancedSecurityMode: "ENFORCED",
			},
			usernameAttributes: ["email"],
		})

		new aws.lambda.Permission("InvokePreSignUpPermission", {
			action: "lambda:InvokeFunction",
			function: preSignUpFunction.nodes.function,
			principal: "cognito-idp.amazonaws.com",
			sourceArn: pool.arn,
		})

		new aws.cognito.UserPoolDomain("UserPoolDomain", {
			domain: `${$app.stage}-manager`,
			userPoolId: pool.id,
		})

		const userPoolClient = new aws.cognito.UserPoolClient("UserPoolClient", {
			allowedOauthFlows: ["code", "implicit"],
			allowedOauthFlowsUserPoolClient: true,
			allowedOauthScopes: ["email", "openid", "profile"],
			callbackUrls: [
				`https://${DOMAIN}/api/auth/callback/cognito`,
				"http://localhost:3000/api/auth/callback/cognito",
			],
			enableTokenRevocation: true,
			explicitAuthFlows: [
				"ALLOW_USER_PASSWORD_AUTH",
				"ALLOW_USER_SRP_AUTH",
				"ALLOW_REFRESH_TOKEN_AUTH",
			],
			generateSecret: true,
			supportedIdentityProviders: ["COGNITO"],
			userPoolId: pool.id,
		})

		const environment = {
			COGNITO_CLIENT_ID: userPoolClient.id,
			COGNITO_ISSUER: $util.interpolate`https://cognito-idp.${pool.id.apply(
				(value) => value.split("_")[0],
			)}.amazonaws.com/${pool.id}`,
			NEXTAUTH_URL: `https://www.${DOMAIN}`,
			STAGE: $app.stage,
			...parameters,
		}

		const environmentParameter = new aws.ssm.Parameter("Environment", {
			dataType: "text",
			description: "Environment variables for the web app",
			name: `/manager/${$app.stage}/environment`,
			type: "SecureString",
			value: $util.jsonStringify(environment),
		})

		new sst.Nextjs(
			"Web",
			{
				buildCommand: `SST_STAGE=${$app.stage} bun run build:open-next`,
			},
			{
				dependsOn: [environmentParameter],
			},
		)
	},
})
