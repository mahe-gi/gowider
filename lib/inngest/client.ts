import { Inngest } from "inngest";
import { BRAND } from "@/lib/constants";

export const inngest = new Inngest({
  id: BRAND.name,
  eventKey: process.env.INNGEST_EVENT_KEY,
});
