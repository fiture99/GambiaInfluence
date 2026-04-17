import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useCreateInfluencer } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Instagram, Youtube, Phone, MessageCircle } from "lucide-react";

const GAMBIAN_CITIES = [
  "Banjul", "Serekunda", "Brikama", "Bakau", "Farafenni", "Lamin", 
  "Sukuta", "Basse Santa Su", "Gunjur", "Brufut", "Other"
];

const NICHES = [
  "fashion", "comedy", "tech", "food", "lifestyle", 
  "sports", "beauty", "travel", "music", "gaming"
];

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  location: z.string().min(1, "Please select a location"),
  niche: z.string().min(1, "Please select a niche"),
  followersCount: z.coerce.number().min(0, "Must be a positive number"),
  bio: z.string().optional(),
  instagramUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  tiktokUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  youtubeUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  phone: z.string().optional(),
  whatsappNumber: z.string().optional(),
  profileImageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export default function RegisterInfluencer() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createInfluencer = useCreateInfluencer();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      location: "",
      niche: "",
      followersCount: 0,
      bio: "",
      instagramUrl: "",
      tiktokUrl: "",
      youtubeUrl: "",
      phone: "",
      whatsappNumber: "",
      profileImageUrl: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Clean up empty strings to nulls to match API schema if needed
    const payload = {
      ...values,
      instagramUrl: values.instagramUrl || null,
      tiktokUrl: values.tiktokUrl || null,
      youtubeUrl: values.youtubeUrl || null,
      phone: values.phone || null,
      whatsappNumber: values.whatsappNumber || null,
      bio: values.bio || null,
      profileImageUrl: values.profileImageUrl || null,
    };

    createInfluencer.mutate(
      { data: payload },
      {
        onSuccess: (data) => {
          toast({
            title: "Welcome to GamInfluencers!",
            description: "Your creator profile has been created successfully.",
          });
          setLocation(`/influencers/${data.id}`);
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to create profile. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 flex-1 max-w-3xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black tracking-tight mb-3">Join as a Creator</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Get discovered by local businesses and brands looking to collaborate with West African talent.
        </p>
      </div>

      <Card className="border-2 shadow-sm">
        <CardHeader className="bg-muted/30 border-b pb-8">
          <CardTitle className="text-2xl">Creator Profile</CardTitle>
          <CardDescription className="text-base">
            Fill out your details to showcase your brand to potential partners.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Full Name / Creator Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Awa Jallow" className="h-12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profileImageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Profile Image</FormLabel>
                      <FormControl>
                        <div className="flex flex-col gap-3">
                          {/* Hidden file input */}
                          <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                const base64 = reader.result as string;
                                setImagePreview(base64);
                                field.onChange(base64); // store base64 as the value
                              };
                              reader.readAsDataURL(file);
                            }}
                          />

                          {/* Preview */}
                          {imagePreview && (
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-20 h-20 rounded-full object-cover border-2 border-muted"
                            />
                          )}

                          {/* Upload button */}
                          <Button
                            type="button"
                            variant="outline"
                            className="h-12 w-full"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            {imagePreview ? "Change Photo" : "Upload Photo"}
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>Upload your profile photo</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Location *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select your city" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {GAMBIAN_CITIES.map((city) => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="niche"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Primary Niche *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 capitalize">
                            <SelectValue placeholder="Select your niche" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {NICHES.map((niche) => (
                            <SelectItem key={niche} value={niche} className="capitalize">
                              {niche}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell brands about yourself, your audience, and what kind of content you create..." 
                        className="resize-none min-h-[120px] text-base" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-6 border-t">
                <h3 className="text-xl font-bold mb-6">Reach & Socials</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="followersCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Total Followers *</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" className="h-12" {...field} />
                        </FormControl>
                        <FormDescription>Combined across your main platforms</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="hidden md:block"></div>

                  <FormField
                    control={form.control}
                    name="instagramUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-base">
                          <Instagram className="w-4 h-4 mr-2" /> Instagram URL
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="https://instagram.com/..." className="h-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tiktokUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-base">
                          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                          </svg>
                          TikTok URL
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="https://tiktok.com/@..." className="h-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="youtubeUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-base">
                          <Youtube className="w-4 h-4 mr-2" /> YouTube URL
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="https://youtube.com/..." className="h-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="pt-6 border-t">
                <h3 className="text-xl font-bold mb-6">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="whatsappNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-base">
                          <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp Number
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 220..." className="h-12" {...field} />
                        </FormControl>
                        <FormDescription>Include country code (e.g. 220)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-base">
                          <Phone className="w-4 h-4 mr-2" /> Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. +220..." className="h-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="pt-6 border-t flex justify-end">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full md:w-auto h-14 px-10 text-lg font-bold rounded-xl hover-elevate"
                  disabled={createInfluencer.isPending}
                >
                  {createInfluencer.isPending ? "Creating Profile..." : "Create Creator Profile"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
