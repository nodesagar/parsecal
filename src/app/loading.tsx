import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
      <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
      <p className="text-sm text-text-muted font-medium animate-pulse">
        Loading...
      </p>
    </div>
  );
}
