"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm, useWatch, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSession, signIn } from "next-auth/react";
import { api } from "@/lib/api-service";
import { useShop } from "@/hooks/use-shop";
import { cn } from "@/lib/utils";
import { useAuthStore, useWishlistStore, useUIStore } from "@/store";
import {
  Store,
  Bike,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Camera,
  X,
  Loader2,
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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { BD_CITIES, BIKE_CONDITIONS, VALIDATION } from "@/config/constants";
import { useBrands } from "@/hooks/use-bikes";
import { compressImage } from "@/lib/image-utils";

// --- Schema ---
const formSchema = z.object({
  brand: z.string().min(1, "Brand is required"),
  customBrandInput: z.string().optional(),
  model: z.string().min(2, "Model is required"),
  year: z.coerce
    .number()
    .min(2000, "Year must be 2000 or later")
    .max(new Date().getFullYear(), "Year cannot be in the future"),
  kmDriven: z.coerce.number().min(0, "KM driven cannot be negative"),
  price: z.coerce
    .number()
    .min(
      VALIDATION.price.min,
      `Price must be at least ৳${VALIDATION.price.min}`,
    ),
  condition: z.enum(["excellent", "good", "fair", "need_work"] as const),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description too long"),
  location: z.string().min(1, "Location is required"),
  accidentHistory: z.boolean().default(false),
  contactNumber: z.string().min(11, "Valid contact number is required"),
  whatsappNumber: z.string().optional(),
  engineCC: z.coerce.number().min(50, "CC must be at least 50").max(2000, "Invalid CC"),
  hasOriginalPapers: z.boolean().default(true),
  registrationYear: z.coerce.number().optional(),
  registrationType: z.string().optional(),
  engineCondition: z.string().min(3, "Required"),
  bodyCondition: z.string().min(3, "Required"),
  modifications: z.string().optional(),
  ownershipCount: z.coerce.number().min(1, "Required"),
  shopId: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const STEPS = ["Login", "Bike Details", "Upload Photos", "Review"];

export function SellBikeWizard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { isAuthenticated } = useAuthStore();
  const { data: brands } = useBrands();
  const { shop } = useShop();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState<string[]>([]); // Preview URLs
  const [imageFiles, setImageFiles] = useState<File[]>([]); // Actual files
  const imagesRef = useRef<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Declare form first so it can be used in effects
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
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
      contactNumber: "",
      whatsappNumber: "",
      engineCC: 150,
      hasOriginalPapers: true,
      registrationYear: new Date().getFullYear(),
      registrationType: "Digital Plate",
      engineCondition: "Solid Engine",
      bodyCondition: "No Scratches",
      modifications: "None",
      ownershipCount: 1,
      shopId: "",
    },
  });

  const watchedValues = useWatch({ control: form.control }); // Watch all values for review step
  const priceToDisplay = watchedValues.price || 0;

  // Effects that depend on form/watchedValues
  const lastValidPrice = useRef<number>(0);
  useEffect(() => {
    const currentPrice = form.getValues("price");
    if (currentPrice > 0 && currentPrice !== lastValidPrice.current) {
        lastValidPrice.current = currentPrice;
    }
  }, [watchedValues.price, form]);

  useEffect(() => {
    if ((status === "authenticated" || isAuthenticated) && currentStep === 1) {
      setCurrentStep(2);
    }
  }, [status, isAuthenticated, currentStep]);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  // Pre-fill contact number
  useEffect(() => {
    if (session?.user?.phone && !form.getValues("contactNumber")) {
      form.setValue("contactNumber", session.user.phone);
    }
  }, [session, form]);

  // Auto-set shopId
  useEffect(() => {
    if (shop?.id) {
       form.setValue("shopId", shop.id.toString());
    }
  }, [shop, form]);

  // --- Actions ---

  const onSubmit: SubmitHandler<FormData> = async (_data) => {
    if (isSubmitting) return;
    if (!session && !isAuthenticated) {
      toast.error("You must be logged in to post an ad");
      return;
    }

    let toastId: string | number | undefined;
    try {
      setIsSubmitting(true);
      toastId = toast.loading("Processing your listing...");
    
      console.log("[WIZARD] Submitting ad listing...", {
        price: _data.price,
        authStatus: { session: !!session, isAuthenticated },
        images: imageFiles.length
      });
      
      const formData = new FormData();
      const isOther = _data.brand === "other";
      const finalBrand = isOther ? (_data.customBrandInput || "Other") : _data.brand;

      formData.append("title", `${finalBrand} ${_data.model} ${_data.year}`);
      formData.append("price", _data.price.toString());
      formData.append("mileage", _data.kmDriven.toString());
      formData.append("manufacturing_year", _data.year.toString());
      formData.append("condition", _data.condition);
      formData.append("description", _data.description);
      formData.append("location", _data.location);
      formData.append("location_city", _data.location);
      formData.append("custom_brand", finalBrand);
      formData.append("custom_model", _data.model);
      formData.append("contact_number", _data.contactNumber);
      
      if (_data.whatsappNumber) {
        formData.append("whatsapp_number", _data.whatsappNumber);
      }

      formData.append("engine_cc", _data.engineCC.toString());
      formData.append("has_original_papers", _data.hasOriginalPapers ? "true" : "false");
      formData.append("registration_year", (_data.registrationYear || _data.year).toString());
      if (_data.registrationType) {
        formData.append("registration_type", _data.registrationType);
      }
      formData.append("engine_condition", _data.engineCondition);
      formData.append("body_condition", _data.bodyCondition);
      formData.append("modifications", _data.modifications || "None");
      formData.append("ownership_count", _data.ownershipCount.toString());
      
      if (_data.shopId) {
        formData.append("shop", _data.shopId);
      }

      // Compress and append images
      toast.loading(`Compressing ${imageFiles.length} images...`, { id: toastId });
      
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        try {
          const compressedBlob = await compressImage(file, { 
            quality: 0.95, 
            maxWidth: 1920,
            maxHeight: 1920 
          });
          const compressedFile = new File([compressedBlob], file.name, { type: "image/jpeg" });
          formData.append("uploaded_images", compressedFile);
        } catch (err) {
          console.error("Compression failed for image", i, err);
          formData.append("uploaded_images", file); // Fallback
        }
      }

      toast.loading("Uploading to server...", { id: toastId });
      const response = await api.createUsedBike(formData);
      
      if (!response.success) {
        throw new Error(response.error?.message || "Failed to create listing");
      }
 
      toast.success("Ad posted successfully! It is under review.", { id: toastId });
      router.push("/used-bikes");
    } catch (error: any) {
      console.error("Failed to post ad:", error);
      toast.error(error.message || "Failed to post ad. Please try again.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = () => {
    if (status === "unauthenticated" && !isAuthenticated) {
      signIn();
    } else if (status === "authenticated" || isAuthenticated) {
      setCurrentStep(2);
    }
  };

  const handleNext = async () => {
    if (currentStep === 2) {
      const valid = await form.trigger();
      if (!valid) {
        const errors = form.formState.errors;
        const firstErrorKey = Object.keys(errors)[0] as keyof typeof errors;
        if (firstErrorKey) {
          const element = document.getElementById(firstErrorKey);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          } else {
            const fieldElement = document.querySelector(`[name="${firstErrorKey}"]`);
            fieldElement?.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
        return;
      }
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

    const availableSlots = 5 - images.length;
    if (availableSlots <= 0) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    const filesToConvert = Array.from(files).slice(0, availableSlots);
    const newImages = filesToConvert.map((file) => URL.createObjectURL(file));

    if (files.length > availableSlots) {
      toast.warning(`Only ${availableSlots} image(s) can be added.`);
    }

    setImages([...images, ...newImages]);
    setImageFiles([...imageFiles, ...filesToConvert]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(images[index]);
    setImages(images.filter((_, i) => i !== index));
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8 text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Sell Your Bike on MrBikeBD
        </h1>
        <p className="text-muted-foreground">Post your ad in simple steps</p>
      </div>

      <div className="mb-8">
        <div className="grid grid-cols-4 gap-2 mb-2">
          {STEPS.map((stepName, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full ${i + 1 <= currentStep ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <span>Login</span>
          <span className="text-center">Details</span>
          <span className="text-center">Photos</span>
          <span className="text-right">Finish</span>
        </div>
      </div>

      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1]}</CardTitle>
        </CardHeader>
        <CardContent className="min-h-[400px]">
          {currentStep === 1 && (
            <div className="text-center py-10 space-y-6">
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <Bike className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Login TO Continue</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Please log in to your account to post an ad on the marketplace.
                </p>
              </div>

              {status === "unauthenticated" && !isAuthenticated ? (
                <div className="flex flex-col gap-3 max-w-xs mx-auto">
                  <Button onClick={handleLogin} className="w-full h-12 text-lg" size="lg">
                    Login TO Continue
                  </Button>
                </div>
              ) : (
                <div className="py-4">
                  <p className="text-green-600 font-medium">Authentication Verified. You can proceed.</p>
                  <Button onClick={() => setCurrentStep(2)} className="mt-4">Continue to Details</Button>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Controller
                    name="brand"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="brand">
                          <SelectValue placeholder="Select Brand" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands?.map((b: any) => (
                            <SelectItem key={b.id} value={b.slug}>
                              {b.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.brand && <p className="text-red-500 text-sm">{form.formState.errors.brand.message}</p>}
                </div>

                {watchedValues.brand === "other" && (
                  <div className="space-y-2">
                    <Label htmlFor="customBrandInput">Custom Brand Name</Label>
                    <Input id="customBrandInput" {...form.register("customBrandInput")} />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" {...form.register("model")} />
                  {form.formState.errors.model && <p className="text-red-500 text-sm">{form.formState.errors.model.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Year of Manufacture</Label>
                  <Input id="year" type="number" {...form.register("year")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kmDriven">Kilometers Driven</Label>
                  <Input id="kmDriven" type="number" {...form.register("kmDriven")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Expected Price (Tk)</Label>
                  <Input id="price" type="number" {...form.register("price")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Controller
                    name="condition"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="condition">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BIKE_CONDITIONS.map((c) => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Controller
                    name="location"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="location">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BD_CITIES.map((city) => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" className="h-32" {...form.register("description")} />
              </div>

              <div className="flex items-center space-x-2 border p-4 rounded-lg bg-muted/20">
                <Checkbox
                  id="accidentHistory"
                  checked={watchedValues.accidentHistory}
                  onCheckedChange={(checked) => form.setValue("accidentHistory", !!checked)}
                />
                <Label htmlFor="accidentHistory" className="font-medium cursor-pointer">Major accidents in history</Label>
              </div>

              <div className="pt-4 border-t space-y-6">
                <h3 className="text-lg font-semibold">Technical Specs</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="engineCC">Engine CC</Label>
                    <Input id="engineCC" type="number" {...form.register("engineCC")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownershipCount">Ownership</Label>
                    <Controller
                      name="ownershipCount"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                          <SelectTrigger id="ownershipCount"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1st Owner</SelectItem>
                            <SelectItem value="2">2nd Owner</SelectItem>
                            <SelectItem value="3">3rd Owner</SelectItem>
                            <SelectItem value="4">4th+</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input id="contactNumber" {...form.register("contactNumber")} />
              </div>

              {shop && (
                <div className="flex items-center space-x-2 border-2 border-orange-100 p-4 rounded-xl bg-orange-50/50">
                  <Checkbox
                    id="postAsShop"
                    checked={!!watchedValues.shopId}
                    onCheckedChange={(checked) => form.setValue("shopId", checked ? shop.id.toString() : "")}
                  />
                  <Label htmlFor="postAsShop" className="font-bold cursor-pointer text-orange-700 flex items-center gap-2">
                    <Store className="h-4 w-4" /> Post as "{shop.name}"
                  </Label>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-2 border-dashed rounded-xl p-10 text-center hover:bg-muted/50 cursor-pointer relative min-h-[200px] flex items-center justify-center">
                <Input type="file" className="absolute inset-0 w-full h-full opacity-0 z-10" accept="image/*" multiple onChange={handleImageUpload} />
                <div className="flex flex-col items-center gap-2">
                  <Camera className="h-8 w-8 text-primary" />
                  <h3 className="font-semibold text-lg">Click to upload photos</h3>
                  <p className="text-muted-foreground text-sm">Upload up to 5 clear photos.</p>
                </div>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((src, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden border group">
                      <Image src={src} alt="Preview" fill className="object-cover" />
                      <button onClick={() => removeImage(index)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"><X className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <Label className="text-muted-foreground">Price</Label>
                  <p className="font-bold text-2xl text-primary">৳{Number(priceToDisplay).toLocaleString("en-BD")}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Bike</Label>
                  <p className="font-medium">{watchedValues.brand} {watchedValues.model} ({watchedValues.year})</p>
                </div>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Details Summary</h4>
                <p className="text-sm line-clamp-3">{watchedValues.description}</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t bg-muted/10 p-6">
          {currentStep > 1 && <Button variant="outline" onClick={handleBack} disabled={isSubmitting}><ChevronLeft className="mr-2 h-4 w-4" /> Back</Button>}
          {currentStep > 1 && currentStep < 4 ? (
            <Button className="ml-auto" onClick={handleNext}>Next <ChevronRight className="ml-2 h-4 w-4" /></Button>
          ) : currentStep === 4 ? (
            <Button className="ml-auto px-8" onClick={() => form.handleSubmit(onSubmit)()} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Post Ad Now
            </Button>
          ) : null}
        </CardFooter>
      </Card>
    </div>
  );
}
