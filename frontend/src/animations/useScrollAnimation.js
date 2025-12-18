import { useEffect, useRef } from 'react';

const useScrollAnimation = () => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target); // Hentikan observasi setelah animasi berjalan
                    }
                });
            },
            {
                threshold: 0.1, // Animasi terpicu saat 10% elemen terlihat
            }
        );

        if (sectionRef.current) {
            // Observasi semua elemen anak yang ingin dianimasikan
            const elementsToAnimate = sectionRef.current.querySelectorAll('.animate-on-scroll');
            elementsToAnimate.forEach((el) => observer.observe(el));
        }

        // Cleanup
        return () => {
            if (sectionRef.current) {
                const elementsToAnimate = sectionRef.current.querySelectorAll('.animate-on-scroll');
                elementsToAnimate.forEach((el) => observer.unobserve(el));
            }
        };
    }, []);

    return sectionRef;
};

export default useScrollAnimation;