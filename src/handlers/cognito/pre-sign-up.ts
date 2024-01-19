import { Callback, Context, PreSignUpTriggerEvent } from "aws-lambda"

export function handler(
	event: PreSignUpTriggerEvent,
	_context: Context,
	callback: Callback,
) {
	if (event.request.userAttributes.email === "shay.luke17@gmail.com") {
		callback(null, event)
	} else {
		callback("User not allowed", event)
	}
}
