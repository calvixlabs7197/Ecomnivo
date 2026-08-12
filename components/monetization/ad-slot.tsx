import { advertisingEnabled, env } from "@/config/env";
import { getSettings } from "@/lib/db/repositories";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";
import { AdUnit } from "@/components/monetization/ad-unit";

type Placement = "leaderboard" | "in-content" | "sidebar";

/**
 * Reserved heights, set so that when a real ad unit fills them it does not
 * push content down. Cumulative Layout Shift from ads is the single easiest
 * way to fail Core Web Vitals, and it is entirely avoidable.
 */
const reservedHeight: Record<Placement, string> = {
  leaderboard: "min-h-[100px] sm:min-h-[90px]",
  "in-content": "min-h-[250px]",
  sidebar: "min-h-[600px]",
};

/**
 * An advertising placement.
 *
 * Three states, in order of how often they occur today:
 *
 * 1. **Not configured, production** — renders nothing at all. An empty
 *    reserved box on a live page is just wasted screen.
 * 2. **Not configured, development** — renders a labelled outline so the
 *    layout can be judged with ads in place. This is the only way to catch a
 *    placement that ruins a calculator before it ships.
 * 3. **Configured** — renders the real unit, which additionally requires
 *    consent (see `AdUnit`).
 *
 * The component owns its own container and vertical rhythm rather than relying
 * on the caller. If the caller supplied the padding, an unconfigured slot would
 * collapse to an empty but still-padded band, leaving a hole in production and
 * nowhere else.
 */
export async function AdSlot({
  placement,
  className,
}: {
  placement: Placement;
  className?: string;
}) {
  const settings = await getSettings();
  const clientId = settings.adClientId ?? env.NEXT_PUBLIC_AD_CLIENT_ID ?? null;
  const configured = Boolean(clientId) || advertisingEnabled;

  if (!configured && process.env.NODE_ENV === "production") return null;

  return (
    <Container className={cn("py-10", className)}>
      {configured && clientId ? (
        <AdUnit
          placement={placement}
          clientId={clientId}
          reservedHeight={reservedHeight[placement]}
        />
      ) : (
        <div
          aria-hidden="true"
          className={cn(
            "flex w-full items-center justify-center rounded-md border border-dashed border-rule-strong bg-surface text-xs uppercase tracking-widest text-muted",
            reservedHeight[placement],
          )}
        >
          Ad slot &middot; {placement}
        </div>
      )}
    </Container>
  );
}
