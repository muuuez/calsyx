import { redirect } from "next/navigation";

export default async function Home(): Promise<never> {
  // Redirect to chat page
  redirect("/chat");
}
