const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export interface Post {
  id: number;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
    // revalidate each fetch on demand
    cache: "no-store",
  });
  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {}
    const errorMessage =
      (body as any)?.error ||
      (body as any)?.errors?.join(", ") ||
      `Request failed: ${res.status}`;
    throw new Error(errorMessage);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export const api = {
  listPosts: () => request<Post[]>("/posts"),
  getPost: (id: number) => request<Post>(`/posts/${id}`),
  createPost: (data: { title: string; content?: string }) =>
    request<Post>("/posts", {
      method: "POST",
      body: JSON.stringify({ post: data }),
    }),
  updatePost: (id: number, data: { title: string; content?: string }) =>
    request<Post>(`/posts/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ post: data }),
    }),
  deletePost: (id: number) =>
    request<void>(`/posts/${id}`, { method: "DELETE" }),
};
