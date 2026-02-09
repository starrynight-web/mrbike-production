import { useState, useEffect } from "react";
import { Brand } from "@/types";

const MOCK_BRANDS: Brand[] = [
    {
        id: "1",
        name: "Yamaha",
        slug: "yamaha",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Yamaha_Motor_Logo_%28full%29.svg/2560px-Yamaha_Motor_Logo_%28full%29.svg.png",
        country: "Japan",
        bikeCount: 15,
        description: "Yamaha Motor Company is a Japanese manufacturer of motorcycles, marine products such as boats and outboard motors, and other motorized products."
    },
    {
        id: "2",
        name: "Honda",
        slug: "honda",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Honda_Logo.svg/1200px-Honda_Logo.svg.png",
        country: "Japan",
        bikeCount: 22,
        description: "Honda is the world's largest manufacturer of internal combustion engines measured by volume, producing more than 14 million internal combustion engines each year."
    },
    {
        id: "3",
        name: "Suzuki",
        slug: "suzuki",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Suzuki_logo_2.svg/2560px-Suzuki_logo_2.svg.png",
        country: "Japan",
        bikeCount: 12
    },
    {
        id: "4",
        name: "Bajaj",
        slug: "bajaj",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Bajaj_Auto_Logo.svg/1200px-Bajaj_Auto_Logo.svg.png",
        country: "India",
        bikeCount: 18
    },
    {
        id: "5",
        name: "TVS",
        slug: "tvs",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/TVS_Motor_Company_Logo.svg/1280px-TVS_Motor_Company_Logo.svg.png",
        country: "India",
        bikeCount: 14
    },
    {
        id: "6",
        name: "Royal Enfield",
        slug: "royal-enfield",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Royal_Enfield_logo.svg/1200px-Royal_Enfield_logo.svg.png",
        country: "India",
        bikeCount: 6
    },
    {
        id: "7",
        name: "KTM",
        slug: "ktm",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/KTM-Logo_2017.svg/1200px-KTM-Logo_2017.svg.png",
        country: "Austria",
        bikeCount: 8
    },
    {
        id: "8",
        name: "Hero",
        slug: "hero",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Hero_MotoCorp.svg/1200px-Hero_MotoCorp.svg.png",
        country: "India",
        bikeCount: 16
    }
];

export function useBrands() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setBrands(MOCK_BRANDS);
            setIsLoading(false);
        }, 600);
        return () => clearTimeout(timer);
    }, []);

    return { brands, isLoading };
}

export function useBrand(slug: string) {
    const [brand, setBrand] = useState<Brand | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            const found = MOCK_BRANDS.find(b => b.slug === slug);
            setBrand(found || null);
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [slug]);

    return { brand, isLoading };
}

// Mock Bikes for Brand Detail
const MOCK_BRAND_BIKES: any[] = [
    {
        id: "b1",
        slug: "yamaha-r15-m",
        name: "Yamaha R15M",
        brand: { name: "Yamaha", slug: "yamaha" },
        category: "sport",
        thumbnailUrl: "/bikes/yamaha-r15.webp",
        priceRange: { min: 605000, max: 615000 },
        isElectric: false,
        rating: { average: 4.8, count: 124 },
        specs: {
            engineType: "Liquid-cooled, 4-stroke, SOHC",
            displacement: 155,
            maxPower: "18.4 PS @ 10000 rpm",
            mileage: 45,
            topSpeed: 140
        }
    },
    {
        id: "b2",
        slug: "yamaha-mt15",
        name: "Yamaha MT-15 V2",
        brand: { name: "Yamaha", slug: "yamaha" },
        category: "naked",
        thumbnailUrl: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        priceRange: { min: 525000, max: 535000 },
        isElectric: false,
        rating: { average: 4.6, count: 85 },
        specs: {
            engineType: "Liquid-cooled, 4-stroke, SOHC",
            displacement: 155,
            maxPower: "18.4 PS @ 10000 rpm",
            mileage: 48,
            topSpeed: 130
        }
    },
    {
        id: "b3",
        slug: "honda-cbr-150r",
        name: "Honda CBR 150R",
        brand: { name: "Honda", slug: "honda" },
        category: "sport",
        thumbnailUrl: "/bikes/honda-cb150r.webp",
        priceRange: { min: 565000, max: 580000 },
        isElectric: false,
        rating: { average: 4.7, count: 92 },
        specs: {
            engineType: "Liquid-cooled, 4-stroke, DOHC",
            displacement: 149,
            maxPower: "17.1 PS @ 9000 rpm",
            mileage: 42,
            topSpeed: 135
        }
    }
];

export function useBrandBikes(slug: string) {
    const [bikes, setBikes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            const filtered = MOCK_BRAND_BIKES.filter(b => b.brand.slug === slug);
            setBikes(filtered);
            setIsLoading(false);
        }, 600);
        return () => clearTimeout(timer);
    }, [slug]);

    return { bikes, isLoading };
}
