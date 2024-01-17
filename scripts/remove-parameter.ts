import {
	GetParameterCommand,
	PutParameterCommand,
	SSM,
} from "@aws-sdk/client-ssm"
import { argv } from "node:process"

import { STAGE } from "../src/constants"

const ssm = new SSM()
const name = `/manager/${STAGE}/parameters`

export const injectEnvironment = async () => {
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
	const parameters = JSON.parse(parameter.Parameter.Value.toString("utf8"))

	if (parameters[argv[2]]) {
		delete parameters[argv[2]]

		await ssm.send(
			new PutParameterCommand({
				Name: name,
				Overwrite: true,
				Type: "SecureString",
				Value: JSON.stringify(parameters),
			}),
		)
	}
}

void injectEnvironment()
