import Sidebar from './components/sidebar';
import MainPanel from "@/app/main/components/mainPanel";

export default function MainPage() {
    return (
        <div className="flex min-h-screen w-full bg-gray-50">
            <Sidebar />
            <MainPanel />
        </div>
    );
}