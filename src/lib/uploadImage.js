import { supabase } from "./supabase";

const MAX_DIMENSION = 1600; // px no lado maior — chega bem para qualquer ecrã, poupa muito peso em fotos de telemóvel/câmara
const JPEG_QUALITY = 0.82; // boa relação qualidade/peso

/**
 * Redimensiona e comprime uma imagem no próprio browser antes do upload —
 * fotos de telemóvel/câmara costumam vir com 4-12MB e resoluções muito
 * maiores do que qualquer ecrã precisa. Mantém PNG (com transparência) como
 * PNG; tudo o resto sai como JPEG comprimido.
 */
async function optimizeImage(file) {
  // SVGs e ficheiros já pequenos não precisam de otimização
  if (file.type === "image/svg+xml" || file.size < 150 * 1024) return file;

  const isPng = file.type === "image/png";

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, isPng ? "image/png" : "image/jpeg", isPng ? undefined : JPEG_QUALITY)
  );

  return blob || file; // se algo correr mal, usa o ficheiro original em vez de falhar
}

/**
 * Faz upload de uma imagem para o bucket "product-images" e devolve o URL público.
 * Reaproveitado para produtos, hero, e páginas (o bucket serve para qualquer imagem da loja).
 * Requer que o bucket exista no Supabase (Storage -> New bucket -> "product-images", público).
 */
export async function uploadImage(file) {
  const optimized = await optimizeImage(file);
  const isPng = file.type === "image/png";
  const ext = file.type === "image/svg+xml" ? "svg" : isPng ? "png" : "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("product-images").upload(path, optimized, {
    contentType: optimized.type || file.type,
  });
  if (error) {
    throw new Error(
      `Falha no upload: ${error.message}. Confirma que criaste o bucket "product-images" (Storage -> New bucket, marcado como público) no Supabase.`
    );
  }

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

// mantido por compatibilidade com o código existente
export const uploadProductImage = uploadImage;
