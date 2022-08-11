import { v4 as uuidV4 } from 'uuid';

export type FileUploadable = File & {
  id: string;
  localUrl: string;
  revoke: () => void;
  original: File;
};

export function createFileUploadable(file: File): FileUploadable {
  const url = URL.createObjectURL(file);
  return { ...file, id: uuidV4(), localUrl: url, revoke: () => URL.revokeObjectURL(url), original: file };
}
