import type { NomadVisaDetails } from "@core/models";
import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Cell, Row, VALUE_TEXT } from "./CompareTableParts";

interface VisaCountry {
  code: string;
  nomadVisa: NomadVisaDetails;
}

interface NomadVisaApplicationCompareRowsProps {
  readonly selected: VisaCountry[];
  readonly count: number;
}

export function NomadVisaApplicationCompareRows({
  selected,
  count,
}: NomadVisaApplicationCompareRowsProps) {
  const { t } = useTranslation();
  return (
    <>
      <Row label={t("nomadVisaComparePage.renewable", "Renewable")}>
        {selected.map((c) => (
          <Cell key={c.code} count={count}>
            <span
              className={`text-[13px] ${c.nomadVisa.duration.renewable ? "text-[#44CC66]" : "text-[#CC4444]"}`}
            >
              {c.nomadVisa.duration.renewable ? t("common.yes", "Yes") : t("common.no", "No")}
            </span>
          </Cell>
        ))}
      </Row>
      <Row label={t("nomadVisaComparePage.onlineApp", "Online Application")}>
        {selected.map((c) => (
          <Cell key={c.code} count={count}>
            <span
              className={`text-[13px] ${c.nomadVisa.applicationProcess.online ? "text-[#44CC66]" : "text-[#CC4444]"}`}
            >
              {c.nomadVisa.applicationProcess.online
                ? t("common.yes", "Yes")
                : t("common.no", "No")}
            </span>
          </Cell>
        ))}
      </Row>
      <Row label={t("nomadVisaComparePage.processingTime", "Processing Time")}>
        {selected.map((c) => (
          <Cell key={c.code} count={count}>
            <span className={VALUE_TEXT}>
              {c.nomadVisa.applicationProcess.processingTime !== ""
                ? c.nomadVisa.applicationProcess.processingTime
                : "—"}
            </span>
          </Cell>
        ))}
      </Row>
      <Row label={t("nomadVisaComparePage.officialLink", "Official Link")}>
        {selected.map((c) => (
          <Cell key={c.code} count={count}>
            <a
              href={c.nomadVisa.officialUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-[5px] text-xs text-accent-dim no-underline"
            >
              <ExternalLink size={13} />
              {t("nomadVisaComparePage.viewPage", "Official page")}
            </a>
          </Cell>
        ))}
      </Row>
    </>
  );
}
