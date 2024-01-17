import {
	GetParameterCommand,
	PutParameterCommand,
	SSM,
} from "@aws-sdk/client-ssm"
import { argv } from "node:process"

import { STAGE } from "../src/constants"

const ssm = new SSM()
const name = `/manager/${STAGE}/environment`

export const injectEnvironment = async () => {
	let parameters: Record<string, string> = {}

	try {
		const parameter = await ssm.send(
			new GetParameterCommand({
				Name: name,
				WithDecryption: true,
			}),
		)

		if (!parameter.Parameter?.Value) {
			return
		}

		// @ts-expect-error - Not sure why this is throwing an error
		parameters = JSON.parse(parameter.Parameter.Value.toString("utf8"))
	} catch (error) {
		console.error(error)
	}

	await ssm.send(
		new PutParameterCommand({
			Name: name,
			Overwrite: true,
			Type: "SecureString",
			Value: JSON.stringify({
				...parameters,
				[argv[2]]: argv[3],
			}),
		}),
	)
}

void injectEnvironment()
