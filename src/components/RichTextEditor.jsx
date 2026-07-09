import React, { useRef, useEffect, useState } from "react";
import { Bold, Italic, Underline, Heading2, List, ListOrdered, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { T } from "../lib/theme";
import { uploadImage } from "../lib/uploadImage";

export default function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const initialized = useRef(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (editorRef.current && !initialized.current) {
      editorRef.current.innerHTML = value || "";
      initialized.current = true;
    }
  }, [value]);

  const exec = (cmd, arg) => {
    document.execCommand(cmd, false, arg);
    editorRef.current.focus();
    onChange(editorRef.current.innerHTML);
  };

  const handleImageFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    setUploadError("");
    try {
      const url = await uploadImage(file);
      exec("insertImage", url);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const insertLink = () => {
    const url = window.prompt("URL do link:");
    if (url) exec("createLink", url);
  };

  const toolbarBtn = (icon, title, onClick) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 6, color: T.text, cursor: "pointer", padding: "6px 8px", display: "flex" }}
    >
      {icon}
    </button>
  );

  return (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8, padding: 8, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8 }}>
        {toolbarBtn(<Bold size={14} />, "Negrito", () => exec("bold"))}
        {toolbarBtn(<Italic size={14} />, "Itálico", () => exec("italic"))}
        {toolbarBtn(<Underline size={14} />, "Sublinhado", () => exec("underline"))}
        {toolbarBtn(<Heading2 size={14} />, "Título", () => exec("formatBlock", "H2"))}
        {toolbarBtn(<List size={14} />, "Lista", () => exec("insertUnorderedList"))}
        {toolbarBtn(<ListOrdered size={14} />, "Lista numerada", () => exec("insertOrderedList"))}
        {toolbarBtn(<LinkIcon size={14} />, "Inserir link", insertLink)}
        {toolbarBtn(<ImageIcon size={14} />, uploading ? "A enviar..." : "Inserir imagem", () => fileInputRef.current.click())}
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleImageFile(e.target.files[0])} />
      </div>
      {uploadError && <div style={{ color: T.danger, fontSize: 12, marginBottom: 8 }}>{uploadError}</div>}
      <div
        ref={editorRef}
        contentEditable
        onInput={() => onChange(editorRef.current.innerHTML)}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) handleImageFile(file);
        }}
        onDragOver={(e) => e.preventDefault()}
        style={{
          minHeight: 220, padding: 14, borderRadius: 8, background: T.bg,
          border: `1px solid ${T.border}`, fontSize: 13.5, lineHeight: 1.6, outline: "none",
        }}
      />
      <div style={{ fontSize: 11.5, color: T.muted, marginTop: 6 }}>Arrasta uma imagem para o texto, ou usa o botão de imagem na barra.</div>
    </div>
  );
}
