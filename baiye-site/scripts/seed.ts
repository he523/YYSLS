import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

// 用法: npx ts-node --project tsconfig.json scripts/seed.ts
async function main() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  const prisma = new PrismaClient({ adapter });

  // 创建默认管理员
  const passwordHash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash,
    },
  });
  console.log("✅ 管理员已创建:", admin.username);

  // 创建示例成员
  const members = [
    { nickname: "云中鹤", role: "会长", profession: "侠客", level: 80, power: 158000, intro: "百业之主，仗剑天涯" },
    { nickname: "霜月影", role: "副会长", profession: "乐师", level: 75, power: 142000, intro: "一曲肝肠断，天涯何处觅知音" },
    { nickname: "铁骨铮铮", role: "精英", profession: "匠人", level: 72, power: 135000, intro: "千锤百炼，方成神兵" },
    { nickname: "妙手仁心", role: "精英", profession: "医生", level: 70, power: 128000, intro: "悬壶济世，医者仁心" },
    { nickname: "夜行客", role: "成员", profession: "盗贼", level: 68, power: 120000, intro: "月黑风高夜，最是出手时" },
    { nickname: "墨染青衫", role: "成员", profession: "书生", level: 65, power: 115000, intro: "腹有诗书气自华" },
    { nickname: "丹青妙手", role: "成员", profession: "画师", level: 63, power: 110000, intro: "一笔一世界" },
    { nickname: "金银满屋", role: "成员", profession: "商人", level: 60, power: 105000, intro: "通商天下，富甲一方" },
  ];

  for (const m of members) {
    await prisma.member.create({ data: m });
    console.log("👤 成员已创建:", m.nickname);
  }

  console.log("\n🎉 种子数据已就绪！");
  console.log("   管理员账号: admin / admin123");
  console.log(`   已创建 ${members.length} 位示例成员`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ 种子脚本失败:", e);
  process.exit(1);
});
