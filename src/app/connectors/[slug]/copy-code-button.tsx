"use client";

interface CopyCodeButtonProps {
  code: string;
}

export function CopyCodeButton({ code }: CopyCodeButtonProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-4 right-4 px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 text-foreground rounded border border-white/10 transition-colors"
      title="Copy code"
    >
      Copy
    </button>
  );
}
