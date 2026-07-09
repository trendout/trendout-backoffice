import { supabase } from "./supabase";

/**
 * Faz upload de uma imagem para o bucket "product-images" e devolve o URL público.
 * Reaproveitado para produtos e para páginas (o bucket serve para qualquer imagem da loja).
 * Requer que o bucket exista no Supabase (Storage -> New bucket -> "product-images", público).
 */
export async function uploadImage(file) {
  const ext = file.name.split(".").pop();
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("product-images").upload(path, file);
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
