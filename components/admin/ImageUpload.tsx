'use client';

import { useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Upload, Loader2 } from 'lucide-react';

export default function ImageUpload({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string) => void;
}) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const ext = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      onChange(publicUrlData.publicUrl);
    } catch (err: any) {
      setError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs uppercase tracking-widest text-neutral-400">
        Product Image
      </label>

      <div className="flex items-center gap-4">
        <div className="w-24 h-24 rounded-lg bg-black/40 border border-gold/20 overflow-hidden flex items-center justify-center relative shrink-0">
          {value ? (
            <Image src={value} alt="Product" fill className="object-cover" />
          ) : (
            <span className="text-neutral-600 text-xs">No image</span>
          )}
        </div>

        <label className="btn-gold rounded-full px-4 py-2.5 text-sm font-medium cursor-pointer inline-flex items-center gap-2">
          {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
          {uploading ? 'Uploading…' : 'Upload Image'}
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </label>
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}
