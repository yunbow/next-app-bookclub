import { AlertCircle } from "lucide-react";

type Props = {
  message?: string;
  id?: string;
  className?: string;
};

export function FormError({ message, id, className = "" }: Props) {
  if (!message) return null;

  return (
    <div
      id={id}
      className={`flex items-center gap-2 text-sm text-destructive ${className}`}
      role="alert"
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
