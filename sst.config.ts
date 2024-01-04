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
		const pool = new aws.cognito.UserPool("Pool")
		const userPoolDomain = new aws.cognito.UserPoolDomain("UserPoolDomain", {
			domain: `${STAGE}-manager`,
			userPoolId: pool.id,
		})

		const userPoolClient = new aws.cognito.UserPoolClient("UserPoolClient", {
			allowedOauthFlows: ["code"],
			allowedOauthFlowsUserPoolClient: true,
			allowedOauthScopes: ["email", "openid", "profile"],
			callbackUrls: [
				"https://d1eks578ui5wez.cloudfront.net",
				"http://localhost:3000/auth/callback/cognito",
			],
			generateSecret: true,
			supportedIdentityProviders: ["COGNITO"],
			userPoolId: pool.id,
		})

		let userPoolClientSecret = ""

		try {
			const secretVersion = await aws.secretsmanager.getSecretVersion({
				secretId: `/${STAGE}/manager/cognito/client-secret`,
			})

			userPoolClientSecret = secretVersion.secretString
		} catch (error) {
			console.error(error)
		}

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

		const environment = {
			COGNITO_CLIENT_ID: userPoolClient.id,
			COGNITO_CLIENT_SECRET: userPoolClientSecret,
			COGNITO_ISSUER: util.interpolate`https://${
				userPoolDomain.domain
			}.auth.${pool.id.apply(
				(value) => value.split("_")[0],
			)}.amazoncognito.com/oauth2`,
			STAGE,
			WEB_DATA_TABLE_NAME: table.name,
		}

		const site = new sst.Nextjs("Web", {
			buildCommand: "bun run build:open-next",
			/*domain: {
				domainName: DOMAIN,
				hostedZone: "aws.lshay.land",
				redirects: [`www.${DOMAIN}`],
			},*/
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
		}

		new aws.ssm.Parameter(
			"Environment",
			{
				dataType: "text",
				name: `/${STAGE}/manager/environment`,
				type: "String",
				value: util.jsonStringify(environment),
			},
			{
				dependsOn: [userPoolClient],
			},
		)
	},
})
