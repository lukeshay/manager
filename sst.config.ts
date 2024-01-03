/// <reference path="./.sst/src/global.d.ts" />

import { STAGE } from "./src/constants"

const NAME = "manager"

export default $config({
	app(input) {
		return {
			name: NAME,
			removalPolicy: input?.stage === "production" ? "retain" : "remove",
		}
	},
	async run() {
		const pool = new aws.cognito.UserPool("Pool", {}, {})
		const userpoolClient = new aws.cognito.UserPoolClient(
			"UserPoolClient",
			{
				allowedOauthFlows: ["code", "implicit"],
				allowedOauthFlowsUserPoolClient: true,
				allowedOauthScopes: ["email", "openid"],
				callbackUrls: ["http://localhost:3000/auth/callback/cognito"],
				supportedIdentityProviders: ["COGNITO"],
				userPoolId: pool.id,
			},
			{},
		)

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
			COGNITO_CLIENT_ID: userpoolClient.id,
			COGNITO_CLIENT_SECRET: userpoolClient.clientSecret,
			COGNITO_ISSUER: util.interpolate`https://cognito-idp.us-west-2.amazonaws.com/${pool.id}`,
			STAGE,
			WEB_DATA_TABLE_NAME: table.name,
		}

		const site = new sst.Nextjs("Web", {
			buildCommand: "bun run build:open-next",
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

		new aws.ssm.Parameter("Environment", {
			dataType: "text",
			name: `/${STAGE}/manager/environment`,
			type: "String",
			value: util.jsonStringify(environment),
		})
	},
})
