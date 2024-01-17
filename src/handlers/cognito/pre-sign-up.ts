import { PreSignUpTriggerHandler } from "aws-lambda"

export const handler: PreSignUpTriggerHandler = (event, _context, callback) => {
	if (event.userName !== "shay.luke17@gmail.com") {
		callback("User not allowed")
	}
}
