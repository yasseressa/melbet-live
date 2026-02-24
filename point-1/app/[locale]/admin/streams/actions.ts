"use server";
import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createStream(formData: FormData) {
  const matchId = String(formData.get("matchId") || "");
  const provider = String(formData.get("provider") || "");
  const playbackUrl = String(formData.get("playbackUrl") || "");
  const enabled = String(formData.get("enabled") || "") === "on";
  const isPrimary = String(formData.get("isPrimary") || "") === "on";
  if (!matchId || !playbackUrl) return { ok: false };

  if (isPrimary) {
    await prisma.stream.updateMany({ where: { matchId }, data: { isPrimary: false } });
  }

  await prisma.stream.create({ data: { matchId, provider: provider || null, playbackUrl, enabled, isPrimary } });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function toggleStream(formData: FormData) {
  const id = String(formData.get("id") || "");
  const enabled = String(formData.get("enabled") || "") === "1";
  if (!id) return { ok: false };
  await prisma.stream.update({ where: { id }, data: { enabled } });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteStream(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return { ok: false };
  await prisma.stream.delete({ where: { id } });
  revalidatePath("/", "layout");
  return { ok: true };
}
