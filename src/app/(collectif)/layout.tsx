export default function CollectifLayout({children}: {
    children: React.ReactNode
}) {
    return (
        <main>
            <div>
                {children}
            </div>
        </main>
    );
}