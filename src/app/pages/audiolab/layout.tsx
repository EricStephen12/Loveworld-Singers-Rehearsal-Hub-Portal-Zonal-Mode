import { AudioLabProvider } from './_context/AudioLabContext';

export default function AudioLabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AudioLabProvider>
      <div className="audiolab-wrapper fixed inset-0 bg-[#191022] text-white font-sans antialiased selection:bg-violet-500 selection:text-white overflow-hidden">
        <div className="relative flex h-full w-full flex-col max-w-md mx-auto shadow-2xl overflow-hidden">
          {children}
        </div>
      </div>
    </AudioLabProvider>
  );
}
