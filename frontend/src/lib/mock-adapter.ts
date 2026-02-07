import bikesData from "@/app/mock/bikes.json";
import { Brand, BikeCategory } from "@/types";

const MOCK_BRANDS: Brand[] = [
  {
    id: "1",
    name: "Yamaha",
    slug: "yamaha",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Yamaha_Motor_Logo_%28full%29.svg/2560px-Yamaha_Motor_Logo_%28full%29.svg.png",
    country: "Japan",
    bikeCount: 15,
    description:
      "Yamaha Motor Company is a Japanese manufacturer of motorcycles, marine products such as boats and outboard motors, and other motorized products.",
  },
  {
    id: "2",
    name: "Honda",
    slug: "honda",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Honda_Logo.svg/1200px-Honda_Logo.svg.png",
    country: "Japan",
    bikeCount: 22,
    description:
      "Honda is the world's largest manufacturer of internal combustion engines measured by volume, producing more than 14 million internal combustion engines each year.",
  },
  {
    id: "3",
    name: "Suzuki",
    slug: "suzuki",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Suzuki_logo_2.svg/2560px-Suzuki_logo_2.svg.png",
    country: "Japan",
    bikeCount: 12,
  },
  {
    id: "4",
    name: "Bajaj",
    slug: "bajaj",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Bajaj_Auto_Logo.svg/1200px-Bajaj_Auto_Logo.svg.png",
    country: "India",
    bikeCount: 18,
  },
  {
    id: "5",
    name: "TVS",
    slug: "tvs",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/TVS_Motor_Company_Logo.svg/1280px-TVS_Motor_Company_Logo.svg.png",
    country: "India",
    bikeCount: 14,
  },
  {
    id: "6",
    name: "Royal Enfield",
    slug: "royal-enfield",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Royal_Enfield_logo.svg/1200px-Royal_Enfield_logo.svg.png",
    country: "India",
    bikeCount: 6,
  },
  {
    id: "7",
    name: "KTM",
    slug: "ktm",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/KTM-Logo_2017.svg/1200px-KTM-Logo_2017.svg.png",
    country: "Austria",
    bikeCount: 8,
  },
  {
    id: "8",
    name: "Hero",
    slug: "hero",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Hero_MotoCorp.svg/1200px-Hero_MotoCorp.svg.png",
    country: "India",
    bikeCount: 16,
  },
];

export const getMockBikes = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Record<string, any> = {},
) => {
  // Filter by category if provided
  let filteredBikes = bikesData.bikes;

  if (params.category) {
    filteredBikes = filteredBikes.filter((bike) =>
      bike.categories?.includes(params.category),
    );
  }

  // Filter by brand if provided
  if (params.brand) {
    const brands = Array.isArray(params.brand) ? params.brand : [params.brand];
    filteredBikes = filteredBikes.filter((bike) =>
      brands.some((b: string) => bike.brand.toLowerCase() === b.toLowerCase()),
    );
  }

  // Map to API response format
  let results = filteredBikes.map((bike) => {
    // Map fields to match API response
    const imageKey = bike.image || "default";
    // @ts-expect-error - images is a dictionary in the JSON
    const imageUrl = bikesData.images[imageKey] || bikesData.images["default"];

    // Extract mileage from variants if available
    let mileage = 0;
    if (bike.variants && bike.variants.std && bike.variants.std.quickSpecs) {
      const mileageStr = bike.variants.std.quickSpecs.mileageCompany;
      // Extract number from string like "45 kmpl"
      mileage = parseFloat(mileageStr) || 0;
    }

    const price = bike.price || 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stdSpecs = (bike.variants?.std?.quickSpecs || {}) as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stdVariant = (bike.variants?.std || {}) as any;

    return {
      id: bike.id,
      slug: bike.id,
      name: bike.name,
      brand: {
        id: "brand-" + bike.brand,
        name: bike.brand,
        slug: bike.brand.toLowerCase(),
        logo: "",
        country: "",
        bikeCount: 0,
      },
      category: (bike.categories?.[0] || "commuter") as BikeCategory,
      variants: [],
      images: [imageUrl],
      thumbnailUrl: imageUrl,
      // Legacy fields for HomePage compatibility
      primary_image: imageUrl,
      price: price,
      mileage: mileage, // HomePage accesses this directly

      description: "",
      specs: {
        engineType: "N/A",
        displacement: parseFloat(stdSpecs.engineCapacity) || 0,
        maxPower: stdSpecs.maxPower || "N/A",
        maxTorque: stdSpecs.maxTorque || "N/A",
        cooling: "N/A",
        fuelSystem: "N/A",
        ignition: "N/A",
        starting: "N/A",
        transmission: stdSpecs.transmission || "N/A",
        clutch: "N/A",
        topSpeed: parseFloat(stdSpecs.topspeedCompany) || 0,
        mileage: mileage,
        fuelCapacity: parseFloat(stdSpecs.fuelTank) || 0,
        length: 0,
        width: 0,
        height: 0,
        wheelbase: 0,
        groundClearance: 0,
        seatHeight: 0,
        kerbWeight: parseFloat(stdSpecs.kerbWeight) || 0,
        frontBrake: stdVariant.brakingSystem || "N/A",
        rearBrake: "N/A",
        frontSuspension: "N/A",
        rearSuspension: "N/A",
        abs: (stdVariant.abs ? "Single Channel" : "None") as
          | "Single Channel"
          | "Dual Channel"
          | "None",
        frontTyre: stdVariant.frontTire || "N/A",
        rearTyre: stdVariant.rearTire || "N/A",
        wheelType: "N/A",
        headlight: stdVariant.headlightType || "N/A",
        taillight: "N/A",
        battery: "N/A",
      },
      priceRange: {
        min: price,
        max: price,
      },
      rating: {
        average: bike.rating || 0,
        count: 0,
      },
      popularityScore: (bike.rating || 4.5) * 20,
      resaleScore: 0,
      demandScore: 0,
      isElectric: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  // Handle limits
  if (params.limit) {
    results = results.slice(0, params.limit);
  }

  return {
    data: {
      results,
      count: results.length,
      next: null,
      previous: null,
    },
  };
};

export const getMockBikeBySlug = (slug: string) => {
  const { data } = getMockBikes();
  const bike = data.results.find((b) => b.slug === slug || b.id === slug);
  if (!bike) {
    throw new Error("Bike not found in mock data");
  }

  // Get the original bike data from bikes.json to preserve variants
  const originalBike = bikesData.bikes.find((b) => b.id === slug);

  // Merge the transformed API-like structure with the original variants
  return {
    data: {
      ...bike,
      // Preserve the original variants object for the detail page
      variants: originalBike?.variants || {},
    },
  };
};

export const getMockSimilarBikes = (slug?: string) => {
  const { data } = getMockBikes({ limit: 4 });
  return { data: data.results.filter((b) => b.slug !== slug) };
};

export const getMockBrands = () => {
  return { data: MOCK_BRANDS };
};

const MOCK_NEWS = [
  {
    id: "1",
    slug: "yamaha-r15m-review",
    title: "Yamaha R15M: The Ultimate Track Machine for the Streets?",
    excerpt:
      "We test ride the new Yamaha R15M to see if the premium price tag justifies the features and performance upgrades.",
    content: "Full review content here...",
    featuredImage:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Yamaha_Motor_Logo_%28full%29.svg/2560px-Yamaha_Motor_Logo_%28full%29.svg.png",
    author: {
      id: "a1",
      name: "Rahim Uddin",
      image: "",
      bio: "Senior Test Rider",
    },
    category: "review",
    tags: ["yamaha", "r15m", "review", "sports"],
    views: 5420,
    publishedAt: new Date("2023-11-15"),
    updatedAt: new Date("2023-11-15"),
  },
  {
    id: "2",
    slug: "honda-cbr-150r-launch",
    title: "New Honda CBR 150R Officially Launched in Bangladesh",
    excerpt:
      "Honda Bangladesh has unveiled the latest iteration of the CBR 150R with aggressive styling and new color options.",
    content: "Launch details content...",
    featuredImage:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Honda_Logo.svg/1200px-Honda_Logo.svg.png",
    author: {
      id: "a2",
      name: "Karim Hasan",
      image: "",
      bio: "Auto Journalist",
    },
    category: "launch",
    tags: ["honda", "cbr150r", "launch"],
    views: 3200,
    publishedAt: new Date("2023-12-01"),
    updatedAt: new Date("2023-12-01"),
  },
  {
    id: "3",
    slug: "motorcycle-maintenance-tips",
    title: "5 Essential Maintenance Tips for Your Bike in Winter",
    excerpt:
      "Keep your motorcycle running smoothly during the cold months with these essential maintenance tips.",
    content: "Maintenance guide...",
    featuredImage:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Suzuki_logo_2.svg/2560px-Suzuki_logo_2.svg.png",
    author: {
      id: "a1",
      name: "Rahim Uddin",
      image: "",
      bio: "Senior Test Rider",
    },
    category: "tips",
    tags: ["maintenance", "winter", "tips"],
    views: 1500,
    publishedAt: new Date("2023-12-10"),
    updatedAt: new Date("2023-12-10"),
  },
];

export const getMockNews = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Record<string, any> = {},
) => {
  let filteredNews = MOCK_NEWS;

  if (params.category__slug) {
    filteredNews = filteredNews.filter(
      (n) => n.category === params.category__slug,
    );
  }

  return {
    data: {
      results: filteredNews,
      count: filteredNews.length,
      next: null,
      previous: null,
    },
  };
};

export const getMockNewsArticle = (slug: string) => {
  const article = MOCK_NEWS.find((n) => n.slug === slug);
  return { data: article };
};

const MOCK_USED_BIKES = [
  {
    id: "ub-1",
    bikeName: "Yamaha R15 V3",
    brandName: "Yamaha",
    sellerId: "s-1",
    sellerName: "Sajid Khan",
    sellerPhone: "017********",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Yamaha_Motor_Logo_%28full%29.svg/2560px-Yamaha_Motor_Logo_%28full%29.svg.png",
    ],
    thumbnailUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Yamaha_Motor_Logo_%28full%29.svg/2560px-Yamaha_Motor_Logo_%28full%29.svg.png",
    price: 350000,
    year: 2021,
    kmDriven: 12000,
    condition: "excellent",
    accidentHistory: false,
    location: {
      city: "Dhaka",
      area: "Mirpur",
    },
    status: "active",
    isFeatured: true,
    isVerified: true,
    expiresAt: new Date("2024-12-31"),
    createdAt: new Date("2023-10-01"),
    updatedAt: new Date("2023-10-01"),
  },
  {
    id: "ub-2",
    bikeName: "Suzuki Gixxer SF",
    brandName: "Suzuki",
    sellerId: "s-2",
    sellerName: "Tanvir Ahmed",
    sellerPhone: "018********",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Suzuki_logo_2.svg/2560px-Suzuki_logo_2.svg.png",
    ],
    thumbnailUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Suzuki_logo_2.svg/2560px-Suzuki_logo_2.svg.png",
    price: 180000,
    year: 2019,
    kmDriven: 25000,
    condition: "good",
    accidentHistory: false,
    location: {
      city: "Chittagong",
      area: "Agrabad",
    },
    status: "active",
    isFeatured: false,
    isVerified: true,
    expiresAt: new Date("2024-12-30"),
    createdAt: new Date("2023-10-05"),
    updatedAt: new Date("2023-10-05"),
  },
];

export const getMockUsedBikes = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Record<string, any> = {},
) => {
  let filtered = MOCK_USED_BIKES;

  if (params.featured) {
    filtered = filtered.filter((b) => b.isFeatured);
  }

  return {
    data: {
      results: filtered,
      count: filtered.length,
      next: null,
      previous: null,
    },
  };
};

export const getMockReviews = (bikeId: string | number) => {
  return {
    data: [
      {
        id: 1,
        bikeId,
        userId: "u1",
        userName: "Bike Enthusiast",
        userImage: "",
        rating: 5,
        comment: "Amazing bike! The performance is top-notch.",
        createdAt: new Date().toISOString(),
        likes: 12,
        isVerifiedOwner: true,
      },
      {
        id: 2,
        bikeId,
        userId: "u2",
        userName: "Daily Commuter",
        userImage: "",
        rating: 4,
        comment: "Good mileage but suspension is a bit stiff.",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        likes: 5,
        isVerifiedOwner: true,
      },
    ],
  };
};

export const getMockWishlist = () => {
  return {
    data: {
      items: [], // Start empty or add mock items if needed
    },
  };
};

export const getMockUserStats = () => {
  return {
    data: {
      reviewsCount: 2,
      wishlistCount: 5,
      joinedAt: new Date("2023-01-01").toISOString(),
    },
  };
};

export const getMockProfile = () => {
  return {
    data: {
      id: "u1",
      email: "user@example.com",
      firstName: "John",
      lastName: "Doe",
      phone: "+8801700000000",
      avatar: "",
    },
  };
};
