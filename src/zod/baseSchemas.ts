import z from "zod";
export const MyMangaListStatusSchema = z.object({
  status: z
    .enum(["reading", "completed", "on_hold", "dropped", "plan_to_read"])
    .nullable()
    .optional(),

  score: z.number().int().min(0).max(10),

  num_volumes_read: z.number().int().min(0),
  num_chapters_read: z.number().int().min(0),

  is_rereading: z.boolean(),

  start_date: z.string().date().nullable().optional(),
  finish_date: z.string().date().nullable().optional(),

  priority: z.number().int(),
  num_times_reread: z.number().int(),
  reread_value: z.number().int(),

  tags: z.array(z.string()),

  comments: z.string().optional(),

  updated_at: z.string(),
});

export const baseMangaSchema = z.object({
  id: z.number().int(),
  title: z.string(),

  main_picture: z
    .object({
      large: z.string().url().nullable().optional(),
      medium: z.string().url(),
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

  start_date: z.string().date().nullable().optional(),
  end_date: z.string().date().nullable().optional(),

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

  media_type: z
    .enum([
      "unknown",
      "manga",
      "novel",
      "one_shot",
      "doujinshi",
      "manhwa",
      "manhua",
      "oel",
    ])
    .optional(),
  status: z.enum(["finished", "currently_publishing", "not_yet_published"]),

  my_list_status: MyMangaListStatusSchema.partial().nullable().optional(),

  num_volumes: z.number().int(),
  num_chapters: z.number().int(),

  authors: z.array(
    z.object({
      node: z.object({
        id: z.number().int(),
        name: z.string(),
      }),
      role: z.string(),
    })
  ),
});
