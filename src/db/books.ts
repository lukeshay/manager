import { Entity, Service } from "electrodb"
import { ulid } from "ulidx"

import { serverEnvironment } from "../server-environment"
import { AUDIT_FIELDS } from "./common"

export const book = new Entity({
	attributes: {
		bookId: {
			readOnly: true,
			required: true,
			type: "string",
		},
		subtitle: {
			type: "string",
		},
		title: {
			required: true,
			type: "string",
		},
		...AUDIT_FIELDS,
	},
	indexes: {
		bookBook: {
			collection: "book",
			index: "GSI1",
			pk: {
				composite: ["bookId"],
				field: "GSI1PK",
			},
			sk: {
				composite: [],
				field: "GSI1SK",
			},
		},
		bookById: {
			pk: {
				composite: ["bookId"],
				field: "PK",
			},
			sk: {
				composite: [],
				field: "SK",
			},
		},
	},
	model: {
		entity: "book",
		service: "books",
		version: "1",
	},
})

export const review = new Entity({
	attributes: {
		bookId: {
			readOnly: true,
			required: true,
			type: "string",
		},
		description: {
			required: true,
			type: "string",
		},
		rating: {
			required: true,
			type: "number",
		},
		ratingId: {
			default: ulid,
			readOnly: true,
			required: true,
			type: "string",
		},
		title: {
			required: true,
			type: "string",
		},
		...AUDIT_FIELDS,
	},
	indexes: {
		bookRating: {
			collection: "book",
			index: "GSI1",
			pk: {
				composite: ["bookId"],
				field: "GSI1PK",
			},
			sk: {
				composite: ["ratingId"],
				field: "GSI1SK",
			},
		},
		ratingById: {
			pk: {
				composite: ["ratingId"],
				field: "PK",
			},
			sk: {
				composite: [],
				field: "SK",
			},
		},
	},
	model: {
		entity: "book",
		service: "books",
		version: "1",
	},
})

export const author = new Entity({
	attributes: {
		authorId: {
			default: ulid,
			readOnly: true,
			required: true,
			type: "string",
		},
		name: {
			required: true,
			type: "string",
		},
		...AUDIT_FIELDS,
	},
	indexes: {
		authorAuthor: {
			collection: "author",
			index: "GSI2",
			pk: {
				composite: ["authorId"],
				field: "GSI2PK",
			},
			sk: {
				composite: [],
				field: "GSI2SK",
			},
		},
		authorById: {
			pk: {
				composite: ["authorId"],
				field: "PK",
			},
			sk: {
				composite: [],
				field: "SK",
			},
		},
	},
	model: {
		entity: "author",
		service: "books",
		version: "1",
	},
})

export const bookAuthor = new Entity({
	attributes: {
		authorId: {
			readOnly: true,
			required: true,
			type: "string",
		},
		bookId: {
			readOnly: true,
			required: true,
			type: "string",
		},
		name: {
			required: true,
			type: "string",
		},
		...AUDIT_FIELDS,
	},
	indexes: {
		authorBookAuthor: {
			collection: "author",
			index: "GSI2",
			pk: {
				composite: ["authorId"],
				field: "GSI2PK",
			},
			sk: {
				composite: [],
				field: "GSI2SK",
			},
		},
		bookAuthorById: {
			pk: {
				composite: ["authorId"],
				field: "PK",
			},
			sk: {
				composite: ["bookId"],
				field: "SK",
			},
		},
		bookBookAuthor: {
			collection: "book",
			index: "GSI1",
			pk: {
				composite: ["bookId"],
				field: "GSI1PK",
			},
			sk: {
				composite: ["authorId"],
				field: "GSI1SK",
			},
		},
	},
	model: {
		entity: "bookAuthor",
		service: "books",
		version: "1",
	},
})

export const booksService = new Service(
	{
		author,
		book,
		bookAuthor,
		review,
	},
	{
		table: serverEnvironment.WEB_DATA_TABLE_NAME,
	},
)
