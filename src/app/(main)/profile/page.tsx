import { redirect } from "next/navigation";

export default function ProfileAliasRedirectPage() {
  redirect("/me?tab=privacy");
}
