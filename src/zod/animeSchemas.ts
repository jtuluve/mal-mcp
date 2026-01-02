import z from "zod";
import { baseMangaSchema } from "./baseSchemas";

const PagingSchema = z.object({
  next: z.string().url().optional(),
  previous: z.string().url().optional(),
});

const MyListStatusSchema = z.object({
  status: z
    .enum(["watching", "completed", "on_hold", "dropped", "plan_to_watch"])
    .nullable()
    .optional(),
  score: z.number().int().min(0).max(10),
  num_episodes_watched: z.number().int(),
  is_rewatching: z.boolean(),
  start_date: z.string().nullable().optional(),
  finish_date: z.string().nullable().optional(),
  priority: z.number().int(),
  num_times_rewatched: z.number().int(),
  rewatch_value: z.number().int(),
  tags: z.array(z.string()),
  comments: z.string(),
  updated_at: z.string(),
});

const BaseAnimeDetailsSchema = z.object({
  id: z.number().int(),
  title: z.string(),

  main_picture: z
    .object({
      large: z.string().nullable().optional(),
      medium: z.string(),
    })
    .nullable()
    .optional(),

  alternative_titles: z
    .object({
      synonyms: z.array(z.string()).nullable().optional(),
      en: z.string().nullable().optional(),
      ja: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),

  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),

  synopsis: z.string().nullable().optional(),

  mean: z.number().nullable().optional(),
  rank: z.number().int().nullable().optional(),
  popularity: z.number().int().nullable().optional(),

  num_list_users: z.number().int(),
  num_scoring_users: z.number().int(),

  nsfw: z.enum(["white", "gray", "black"]).nullable().optional(),

  genres: z.array(
    z.object({
      id: z.number().int(),
      name: z.string(),
    })
  ),

  created_at: z.string(),
  updated_at: z.string(),

  media_type: z.enum([
    "unknown",
    "tv",
    "ova",
    "movie",
    "special",
    "ona",
    "music",
  ]),

  status: z.enum(["finished_airing", "currently_airing", "not_yet_aired"]),

  my_list_status: MyListStatusSchema.partial().nullable().optional(),

  num_episodes: z.number().int(),

  start_season: z
    .object({
      year: z.number().int(),
      season: z.enum(["winter", "spring", "summer", "fall"]),
    })
    .nullable()
    .optional(),

  broadcast: z
    .object({
      day_of_the_week: z.string(),
      start_time: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),

  source: z
    .enum([
      "other",
      "original",
      "manga",
      "4_koma_manga",
      "web_manga",
      "digital_manga",
      "novel",
      "light_novel",
      "visual_novel",
      "game",
      "card_game",
      "book",
      "picture_book",
      "radio",
      "music",
    ])
    .nullable()
    .optional(),

  average_episode_duration: z.number().int().nullable().optional(),

  rating: z.enum(["g", "pg", "pg_13", "r", "r+", "rx"]).nullable().optional(),

  studios: z.array(
    z.object({
      id: z.number().int(),
      name: z.string(),
    })
  ),

  ranking: z
    .object({
      rank: z.number().int(),
      previous_rank: z.number().int().nullable().optional(),
    })
    .optional(),
});

const AnimeDetailsSchema = BaseAnimeDetailsSchema.extend({
  related_anime: z
    .array(
      z.object({
        node: BaseAnimeDetailsSchema,
        relation_type: z.enum([
          "sequel",
          "prequel",
          "alternative_setting",
          "alternative_version",
          "side_story",
          "parent_story",
          "summary",
          "full_story",
        ]),
        relation_type_formatted: z.string(),
      })
    )
    .optional(),
  related_manga: baseMangaSchema.optional(),
  recommendations: z.any().optional(),
  statistics: z.object({
    num_list_users: z.number().int(),
    status: z.object({
      watching: z.number().int(),
      completed: z.number().int(),
      on_hold: z.number().int(),
      dropped: z.number().int(),
      plan_to_watch: z.number().int(),
    }),
  }),
  pictures: z
    .array(z.object({ medium: z.string(), large: z.string() }))
    .optional(),
  background: z.string().optional(),
});

export const GetAnimeListInputSchema = {
  q: z.string(),
  limit: z.number().optional().default(100),
  offset: z.number().optional().default(0),
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
        "created_at",
        "updated_at",
        "media_type",
        "status",
        "genres",
        "my_list_status",
        "num_episodes",
        "start_season",
        "broadcast",
        "source",
        "average_episode_duration",
        "rating",
        "pictures",
        "background",
        "related_anime",
        "related_manga",
        "recommendations",
        "studios",
        "statistics",
      ])
    )
    .default(["id", "title"]),
};

export const GetAnimeListOutputSchema = {
  data: z.array(BaseAnimeDetailsSchema.partial()),
  paging: PagingSchema,
};

export const GetAnimeDetailInputSchema = {
  id: z.number(),
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
        "created_at",
        "updated_at",
        "media_type",
        "status",
        "genres",
        "my_list_status",
        "num_episodes",
        "start_season",
        "broadcast",
        "source",
        "average_episode_duration",
        "rating",
        "pictures",
        "background",
        "related_anime",
        "related_manga",
        "recommendations",
        "studios",
        "statistics",
      ])
    )
    .default(["id", "title"]),
};

export const GetAnimeDetailOutputSchema = {
  data: AnimeDetailsSchema.partial(),
};

export const GetAnimeRankingInputSchema = {
  ranking_type: z.enum([
    "all",
    "airing",
    "upcoming",
    "tv",
    "ova",
    "movie",
    "special",
    "bypopularity",
    "favorite",
  ]),

  limit: z.number().int().max(500).default(100),

  offset: z.number().int().min(0).default(0),

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
        "num_episodes",
        "start_season",
        "broadcast",
        "source",
        "average_episode_duration",
        "rating",
        "studios",
        "pictures",
      ])
    )
    .default(["id", "title"]),
};

export const GetAnimeRankingOutputSchema = {
  data: z.array(
    BaseAnimeDetailsSchema.partial().extend({
      ranking: z.object({
        rank: z.number().int(),
        previous_rank: z.number().int().optional().nullable().optional(),
      }),
    })
  ),
  paging: PagingSchema,
};

export const GetSeasonalAnimeInputSchema = {
  year: z.number().int(),
  season: z.enum(["winter", "spring", "summer", "fall"]),
  sort: z.enum(["anime_score", "anime_num_list_users"]).optional(),
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
        "num_episodes",
        "start_season",
        "broadcast",
        "source",
        "average_episode_duration",
        "rating",
        "studios",
      ])
    )
    .default(["id", "title"]),
};

export const GetSeasonalAnimeOutputSchema = {
  data: z.array(BaseAnimeDetailsSchema.partial()),
  paging: PagingSchema,
};

export const GetSuggestedAnimeInputSchema = {
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
        "num_episodes",
        "start_season",
        "broadcast",
        "source",
        "average_episode_duration",
        "rating",
        "studios",
      ])
    )
    .default(["id", "title"]),
};

export const GetSuggestedAnimeOutputSchema = {
  data: z.array(BaseAnimeDetailsSchema.partial()),
  paging: PagingSchema,
};

export const UpdateMyAnimeListStatusInputSchema = {
  anime_id: z.number().int(),
  status: z
    .enum(["watching", "completed", "on_hold", "dropped", "plan_to_watch"])
    .optional(),
  is_rewatching: z.boolean().optional(),
  score: z.number().int().min(0).max(10).optional(),
  num_watched_episodes: z.number().int().optional(),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
  finish_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
  priority: z.number().int().min(0).max(2).optional(),
  num_times_rewatched: z.number().int().optional(),
  rewatch_value: z.number().int().min(0).max(5).optional(),
  tags: z.array(z.string()).optional(),
  comments: z.string().optional(),
};

export const UpdateMyAnimeListStatusOutputSchema = MyListStatusSchema;

export const DeleteMyAnimeListItemInputSchema = {
  anime_id: z.number().int(),
};

export const DeleteMyAnimeListItemOutputSchema = {
  // data: z.object({
  success: z.boolean(),
  message: z.string(),
  // })
};

export const GetUserAnimeListInputSchema = {
  user_name: z
    .string()
    .describe("The user name. Use '@me' for the authorized user.")
    .default("@me"),
  status: z
    .enum(["watching", "completed", "on_hold", "dropped", "plan_to_watch"])
    .optional(),
  sort: z
    .enum([
      "list_score",
      "list_updated_at",
      "anime_title",
      "anime_start_date",
      "anime_id",
    ])
    .describe("The sorting method.")
    .optional(),
  limit: z.number().int().max(1000).optional().default(100),
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
        "created_at",
        "updated_at",
        "media_type",
        "status",
        "genres",
        "my_list_status",
        "num_episodes",
        "start_season",
        "broadcast",
        "source",
        "average_episode_duration",
        "rating",
        "pictures",
        "background",
        "related_anime",
        "related_manga",
        "recommendations",
        "studios",
        "statistics",
      ])
    )
    .default(["id", "title"]),
};

export const GetUserAnimeListOutputSchema = {
  data: z.array(BaseAnimeDetailsSchema.partial()),
  paging: PagingSchema,
};
