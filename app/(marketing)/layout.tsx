import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/marketing/footer";

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
                <Footer />
            </main>
        </>
    );
};

export default MarketingLayout;