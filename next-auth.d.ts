import { Session as OriginalSession } from "next-auth";
import { ServiceId } from "./lib/services";

declare module "next-auth" {
  interface Session extends OriginalSession {
    accessToken: string;
    provider: ServiceId;
  }
}
