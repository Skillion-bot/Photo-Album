export interface Photo {
  id: string;
  userId: string;
  url: string;
  title: string;
  description?: string;
  albumId: string;
  createdAt: number;
  width: number;
  height: number;
}

export interface Album {
  id: string;
  userId: string;
  name: string;
  description?: string;
  coverUrl?: string;
  photoCount: number;
  createdAt: number;
}
