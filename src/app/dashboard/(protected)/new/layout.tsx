export default function NewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-mx-4 md:-mx-6 lg:-mx-8 -mb-4 md:-mb-6 lg:-mb-8 -mt-4 md:-mt-6 lg:-mt-8 flex flex-col flex-1">
      {children}
    </div>
  );
}
