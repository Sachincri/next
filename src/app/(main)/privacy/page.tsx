import { redirect } from "next/navigation";

export default function LegacyPrivacyRedirectPage() {
  redirect("/privacy-policy");
}
