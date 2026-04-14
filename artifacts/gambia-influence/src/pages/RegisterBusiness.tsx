import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, Link } from "wouter";
import { useCreateBusiness } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
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

const GAMBIAN_CITIES = [
  "Banjul", "Serekunda", "Brikama", "Bakau", "Farafenni", "Lamin", 
  "Sukuta", "Basse Santa Su", "Gunjur", "Brufut", "Other"
];

const BUSINESS_TYPES = [
  "restaurant", "shop", "hotel", "bank", "telecom", "NGO", 
  "agency", "beauty salon", "fitness", "education", "other"
];

const formSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  businessType: z.string().min(1, "Please select a business type"),
  contactEmail: z.string().email("Must be a valid email").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export default function RegisterBusiness() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createBusiness = useCreateBusiness();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "",
      businessType: "",
      contactEmail: "",
      contactPhone: "",
      location: "",
      description: "",
      website: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = {
      ...values,
      contactEmail: values.contactEmail || null,
      contactPhone: values.contactPhone || null,
      location: values.location || null,
      description: values.description || null,
      website: values.website || null,
    };

    createBusiness.mutate(
      { data: payload },
      {
        onSuccess: () => {
          toast({
            title: "Business Registered Successfully!",
            description: "You can now start connecting with local creators.",
          });
          setLocation(`/influencers`);
        },
        onError: () => {
          toast({
            title: "Registration Failed",
            description: "There was an error registering your business. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 flex-1 max-w-3xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black tracking-tight mb-3">Register Your Business</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Join the network to find and collaborate with the best digital creators in The Gambia.
        </p>
      </div>

      <Card className="border-2 shadow-sm">
        <CardHeader className="bg-muted/30 border-b pb-8">
          <CardTitle className="text-2xl">Business Details</CardTitle>
          <CardDescription className="text-base">
            Provide your business information to join our directory.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Business Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Kairaba Supermarket" className="h-12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Business Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 capitalize">
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BUSINESS_TYPES.map((type) => (
                            <SelectItem key={type} value={type} className="capitalize">
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">City / Region</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select location" />
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
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Website URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." className="h-12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Business Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell creators about your business and what kind of collaborations you are looking for..." 
                        className="resize-none min-h-[120px] text-base" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-6 border-t">
                <h3 className="text-xl font-bold mb-6">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="contact@example.com" className="h-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. +220..." className="h-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  By registering, you agree to our <Link href="#" className="underline">Terms of Service</Link>.
                </p>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full md:w-auto h-14 px-10 text-lg font-bold rounded-xl hover-elevate"
                  disabled={createBusiness.isPending}
                >
                  {createBusiness.isPending ? "Registering..." : "Register Business"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
