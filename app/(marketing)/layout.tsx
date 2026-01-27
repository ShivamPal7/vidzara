import { Navbar } from "@/components/layout/navbar";

const MarketingLayout = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    return (
        <>
            <main className="w-full relative">
                <Navbar />
                {children}
            </main>
        </>
    );
};

export default MarketingLayout;