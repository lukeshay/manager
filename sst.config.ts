/// <reference path="./.sst/src/global.d.ts" />

import { STAGE } from "./src/constants"

const NAME = "manager"

const DOMAIN = [STAGE === "prod" ? undefined : STAGE, "manager.aws.lshay.land"]
	.filter(Boolean)
	.join(".")

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
		const preSignUpFunction = new sst.Function("PreSignUp", {
			bundle: "src/handlers/cognito",
			handler: "pre-sign-up.handler",
			runtime: "nodejs18.x",
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
		new aws.cognito.UserPoolDomain("UserPoolDomain", {
			domain: `${STAGE}-manager2`,
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

		const table = new aws.dynamodb.Table("WebData", {
			attributes: [
				{
					name: "PK",
					type: "S",
				},
				{
					name: "SK",
					type: "S",
				},
				{
					name: "GSI1PK",
					type: "S",
				},
				{
					name: "GSI1SK",
					type: "S",
				},
				{
					name: "GSI2PK",
					type: "S",
				},
				{
					name: "GSI2SK",
					type: "S",
				},
			],
			billingMode: "PAY_PER_REQUEST",
			globalSecondaryIndexes: [
				{
					hashKey: "GSI1PK",
					name: "GSI1",
					projectionType: "ALL",
					rangeKey: "GSI1SK",
				},
				{
					hashKey: "GSI2PK",
					name: "GSI2",
					projectionType: "ALL",
					rangeKey: "GSI2SK",
				},
			],
			hashKey: "PK",
			pointInTimeRecovery: {
				enabled: true,
			},
			rangeKey: "SK",
			ttl: {
				attributeName: "deleteAt",
				enabled: true,
			},
		})

		const NEXTAUTH_SECRET = new sst.Secret("NEXTAUTH_SECRET", "undefined")
		const COGNITO_CLIENT_SECRET = new sst.Secret(
			"COGNITO_CLIENT_SECRET",
			"undefined",
		)
		const TURSO_DB_URL = new sst.Secret("TURSO_DB_URL", "undefined")
		const TURSO_AUTH_TOKEN = new sst.Secret("TURSO_AUTH_TOKEN", "undefined")

		const environment = {
			COGNITO_CLIENT_ID: userPoolClient.id,
			COGNITO_CLIENT_SECRET: COGNITO_CLIENT_SECRET.value.apply(
				(v) => v ?? "undefined",
			),
			COGNITO_ISSUER: $util.interpolate`https://cognito-idp.${pool.id.apply(
				(value) => value.split("_")[0],
			)}.amazonaws.com/${pool.id}`,
			NEXTAUTH_SECRET: NEXTAUTH_SECRET.value.apply((v) => v ?? "undefined"),
			NEXTAUTH_URL: `https://${DOMAIN}`,
			STAGE,
			TURSO_AUTH_TOKEN: TURSO_AUTH_TOKEN.value.apply((v) => v ?? "undefined"),
			TURSO_DB_URL: TURSO_DB_URL.value.apply((v) => v ?? "undefined"),
			WEB_DATA_TABLE_NAME: table.name,
		}

		/*const site = new sst.Nextjs("Web", {
			buildCommand: "bun run build:open-next",
			domain: {
				domainName: DOMAIN,
				hostedZone: "aws.lshay.land",
				redirects: [`www.${DOMAIN}`],
			},
			environment,
		})

		const role = site.nodes?.server?.nodes.role?.id

		if (role) {
			new aws.iam.RolePolicy("WebDataRolePolicy", {
				policy: {
					Statement: [
						{
							Action: [
								"dynamodb:BatchGetItem",
								"dynamodb:BatchWriteItem",
								"dynamodb:DeleteItem",
								"dynamodb:GetItem",
								"dynamodb:PutItem",
								"dynamodb:Query",
								"dynamodb:Scan",
								"dynamodb:UpdateItem",
							],
							Effect: "Allow",
							Resource: [table.arn, table.arn.apply((arn) => `${arn}/index/*`)],
						},
					],
					Version: "2012-10-17",
				},
				role,
			})
		}*/

		new aws.ssm.Parameter(
			"Environment",
			{
				dataType: "text",
				description: "Environment variables for the web app",
				name: `/manager/${STAGE}/environment`,
				type: "SecureString",
				value: $util.jsonStringify(environment),
			},
			{
				dependsOn: [userPoolClient],
			},
		)
	},
})
