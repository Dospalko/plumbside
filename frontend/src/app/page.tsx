import { redirect } from "next/navigation";

export default function Home() {
  // Directly redirect from root to login for the MVP
  redirect("/login");
}
