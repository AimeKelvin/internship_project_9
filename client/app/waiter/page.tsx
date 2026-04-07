
// app/waiter/page.tsx
import { redirect } from "next/navigation";

export default function WaiterRedirect() {
  redirect("/waiter/new-order");
}
