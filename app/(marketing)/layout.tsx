const MarketingLayout = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    return (
        <main className="w-full relative">
            {children}
        </main>
    );
};

export default MarketingLayout;