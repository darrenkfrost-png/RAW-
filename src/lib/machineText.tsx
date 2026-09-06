import React from "react";

/**
 * MACHINE-STYLE LABELS BREAK IN THE WRONG PLACE, AND ONLY THIS FIXES IT.
 *
 * The site is full of telemetry-styled strings — NO_DEBRIEF_LOGS_ON_FILE,
 * Combat_Efficiency_Model, CORE_MANTRA_01. A browser does not treat "_" as a
 * place a line may break, so it treats the whole run as one enormous word and,
 * when it will not fit, snaps it anywhere: "NO_DEBR / IEF_LOGS_ON_FILE".
 *
 * CSS cannot express "break at the underscores and nowhere else". `break-word`
 * still breaks mid-token, and `anywhere` breaks even sooner. The only thing
 * that gives the browser the right break points is putting them in the markup:
 * <wbr> is a break opportunity that adds no character, no space and no width,
 * and disappears entirely when the line does fit.
 *
 * Copying the text still yields the original string — <wbr> contributes nothing
 * to textContent — so search, screen readers and copy-paste are unaffected.
 */
export function machineText(text: string): React.ReactNode {
  const parts = text.split("_");
  if (parts.length === 1) return text;
  return parts.map((part, i) => (
    <React.Fragment key={i}>
      {i > 0 && <>_<wbr /></>}
      {part}
    </React.Fragment>
  ));
}
