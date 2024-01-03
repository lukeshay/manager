import { Schema } from "electrodb"

export const AUDIT_FIELDS = {
	createdAt: {
		default: () => new Date().toISOString(),
		readOnly: true,
		required: true,
		set: () => new Date().toISOString(),
		type: "string",
	},
	createdBy: {
		readOnly: true,
		required: true,
		type: "string",
	},
	deletedAt: {
		required: false,
		type: "number",
	},
	deletedBy: {
		required: false,
		type: "string",
	},
	updatedAt: {
		default: () => new Date().toISOString(),
		required: true,
		set: () => new Date().toISOString(),
		type: "string",
		watch: "*",
	},
	updatedBy: {
		required: true,
		type: "string",
	},
} satisfies Schema<string, string, string>["attributes"]
