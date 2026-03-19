"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm, useWatch, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSession, signIn } from "next-auth/react";
import { api } from "@/lib/api-service";
import {
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
});

type FormData = z.infer<typeof formSchema>;

const STEPS = ["Login", "Bike Details", "Upload Photos", "Review"];

export function SellBikeWizard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { data: brands } = useBrands();
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState<string[]>([]); // Preview URLs
  const [imageFiles, setImageFiles] = useState<File[]>([]); // Actual files
  const imagesRef = useRef<string[]>([]);

  // Auto-advance if logged in and verified
  useEffect(() => {
    if (status === "authenticated" && currentStep === 1) {
      setCurrentStep(2);
    }
  }, [status, session, currentStep]);

  // Update ref whenever images change
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  // Cleanup URLs on component unmount
  useEffect(() => {
    return () => {
      imagesRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit: SubmitHandler<FormData> = async (_data) => {
    if (isSubmitting) return;
    if (!session) {
      toast.error("You must be logged in to post an ad");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Processing your listing...");

    try {
      const formData = new FormData();
      
      const isOther = _data.brand === "other";
      const finalBrand = isOther ? (_data.customBrandInput || "Other") : _data.brand;

      // Explicitly map fields to match backend expectations
      formData.append("title", `${finalBrand} ${_data.model} ${_data.year}`);
      formData.append("price", _data.price.toString());
      formData.append("mileage", _data.kmDriven.toString());
      formData.append("manufacturing_year", _data.year.toString());
      formData.append("condition", _data.condition);
      formData.append("description", _data.description);
      formData.append("location", _data.location);
      formData.append("location_city", _data.location); // Ensure city-based URL works
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

      // Compress and append images
      toast.loading(`Compressing ${imageFiles.length} images...`, { id: toastId });
      
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        try {
          // Use high quality for 'premium' feel and Full HD resolution
          const compressedBlob = await compressImage(file, { 
            quality: 0.95, 
            maxWidth: 1920,
            maxHeight: 1920 
          });
          const compressedFile = new File([compressedBlob], file.name, { type: "image/jpeg" });
          formData.append("uploaded_images", compressedFile);
        } catch (err) {
          console.error("Compression failed for image", i, err);
          formData.append("uploaded_images", file); // Fallback to original
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

  const form = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    },
  });

  const watchedValues = useWatch({ control: form.control }); // Watch all values for review step

  // --- Actions ---

  const handleLogin = () => {
    if (status === "unauthenticated") {
      signIn();
    } else if (status === "authenticated") {
      setCurrentStep(2);
    }
  };

  const handleNext = async () => {
    if (currentStep === 2) {
      const valid = await form.trigger();
      if (!valid) {
        // Find first error and scroll to it
        const errors = form.formState.errors;
        const firstErrorKey = Object.keys(errors)[0] as keyof typeof errors;
        if (firstErrorKey) {
          const element = document.getElementById(firstErrorKey);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          } else {
            // Fallback for custom components that might not have ID on the root
            const fieldElement = document.querySelector(
              `[name="${firstErrorKey}"]`,
            );
            fieldElement?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
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

    // Check available slots first
    const availableSlots = 5 - images.length;
    if (availableSlots <= 0) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    // Only convert up to available slots to URLs
    const filesToConvert = Array.from(files).slice(0, availableSlots);
    const newImages = filesToConvert.map((file) => URL.createObjectURL(file));

    if (files.length > availableSlots) {
      toast.warning(
        `Only ${availableSlots} image(s) can be added. ${files.length - availableSlots} file(s) were not added.`,
      );
    }

    setImages([...images, ...newImages]);
    setImageFiles([...imageFiles, ...filesToConvert]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(images[index]);
    setImages(images.filter((_, i) => i !== index));
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  // Pre-fill contact number if available
  useEffect(() => {
    if (session?.user?.phone && !form.getValues("contactNumber")) {
      form.setValue("contactNumber", session.user.phone);
    }
  }, [session, form]);


  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8 text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Sell Your Bike on MrBikeBD
        </h1>
        <p className="text-muted-foreground">Post your ad in 3 simple steps</p>
      </div>

      {/* Progress Bar */}
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

      <Card className="border-2">
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1]}</CardTitle>
        </CardHeader>
        <CardContent className="min-h-[400px]">
          {currentStep === 1 && (
            <div className="text-center py-10 space-y-6">
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <Bike className="h-10 w-10 text-primary" />
              </div>
              
              {status === "loading" ? (
                <div className="space-y-4">
                  <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
                  <p className="text-muted-foreground font-medium text-lg">Checking your session...</p>
                </div>
              ) : (
                <>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                       {status === "authenticated" ? "Ready to sell your bike!" : "Login to Sell Your Bike on MrBikeBD"}
                    </h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      {status === "authenticated" 
                        ? "You are logged in and ready to post. Click 'Next' to proceed." 
                        : "You need to be logged in to post an ad. This helps us verify sellers and keep the marketplace safe."}
                    </p>
                  </div>

                  {status === "unauthenticated" && (
                    <div className="flex flex-col gap-3 max-w-xs mx-auto">
                      <Button onClick={handleLogin} className="w-full" size="lg">
                        Continue with Google
                      </Button>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            Or
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" onClick={handleLogin}>
                        Continue with Phone
                      </Button>
                    </div>
                  )}
                  
                  {status === "authenticated" && (
                    <Button onClick={() => setCurrentStep(2)} className="w-full max-w-xs mx-auto" size="lg">
                       Start Listing <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Brand */}
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Controller
                    name="brand"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger id="brand">
                          <SelectValue placeholder="Select Brand" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands?.map(
                            (b: {
                              id: string | number;
                              slug: string;
                              name: string;
                            }) => (
                              <SelectItem key={b.id} value={b.slug}>
                                {b.name}
                              </SelectItem>
                            ),
                          )}
                          <SelectItem value="yamaha">Yamaha</SelectItem>
                          <SelectItem value="gpx-demon">GPX Demon</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.brand && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.brand.message}
                    </p>
                  )}
                </div>

                {/* Custom Brand Input (Conditional) */}
                {watchedValues.brand === "other" && (
                  <div className="space-y-2">
                    <Label htmlFor="customBrandInput">Custom Brand Name</Label>
                    <Input
                      id="customBrandInput"
                      placeholder="Enter brand name (e.g. Gpx Demon, Lifan)"
                      {...form.register("customBrandInput")}
                    />
                    {form.formState.errors.customBrandInput && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.customBrandInput.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Model */}
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    placeholder="e.g. R15 V3, Gixxer SF"
                    {...form.register("model")}
                  />
                  {form.formState.errors.model && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.model.message}
                    </p>
                  )}
                </div>

                {/* Year */}
                <div className="space-y-2">
                  <Label htmlFor="year">Year of Manufacture</Label>
                  <Input
                    id="year"
                    type="number"
                    {...form.register("year")}
                    onFocus={(e) => e.target.select()}
                  />
                  {form.formState.errors.year && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.year.message}
                    </p>
                  )}
                </div>

                {/* KM Driven */}
                <div className="space-y-2">
                  <Label htmlFor="kmDriven">Kilometers Driven</Label>
                  <div className="relative">
                    <Input
                      id="kmDriven"
                      type="number"
                      {...form.register("kmDriven")}
                      className="pr-10"
                      onFocus={(e) => {
                        if (e.target.value === "0") {
                          form.setValue("kmDriven", "" as any);
                        }
                        e.target.select();
                      }}
                    />
                    <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">
                      km
                    </span>
                  </div>
                  {form.formState.errors.kmDriven && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.kmDriven.message}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price">Expected Price (Tk)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground font-bold">
                      ৳
                    </span>
                    <Input
                      id="price"
                      type="number"
                      {...form.register("price")}
                      className="pl-8"
                      onFocus={(e) => {
                        if (e.target.value === "0") {
                          form.setValue("price", "" as any);
                        }
                        e.target.select();
                      }}
                    />
                  </div>
                  {form.formState.errors.price && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.price.message}
                    </p>
                  )}
                </div>

                {/* Condition */}
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Controller
                    name="condition"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger id="condition">
                          <SelectValue placeholder="Select Condition" />
                        </SelectTrigger>
                        <SelectContent>
                          {BIKE_CONDITIONS.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Controller
                    name="location"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger id="location">
                          <SelectValue placeholder="Select District/City" />
                        </SelectTrigger>
                        <SelectContent>
                          {BD_CITIES.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.location && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.location.message}
                    </p>
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
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2 border p-4 rounded-lg bg-muted/20">
                <Checkbox
                  id="accidentHistory"
                  checked={watchedValues.accidentHistory}
                  onCheckedChange={(checked) =>
                    form.setValue("accidentHistory", checked as boolean)
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="accidentHistory"
                    className="font-medium cursor-pointer"
                  >
                    This bike has been in major accidents
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Honesty helps build trust with buyers.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t space-y-6">
                <h3 className="text-lg font-semibold">Technical Specifications</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Engine CC */}
                  <div className="space-y-2">
                    <Label htmlFor="engineCC">Engine CC</Label>
                    <Input
                      id="engineCC"
                      type="number"
                      placeholder="e.g. 150, 160"
                      {...form.register("engineCC")}
                    />
                    {form.formState.errors.engineCC && (
                      <p className="text-red-500 text-sm">{form.formState.errors.engineCC.message}</p>
                    )}
                  </div>

                  {/* Ownership Count */}
                  <div className="space-y-2">
                    <Label htmlFor="ownershipCount">Ownership</Label>
                    <Controller
                      name="ownershipCount"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                          <SelectTrigger id="ownershipCount">
                            <SelectValue placeholder="Select Ownership" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1st Owner</SelectItem>
                            <SelectItem value="2">2nd Owner</SelectItem>
                            <SelectItem value="3">3rd Owner</SelectItem>
                            <SelectItem value="4">4th Owner+</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {/* Registration Year */}
                  <div className="space-y-2">
                    <Label htmlFor="registrationYear">Registration Year</Label>
                    <Input
                      id="registrationYear"
                      type="number"
                      placeholder="e.g. 2024"
                      {...form.register("registrationYear")}
                    />
                  </div>

                  {/* Registration Type */}
                  <div className="space-y-2">
                    <Label htmlFor="registrationType">Registration Type</Label>
                    <Controller
                      name="registrationType"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger id="registrationType">
                            <SelectValue placeholder="Select Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Digital Plate">Digital Number Plate</SelectItem>
                            <SelectItem value="Analog Plate">Analog Number Plate</SelectItem>
                            <SelectItem value="Apply Done">Registration Applied (Done)</SelectItem>
                            <SelectItem value="Not Registered">Not Registered</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {/* Papers Status */}
                  <div className="flex items-center space-x-2 border p-4 rounded-lg bg-muted/20 h-[58px] mt-auto">
                    <Checkbox
                      id="hasOriginalPapers"
                      checked={watchedValues.hasOriginalPapers}
                      onCheckedChange={(checked) =>
                        form.setValue("hasOriginalPapers", checked as boolean)
                      }
                    />
                    <Label htmlFor="hasOriginalPapers" className="font-medium cursor-pointer">
                      I have original papers
                    </Label>
                  </div>

                  {/* Engine Condition */}
                  <div className="space-y-2">
                    <Label htmlFor="engineCondition">Engine Condition</Label>
                    <Input
                      id="engineCondition"
                      placeholder="e.g. Fresh, Never Opened"
                      {...form.register("engineCondition")}
                    />
                  </div>

                  {/* Body Condition */}
                  <div className="space-y-2">
                    <Label htmlFor="bodyCondition">Body Condition</Label>
                    <Input
                      id="bodyCondition"
                      placeholder="e.g. Neat & Clean"
                      {...form.register("bodyCondition")}
                    />
                  </div>
                </div>

                {/* Modifications */}
                <div className="space-y-2">
                  <Label htmlFor="modifications">Modifications (Optional)</Label>
                  <Input
                    id="modifications"
                    placeholder="e.g. Exhaust, Handlebar, etc."
                    {...form.register("modifications")}
                  />
                </div>
              </div>

              {/* Contact Number */}
              <div className="space-y-2">
                <Label htmlFor="contactNumber">
                  Contact Number (For Buyers)
                </Label>
                <Input
                  id="contactNumber"
                  placeholder="e.g. 01XXXXXXXXX"
                  {...form.register("contactNumber")}
                />
                <p className="text-xs text-muted-foreground">
                  Buyers will use this number to contact you.
                </p>
                {form.formState.errors.contactNumber && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.contactNumber.message}
                  </p>
                )}
              </div>

              {/* Whatsapp Number */}
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber">
                  Whatsapp Number (Optional)
                </Label>
                <Input
                  id="whatsappNumber"
                  placeholder="e.g. 01XXXXXXXXX"
                  {...form.register("whatsappNumber")}
                />
                <p className="text-xs text-muted-foreground">
                  Provide your Whatsapp number if different from your contact number.
                </p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6" id="sell-bike-step-3">
              <div className="border-2 border-dashed rounded-xl p-10 text-center hover:bg-muted/50 transition-colors cursor-pointer relative min-h-[300px] flex flex-col items-center justify-center overflow-hidden">
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  title="Click to upload bike photos"
                />
                <div className="flex flex-col items-center gap-4 relative z-0 pointer-events-none">
                  <div className="bg-primary/10 p-5 rounded-full ring-8 ring-primary/5">
                    <Camera className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-xl text-foreground">
                      Add clear photos of your bike
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                      Upload up to 5 photos. High-quality images attract 3x more buyers!
                    </p>
                  </div>
                  <div className="flex gap-2 text-xs font-medium text-primary/80 bg-primary/5 px-3 py-1 rounded-full border border-primary/20">
                    JPG, PNG • Min. 1 photo required
                  </div>
                </div>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((src, index) => (
                    <div
                      key={index}
                      className="relative aspect-video rounded-lg overflow-hidden border group"
                    >
                      <Image
                        src={src}
                        alt={`Preview ${index}`}
                        fill
                        className="object-cover"
                      />
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
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3 text-green-800">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <div>
                  <h4 className="font-semibold">Review your details</h4>
                  <p className="text-sm">
                    Please check everything before posting directly to the
                    marketplace.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Bike Model</Label>
                    <p className="font-medium text-lg">
                      {watchedValues.brand === "other" ? watchedValues.customBrandInput : watchedValues.brand} {watchedValues.model} (
                      {watchedValues.year})
                    </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Price</Label>
                  <p className="font-medium text-lg text-primary">
                    ৳{Number(watchedValues.price).toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Condition</Label>
                  <p className="font-medium capitalize">
                    {watchedValues.condition}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Location</Label>
                  <p className="font-medium">{watchedValues.location}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Contact</Label>
                  <p className="font-medium">{watchedValues.contactNumber}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Whatsapp</Label>
                  <p className="font-medium text-green-600">{watchedValues.whatsappNumber || "Not provided"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Engine CC</Label>
                  <p className="font-medium">{watchedValues.engineCC} CC</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Ownership</Label>
                  <p className="font-medium">{watchedValues.ownershipCount} Owner(s)</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Registration</Label>
                  <p className="font-medium">{watchedValues.registrationYear || "Not registered"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Reg. Type</Label>
                  <p className="font-medium">{watchedValues.registrationType || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Papers</Label>
                  <p className="font-medium">{watchedValues.hasOriginalPapers ? "Original Papers Available" : "No Papers"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Engine Condition</Label>
                  <p className="font-medium">{watchedValues.engineCondition}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Body Condition</Label>
                  <p className="font-medium">{watchedValues.bodyCondition}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Modifications</Label>
                  <p className="font-medium">{watchedValues.modifications || "None"}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Images</Label>
                <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                  {images.map((src, i) => (
                    <Image
                      key={i}
                      src={src}
                      alt={`Bike image preview ${i + 1}`}
                      width={112}
                      height={80}
                      className="h-20 w-28 object-cover rounded border"
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="mt-1 text-sm bg-muted p-3 rounded-md min-h-[80px]">
                  {watchedValues.description}
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t bg-muted/10 p-6">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
            >
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
            <Button
              className="ml-auto w-full md:w-auto"
              onClick={() => form.handleSubmit(onSubmit)()}
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Post Ad Now
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
