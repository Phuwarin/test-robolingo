import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ user?: string | string[] }>;
};

export default async function ChatPage({ searchParams }: Props) {
  const { user } = await searchParams;
  if (typeof user === "string" && user) redirect(`/chat/${encodeURIComponent(user)}`);
  return null;
}
