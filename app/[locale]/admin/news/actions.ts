"use server";
import { prisma } from "@/src/lib/prisma";
import { buildNewsImageUrl } from "@/src/lib/news-images";
import { revalidatePath } from "next/cache";

export async function createNews(formData: FormData) {
  const slug = String(formData.get("slug") || "").trim();
  const titleAr = String(formData.get("titleAr") || "").trim();
  const titleEn = String(formData.get("titleEn") || "").trim();
  const excerptAr = String(formData.get("excerptAr") || "").trim();
  const excerptEn = String(formData.get("excerptEn") || "").trim();
  const contentHtmlAr = String(formData.get("contentHtmlAr") || "").trim();
  const contentHtmlEn = String(formData.get("contentHtmlEn") || "").trim();
  const coverUrlInput = String(formData.get("coverUrl") || "").trim();

  if (!slug || !titleAr || !contentHtmlAr) return;

  await prisma.news.create({
    data: {
      slug,
      titleAr,
      titleEn: titleEn || null,
      excerptAr: excerptAr || null,
      excerptEn: excerptEn || null,
      contentHtmlAr,
      contentHtmlEn: contentHtmlEn || null,
      sourceLang: "AR",
      coverUrl: coverUrlInput || buildNewsImageUrl(titleAr, "ar"),
      publishedAt: new Date(),
    },
  });

  revalidatePath("/", "layout");
}

export async function deleteNews(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  await prisma.news.delete({ where: { id } });
  revalidatePath("/", "layout");
}
