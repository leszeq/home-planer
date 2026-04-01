export type ActionResponse<T = any> = 
  | { success: true; data?: T; error?: never }
  | { success: false; error: string; data?: never };

export type FileUploadResult = {
  id: string;
  name: string;
  storage_path: string;
  stage_id?: string | null;
};
