/** Stored photo metadata (matches `photos` table / JSON store). */
export type PhotoRecord = {
  id: string;
  url: string;
  filename: string;
  alt_text: string;
  category: string;
  created_at: string;
};

export type PhotoRepository = {
  list(): Promise<PhotoRecord[]>;
  create(
    input: Omit<PhotoRecord, "created_at"> & { created_at?: string },
  ): Promise<PhotoRecord>;
  update(
    id: string,
    patch: Partial<Pick<PhotoRecord, "alt_text" | "category">>,
  ): Promise<PhotoRecord | null>;
};
