import { redirect } from "next/navigation";

export default function HomePage() {
  // default redirect to login
  redirect("/login");
}
