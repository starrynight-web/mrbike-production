"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Bike,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Camera,
    X,
    Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { BD_CITIES, BIKE_CONDITIONS, VALIDATION } from "@/config/constants";
import { useBrands } from "@/hooks/use-bikes";

// --- Schema ---
const formSchema = z.object({
    brand: z.string().min(1, "Brand is required"),
    model: z.string().min(2, "Model is required"),
    year: z.coerce.number()
        .min(2000, "Year must be 2000 or later")
        .max(new Date().getFullYear(), "Year cannot be in the future"),
    kmDriven: z.coerce.number().min(0, "KM driven cannot be negative"),
    price: z.coerce.number().min(VALIDATION.price.min, `Price must be at least ৳${VALIDATION.price.min}`),
    condition: z.enum(["excellent", "good", "fair", "poor"] as const),
    description: z.string().min(20, "Description must be at least 20 characters").max(2000, "Description too long"),
    location: z.string().min(1, "Location is required"),
    accidentHistory: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

const STEPS = ["Login Check", "Bike Details", "Upload Photos", "Review"];

export function SellBikeWizard() {
    const router = useRouter();
    const { data: brands } = useBrands();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Mock Auth State
    const [isLoading, setIsLoading] = useState(false);
    const [images, setImages] = useState<string[]>([]); // Preview URLs
    const imagesRef = useRef<string[]>([]);

    // Update ref whenever images change
    useEffect(() => {
        imagesRef.current = images;
    }, [images]);

    // Cleanup URLs on component unmount
    useEffect(() => {
        return () => {
            imagesRef.current.forEach(url => {
                URL.revokeObjectURL(url);
            });
        };
    }, []);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormData>({
        // @ts-ignore - zodResolver types can be strict with coercive schemas
        resolver: zodResolver(formSchema),
        defaultValues: {
            brand: "",
            model: "",
            year: new Date().getFullYear(),
            kmDriven: 0,
            price: 0,
            condition: "good",
            accidentHistory: false,
            description: "",
            location: "",
        },
    });

    // --- Actions ---

    const handleLogin = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoggedIn(true);
            setIsLoading(false);
            toast.success("Logged in successfully (Mock)");
            setCurrentStep(2);
        }, 1500);
    };

    const handleNext = async () => {
        if (currentStep === 2) {
            const valid = await form.trigger();
            if (!valid) return;
        }
        if (currentStep === 3 && images.length === 0) {
            toast.error("Please upload at least one photo");
            return;
        }

        setCurrentStep((prev) => Math.min(prev + 1, 4));
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        // Check available slots first
        const availableSlots = 5 - images.length;
        if (availableSlots <= 0) {
            toast.error("Maximum 5 images allowed");
            return;
        }

        // Only convert up to available slots to URLs
        const filesToConvert = Array.from(files).slice(0, availableSlots);
        const newImages = filesToConvert.map(file => URL.createObjectURL(file));

        if (files.length > availableSlots) {
            toast.warning(`Only ${availableSlots} image(s) can be added. ${files.length - availableSlots} file(s) were not added.`);
        }

        setImages([...images, ...newImages]);
    };

    const removeImage = (index: number) => {
        URL.revokeObjectURL(images[index]);
        setImages(images.filter((_, i) => i !== index));
    };

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        setIsSubmitting(true);
        // Simulate API submission
        setTimeout(() => {
            setIsSubmitting(false);
            toast.success("Ad posted successfully! It is under review.");
            router.push("/used-bikes"); // Redirect to listing
        }, 2000);
    };

    // --- Step Components ---

    const renderLoginStep = () => (
        <div className="text-center py-10 space-y-6">
            <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <Bike className="h-10 w-10 text-primary" />
            </div>
            <div>
                <h2 className="text-2xl font-bold mb-2">Login to Sell Your Bike on MrBikeBD</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                    You need to be logged in to post an ad. This helps us verify sellers and keep the marketplace safe.
                </p>
            </div>

            <div className="flex flex-col gap-3 max-w-xs mx-auto">
                <Button onClick={handleLogin} disabled={isLoading} className="w-full" size="lg">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Continue with Google
                </Button>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                </div>
                <Button variant="outline" onClick={handleLogin} disabled={isLoading}>
                    Continue with Phone
                </Button>
            </div>
        </div>
    );

    const renderDetailsStep = () => (
        <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                {/* Brand */}
                <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Select
                        onValueChange={(val) => form.setValue("brand", val)}
                        defaultValue={form.getValues("brand")}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Brand" />
                        </SelectTrigger>
                        <SelectContent>
                            {brands?.map((b: any) => (
                                <SelectItem key={b.id} value={b.slug}>{b.name}</SelectItem>
                            ))}
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                    {form.formState.errors.brand && (
                        <p className="text-red-500 text-sm">{form.formState.errors.brand.message}</p>
                    )}
                </div>

                {/* Model */}
                <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input id="model" placeholder="e.g. R15 V3, Gixxer SF" {...form.register("model")} />
                    {form.formState.errors.model && (
                        <p className="text-red-500 text-sm">{form.formState.errors.model.message}</p>
                    )}
                </div>

                {/* Year */}
                <div className="space-y-2">
                    <Label htmlFor="year">Year of Manufacture</Label>
                    <Input id="year" type="number" {...form.register("year")} />
                    {form.formState.errors.year && (
                        <p className="text-red-500 text-sm">{form.formState.errors.year.message}</p>
                    )}
                </div>

                {/* KM Driven */}
                <div className="space-y-2">
                    <Label htmlFor="kmDriven">Kilometers Driven</Label>
                    <div className="relative">
                        <Input id="kmDriven" type="number" {...form.register("kmDriven")} className="pr-10" />
                        <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">km</span>
                    </div>
                    {form.formState.errors.kmDriven && (
                        <p className="text-red-500 text-sm">{form.formState.errors.kmDriven.message}</p>
                    )}
                </div>

                {/* Price */}
                <div className="space-y-2">
                    <Label htmlFor="price">Expected Price (Tk)</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground font-bold">৳</span>
                        <Input id="price" type="number" {...form.register("price")} className="pl-8" />
                    </div>
                    {form.formState.errors.price && (
                        <p className="text-red-500 text-sm">{form.formState.errors.price.message}</p>
                    )}
                </div>

                {/* Condition */}
                <div className="space-y-2">
                    <Label htmlFor="condition">Condition</Label>
                    <Select
                        onValueChange={(val: any) => form.setValue("condition", val)}
                        defaultValue={form.getValues("condition")}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Condition" />
                        </SelectTrigger>
                        <SelectContent>
                            {BIKE_CONDITIONS.map((c) => (
                                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Location */}
                <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Select
                        onValueChange={(val) => form.setValue("location", val)}
                        defaultValue={form.getValues("location")}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select District/City" />
                        </SelectTrigger>
                        <SelectContent>
                            {BD_CITIES.map((city) => (
                                <SelectItem key={city} value={city}>{city}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {form.formState.errors.location && (
                        <p className="text-red-500 text-sm">{form.formState.errors.location.message}</p>
                    )}
                </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    placeholder="Tell buyers about your bike (mods, service history, scratches, etc.)"
                    className="h-32"
                    {...form.register("description")}
                />
                {form.formState.errors.description && (
                    <p className="text-red-500 text-sm">{form.formState.errors.description.message}</p>
                )}
            </div>

            <div className="flex items-center space-x-2 border p-4 rounded-lg bg-muted/20">
                <Checkbox
                    id="accidentHistory"
                    checked={form.watch("accidentHistory")}
                    onCheckedChange={(checked) => form.setValue("accidentHistory", checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="accidentHistory" className="font-medium cursor-pointer">
                        This bike has been in major accidents
                    </Label>
                    <p className="text-sm text-muted-foreground">
                        Honesty helps build trust with buyers.
                    </p>
                </div>
            </div>
        </div>
    );

    const renderPhotosStep = () => (
        <div className="space-y-6">
            <div className="border-2 border-dashed rounded-xl p-10 text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
                <Input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                />
                <div className="flex flex-col items-center gap-2">
                    <div className="bg-primary/10 p-4 rounded-full">
                        <Camera className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">Click to upload photos</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                        Upload up to 5 clear photos of your bike. Good photos sell faster!
                    </p>
                </div>
            </div>

            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((src, index) => (
                        <div key={index} className="relative aspect-video rounded-lg overflow-hidden border group">
                            <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                            <button
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderReviewStep = () => {
        const values = form.getValues();
        return (
            <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3 text-green-800">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <div>
                        <h4 className="font-semibold">Review your details</h4>
                        <p className="text-sm">Please check everything before posting directly to the marketplace.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-1">
                        <Label className="text-muted-foreground">Bike Model</Label>
                        <p className="font-medium text-lg">{values.brand} {values.model} ({values.year})</p>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-muted-foreground">Price</Label>
                        <p className="font-medium text-lg text-primary">৳{Number(values.price).toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-muted-foreground">Condition</Label>
                        <p className="font-medium capitalize">{values.condition}</p>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-muted-foreground">Location</Label>
                        <p className="font-medium">{values.location}</p>
                    </div>
                </div>

                <div>
                    <Label className="text-muted-foreground">Images</Label>
                    <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                        {images.map((src, i) => (
                            <img key={i} src={src} className="h-20 w-28 object-cover rounded border" alt="" />
                        ))}
                    </div>
                </div>

                <div>
                    <Label className="text-muted-foreground">Description</Label>
                    <p className="mt-1 text-sm bg-muted p-3 rounded-md min-h-[80px]">
                        {values.description}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="mb-8 text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Sell Your Bike on MrBikeBD</h1>
                <p className="text-muted-foreground">Post your ad in 3 simple steps</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
                <div className="grid grid-cols-4 gap-2 mb-2">
                    {STEPS.map((stepName, i) => (
                        <div key={i} className={`h-1.5 rounded-full ${i + 1 <= currentStep ? 'bg-primary' : 'bg-muted'}`} />
                    ))}
                </div>
                <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <span>Login</span>
                    <span className="text-center">Details</span>
                    <span className="text-center">Photos</span>
                    <span className="text-right">Finish</span>
                </div>
            </div>

            <Card className="border-2">
                <CardHeader>
                    <CardTitle>{STEPS[currentStep - 1]}</CardTitle>
                    {/* <CardDescription>Enter the details of the bike you want to sell.</CardDescription> */}
                </CardHeader>
                <CardContent className="min-h-[400px]">
                    {currentStep === 1 && renderLoginStep()}
                    {currentStep === 2 && renderDetailsStep()}
                    {currentStep === 3 && renderPhotosStep()}
                    {currentStep === 4 && renderReviewStep()}
                </CardContent>
                <CardFooter className="flex justify-between border-t bg-muted/10 p-6">
                    {currentStep > 1 && (
                        <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
                            <ChevronLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                    )}

                    {currentStep === 1 ? (
                        <div /> /* Empty div to keep alignment if needed, but Step 1 has its own buttons */
                    ) : currentStep < 4 ? (
                        <Button className="ml-auto" onClick={handleNext}>
                            Next <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button className="ml-auto w-full md:w-auto" onClick={form.handleSubmit(onSubmit as any)} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Post Ad Now
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
