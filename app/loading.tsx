import { LoaderCircle } from 'lucide-react';

export default function Loading() {
  return (

    <div className="flex items-center justify-center h-screen w-full bg-black">
      <LoaderCircle className="h-12 w-12 text-neutral-500 animate-spin" />
    </div>
  );
}