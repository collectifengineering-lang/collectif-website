import Footer from '@/components/footer/Footer'

export default function CollectifLayout({children}: {
    children: React.ReactNode
}) {
    return (
        <main>
            <div>
                {children}
            </div>
            <Footer />
        </main>
    );
}