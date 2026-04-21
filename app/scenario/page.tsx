"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ScenarioPage() {
    return (
        <Suspense fallback={null}>
            <ScenarioRedirect />
        </Suspense>
    );
}

function ScenarioRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/character");
    }, [router]);

    return null;
}
