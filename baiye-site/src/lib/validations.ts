import { z } from "zod";

export const memberCreateSchema = z.object({
  nickname: z.string().min(1, "请填写昵称喵~").max(50, "昵称最多50个字"),
  role: z.string().optional().default("小猫咪"),
  profession: z.string().nullable().optional(),
  level: z.number().int().min(1).max(999).optional().default(1),
  power: z.number().int().min(0).max(999999).optional().default(0),
  intro: z.string().max(500, "简介最多500字").nullable().optional(),
  avatar: z.string().max(500).nullable().optional(),
  gameImage: z.string().max(500).nullable().optional(),
});

export const memberUpdateSchema = z.object({
  nickname: z.string().min(1, "请填写昵称喵~").max(50, "昵称最多50个字"),
  role: z.string().optional(),
  profession: z.string().nullable().optional(),
  level: z.number().int().min(1).max(999).optional(),
  power: z.number().int().min(0).max(999999).optional(),
  intro: z.string().max(500, "简介最多500字").nullable().optional(),
  avatar: z.string().max(500).nullable().optional(),
  gameImage: z.string().max(500).nullable().optional(),
});

export type MemberCreateInput = z.infer<typeof memberCreateSchema>;
export type MemberUpdateInput = z.infer<typeof memberUpdateSchema>;
