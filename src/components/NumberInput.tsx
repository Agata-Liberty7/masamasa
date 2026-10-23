import React from "react";

type NumberInputProps = {
  label: string;
  value: number;
  onChange: (v: number) => void;
};

const NumberInput: React.FC<NumberInputProps> = ({ label, value, onChange }) => {
  // Keep the user's partial decimal text (0., 0,1) while focused.
  const [draft, setDraft] = React.useState(String(value));
  const [focused, setFocused] = React.useState(false);

  React.useEffect(() => {
    if (!focused) setDraft(String(value));
  }, [value, focused]);

  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <span style={{ fontSize: "14px", fontWeight: 500 }}>{label}</span>
      <input
        type="text"
        inputMode="decimal"
        value={draft}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          setDraft(String(value));
        }}
        onChange={(e) => {
          const raw = e.target.value;
          if (!/^\d*([.,]\d*)?$/.test(raw)) return;
          setDraft(raw);
          if (raw === "" || raw === "." || raw === ",") {
            onChange(0);
            return;
          }
          const number = Number(raw.replace(",", "."));
          if (Number.isFinite(number)) onChange(number);
        }}
        style={{
          width: "100%",
          padding: "8px 10px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          fontSize: "14px",
        }}
      />
    </label>
  );
};

export default NumberInput;
