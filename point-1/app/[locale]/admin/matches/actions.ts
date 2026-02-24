"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createMatch(formData: FormData) {
  const slug = String(formData.get("slug") || "").trim();
  const startsAt = new Date(String(formData.get("startsAt") || ""));
  const homeTeamId = String(formData.get("homeTeamId") || "");
  const awayTeamId = String(formData.get("awayTeamId") || "");
  const competitionId = String(formData.get("competitionId") || "");

  if (!slug || Number.isNaN(startsAt.getTime()) || !homeTeamId || !awayTeamId || !competitionId) {
    return { ok: false, error: "Invalid input" };
  }

  await prisma.match.create({
    data: { slug, startsAt, homeTeamId, awayTeamId, competitionId },
  });

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteMatch(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return { ok: false };
  await prisma.stream.deleteMany({ where: { matchId: id } });
  await prisma.match.delete({ where: { id } });
  revalidatePath("/", "layout");
  return { ok: true };
}
