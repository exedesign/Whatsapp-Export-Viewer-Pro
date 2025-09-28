'use client';

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <body suppressHydrationWarning={true}>
      {children}
    </body>
  );
}