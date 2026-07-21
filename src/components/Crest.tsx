import { UNIVERSITY_NAME } from "@/data/letterTemplates";

/** The OAU masthead crest. Serif, gold ring, quiet. */
export default function Crest({ subtitle }: { subtitle?: string }) {
  return (
    <div className="center">
      <div className="crest">
        <span className="crest-mark">OAU</span>
        <span className="est">Est. — Later Than You'd Think</span>
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
