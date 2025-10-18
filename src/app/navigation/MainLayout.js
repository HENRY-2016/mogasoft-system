import NavBar from "./NavBar";


const MainLayout = ({ children }) => {
    return (
        <div style={{ display: 'flex' }}>
            <NavBar />
            <main style={{ flexGrow: 1, padding: '24px' }}>
                {children}
            </main>
        </div>
    );
};

export default MainLayout;