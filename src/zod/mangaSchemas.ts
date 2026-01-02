import z from "zod";
import { baseMangaSchema, MyMangaListStatusSchema } from "./baseSchemas";

const PagingSchema = z.object({
  next: z.string().url().optional(),
  previous: z.string().url().optional(),
});

export const GetMangaListInputSchema = {
  q: z.string(),
  limit: z.number().int().max(100).optional().default(100),
  offset: z.number().int().min(0).optional().default(0),
  fields: z
    .array(
      z.enum([
        "id",
        "title",
        "main_picture",
        "alternative_titles",
        "start_date",
        "end_date",
        "synopsis",
        "mean",
        "rank",
        "popularity",
        "num_list_users",
        "num_scoring_users",
        "nsfw",
        "genres",
        "created_at",
        "updated_at",
        "media_type",
        "status",
        "my_list_status",
        "num_volumes",
        "num_chapters",
        "authors",
      ])
    )
    .default(["id", "title"]),
};

export const GetMangaListOutputSchema = {
  data: z.array(baseMangaSchema.partial()),
  paging: PagingSchema,
};

export const GetMangaDetailsInputSchema = {
  manga_id: z.number().int(),
  fields: z
    .array(
      z.enum([
        "id",
        "title",
        "main_picture",
        "alternative_titles",
        "start_date",
        "end_date",
        "synopsis",
        "mean",
        "rank",
        "popularity",
        "num_list_users",
        "num_scoring_users",
        "nsfw",
        "genres",
        "created_at",
        "updated_at",
        "media_type",
        "status",
        "my_list_status",
        "num_volumes",
        "num_chapters",
        "authors",
        "pictures",
        "background",
        "related_anime",
        "related_manga",
        "recommendations",
        "serialization",
      ])
    )
    .default(["id", "title"]),
};

export const GetMangaDetailsOutputSchema = baseMangaSchema
  .partial()
  .extend({
    pictures: z
      .array(z.object({ medium: z.string(), large: z.string() }))
      .optional(),
    background: z.string().optional(),
    related_anime: z.array(z.any()).optional(),
    related_manga: z.array(z.any()).optional(),
    recommendations: z.array(z.any()).optional(),
    serialization: z
      .array(
        z.object({
          node: z.object({
            id: z.number().int(),
            name: z.string(),
          }),
        })
      )
      .optional(),
  })
  .partial();

const RankingSchema = z.object({
  rank: z.number().int(),
  previous_rank: z.number().int().nullable().optional(),
});

export const GetMangaRankingInputSchema = {
  ranking_type: z.enum([
    "all",
    "manga",
    "novels",
    "oneshots",
    "doujin",
    "manhwa",
    "manhua",
    "bypopularity",
    "favorite",
  ]),
  limit: z.number().int().max(500).optional().default(100),
  offset: z.number().int().min(0).optional().default(0),
  fields: z
    .array(
      z.enum([
        "id",
        "title",
        "main_picture",
        "alternative_titles",
        "start_date",
        "end_date",
        "synopsis",
        "mean",
        "rank",
        "popularity",
        "num_list_users",
        "num_scoring_users",
        "nsfw",
        "genres",
        "created_at",
        "updated_at",
        "media_type",
        "status",
        "my_list_status",
        "num_volumes",
        "num_chapters",
        "authors",
      ])
    )
    .default(["id", "title"]),
};

export const GetMangaRankingOutputSchema = {
  data: z.array(
    baseMangaSchema.partial().extend({
      ranking: RankingSchema,
    })
  ),
  paging: PagingSchema,
};

export const UpdateMyMangaListStatusInputSchema = {
  manga_id: z.number().int(),
  status: z
    .enum(["reading", "completed", "on_hold", "dropped", "plan_to_read"])
    .optional(),
  is_rereading: z.boolean().optional(),
  score: z.number().int().min(0).max(10).optional(),
  num_volumes_read: z.number().int().optional(),
  num_chapters_read: z.number().int().optional(),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
  finish_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
  priority: z.number().int().min(0).max(2).optional(),
  num_times_reread: z.number().int().optional(),
  reread_value: z.number().int().min(0).max(5).optional(),
  tags: z.array(z.string()).optional(),
  comments: z.string().optional(),
};

export const UpdateMyMangaListStatusOutputSchema =
  MyMangaListStatusSchema.partial();

export const DeleteMyMangaListItemInputSchema = {
  manga_id: z.number().int(),
};

export const DeleteMyMangaListItemOutputSchema = {
  success: z.boolean(),
  message: z.string(),
};

export const GetUserMangaListInputSchema = {
  user_name: z
    .string()
    .describe("The user name. Use '@me' for the authorized user.")
    .default("@me"),
  status: z
    .enum(["reading", "completed", "on_hold", "dropped", "plan_to_read"])
    .optional(),
  sort: z
    .enum([
      "list_score",
      "list_updated_at",
      "manga_title",
      "manga_start_date",
      "manga_id",
    ])
    .optional(),
  limit: z.number().int().max(1000).optional().default(100),
  offset: z.number().int().min(0).optional().default(0),
  fields: z.array(z.string()).default(["id", "title", "my_list_status"]),
};

export const GetUserMangaListOutputSchema = {
  data: z.array(baseMangaSchema.partial()),
  paging: PagingSchema,
};
