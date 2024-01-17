import { sql } from "drizzle-orm"
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core"

const AUDIT_FIELDS = {
	createdAt: text("created_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	createdBy: text("created_by").notNull(),
	updatedAt: text("updated_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedBy: text("updated_by").notNull(),
}

export const author = sqliteTable("authors", {
	...AUDIT_FIELDS,
	id: text("id").primaryKey(),
	name: text("name").notNull(),
})

export const book = sqliteTable("books", {
	...AUDIT_FIELDS,
	id: text("id").primaryKey(),
	subtitle: text("subtitle").notNull(),
	title: text("title").notNull(),
})

export const bookAuthor = sqliteTable(
	"book_authors",
	{
		authorId: text("author_id")
			.notNull()
			.references(() => author.id),
		bookId: text("book_id")
			.notNull()
			.references(() => book.id),
	},

	(table) => ({
		bookIdAuthorIdIdx: index("book_id_author_id_idx").on(
			table.bookId,
			table.authorId,
		),
	}),
)
