"use client";

import { useState } from "react";
import { COUNTRY_CODES, flagEmoji, isValidNationalNumber, nationalNumberLengthHint } from "@/lib/countryCodes";
import clsx from "clsx";

export interface PhoneValue {
  dial: string;
  national: string;
}

export function isPhoneValid(value: PhoneValue): boolean {
  return isValidNationalNumber(value.national, value.dial);
}

export function formatPhoneE164(value: PhoneValue): string {
  return `+${value.dial}${value.national.trim()}`;
}

export default function PhoneInput({
  value,
  onChange,
}: {
  value: PhoneValue;
  onChange: (v: PhoneValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = COUNTRY_CODES.find((c) => c.dial === value.dial) ?? COUNTRY_CODES[0];
  const touched = value.national.length > 0;
  const valid = isPhoneValid(value);

  return (
    <div>
      <div
        className={clsx(
          "flex bg-brand-surfaceLight border rounded-lg overflow-visible focus-within:border-brand-primary transition-colors",
          touched && !valid ? "border-red-500/60" : "border-brand-border"
        )}
      >
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="h-full flex items-center gap-1.5 px-3 py-3 text-sm text-white border-r border-brand-border"
          >
            <span>{flagEmoji(selected.iso)}</span>
            <span>+{selected.dial}</span>
            <svg className="w-3 h-3 text-brand-textMuted" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <div className="absolute left-0 top-full mt-1 w-56 max-h-64 overflow-y-auto bg-brand-surface border border-brand-border rounded-xl shadow-xl z-50">
                {COUNTRY_CODES.map((c) => (
                  <button
                    key={c.iso}
                    type="button"
                    onClick={() => {
                      onChange({ ...value, dial: c.dial });
                      setOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-brand-surfaceLight transition-colors"
                  >
                    <span>{flagEmoji(c.iso)}</span>
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="text-brand-textMuted">+{c.dial}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <input
          type="tel"
          inputMode="numeric"
          value={value.national}
          onChange={(e) => onChange({ ...value, national: e.target.value.replace(/[^0-9]/g, "") })}
          placeholder="4121234567"
          className="flex-1 min-w-0 bg-transparent px-4 py-3 text-white placeholder:text-brand-textMuted focus:outline-none"
        />
      </div>
      {touched && !valid && (
        <p className="text-xs text-red-400 mt-1">
          Escribe solo números, sin el código de país ({nationalNumberLengthHint(selected.dial)}).
        </p>
      )}
    </div>
  );
}
