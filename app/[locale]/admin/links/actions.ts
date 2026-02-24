"use server";
import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";

export async function upsertSocial(formData: FormData) {
  const kind = String(formData.get("kind") || "");
  const url = String(formData.get("url") || "");
  const enabled = String(formData.get("enabled") || "") === "on";

  if (!kind || !url) return { ok: false };

  await prisma.socialLink.upsert({
    where: { kind: kind as any },
    update: { url, enabled },
    create: { kind: kind as any, url, enabled },
  });

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function createPopup(formData: FormData) {
  const titleAr = String(formData.get("titleAr") || "");
  const titleEn = String(formData.get("titleEn") || "");
  const url = String(formData.get("url") || "");
  const sort = Number(formData.get("sort") || 0);
  const enabled = String(formData.get("enabled") || "") === "on";
  if (!titleAr || !url) return { ok: false };
  await prisma.popupLink.create({ data: { titleAr, titleEn: titleEn || null, url, sort, enabled } });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deletePopup(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return { ok: false };
  await prisma.popupLink.delete({ where: { id } });
  revalidatePath("/", "layout");
  return { ok: true };
}
