"use client";

export default function InputField({
  label,
  icon,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled,
}: any) {
  return (
    <div className="space-y-2">
      <label className="text-sm flex items-center gap-2 text-slate-700">
        {icon}
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
      />
    </div>
  );
}