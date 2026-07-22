import { UNIVERSITY_NAME } from "@/data/brand";
import OauSeal from "@/components/OauSeal";

/** The OAU masthead crest — real seal + registrar chrome. */
export default function Crest({ subtitle }: { subtitle?: string }) {
  return (
    <div className="center">
      <div className="crest">
        <OauSeal size={84} />
        <span className="est">Est. 2026 · The Youngest of the Old People</span>
      </div>
      <div className="mt-2">
        <span className="overline">{UNIVERSITY_NAME}</span>
        {subtitle ? (
          <p className="tiny muted" style={{ margin: "0.35rem 0 0" }}>
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}
