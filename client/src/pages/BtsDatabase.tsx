import { CyberLayout } from "@/components/CyberLayout";
import { useBtsTowers, useCreateBtsTower, useDeleteBtsTower } from "@/hooks/use-bts";
import { useState } from "react";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Trash2, Signal, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBtsTowerSchema, type InsertBtsTower } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function BtsDatabase() {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading } = useBtsTowers({ search });
  const { mutate: deleteTower } = useDeleteBtsTower();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to decommission this tower?")) {
      deleteTower(id);
      toast({ title: "Tower Decommissioned", description: `BTS ID ${id} removed from grid.` });
    }
  };

  return (
    <CyberLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-primary/20 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white font-display flex items-center gap-3">
            <Signal className="text-primary w-6 h-6" />
            BTS TOWER DATABASE
          </h2>
          <p className="text-muted-foreground font-mono text-xs mt-1">
            Manage cellular infrastructure nodes and coverage parameters.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search Cell ID or LAC..." 
              className="pl-9 bg-black/50 border-primary/30 text-white font-mono h-10 focus:border-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <CreateTowerDialog open={isOpen} onOpenChange={setIsOpen} />
        </div>
      </div>

      <div className="cyber-box bg-black/40 rounded-lg border border-white/5 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="font-mono text-primary">CELL ID</TableHead>
              <TableHead className="font-mono text-primary">LAC</TableHead>
              <TableHead className="font-mono text-primary">OPERATOR</TableHead>
              <TableHead className="font-mono text-primary">NET</TableHead>
              <TableHead className="font-mono text-primary">COORDS</TableHead>
              <TableHead className="font-mono text-primary text-right">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground font-mono">
                  Scanning Grid...
                </TableCell>
              </TableRow>
            ) : data?.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground font-mono">
                  No signals detected.
                </TableCell>
              </TableRow>
            ) : (
              data?.items.map((tower: any) => (
                <TableRow key={tower.id} className="border-white/5 hover:bg-primary/5 transition-colors group">
                  <TableCell className="font-mono text-white font-bold">{tower.cellId}</TableCell>
                  <TableCell className="font-mono text-muted-foreground">{tower.lac}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {tower.operator}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-white">{tower.networkType}</span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-primary/50" />
                      {tower.lat.toFixed(4)}, {tower.long.toFixed(4)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(tower.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </CyberLayout>
  );
}

function CreateTowerDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { mutate: createTower, isPending } = useCreateBtsTower();
  const { toast } = useToast();
  
  const form = useForm<InsertBtsTower>({
    resolver: zodResolver(insertBtsTowerSchema),
    defaultValues: {
      cellId: "", lac: "", mcc: "510", mnc: "",
      lat: 0, long: 0, operator: "", networkType: "4G",
      height: 30, coverageRadius: 1000
    }
  });

  const onSubmit = (data: InsertBtsTower) => {
    createTower(data, {
      onSuccess: () => {
        toast({ title: "Tower Deployed", description: "New BTS node active on grid." });
        onOpenChange(false);
        form.reset();
      },
      onError: (err) => {
        toast({ title: "Deployment Failed", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-black hover:bg-primary/90 font-bold font-mono text-xs">
          <Plus className="w-4 h-4 mr-2" /> ADD NODE
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-primary/20 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-primary">Deploy New BTS Node</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="cellId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Cell ID</FormLabel>
                  <FormControl><Input {...field} className="bg-black/50 border-white/10" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="lac" render={({ field }) => (
                <FormItem>
                  <FormLabel>LAC</FormLabel>
                  <FormControl><Input {...field} className="bg-black/50 border-white/10" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="mcc" render={({ field }) => (
                <FormItem>
                  <FormLabel>MCC</FormLabel>
                  <FormControl><Input {...field} className="bg-black/50 border-white/10" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="mnc" render={({ field }) => (
                <FormItem>
                  <FormLabel>MNC</FormLabel>
                  <FormControl><Input {...field} className="bg-black/50 border-white/10" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="operator" render={({ field }) => (
                <FormItem>
                  <FormLabel>Operator</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-black/50 border-white/10">
                        <SelectValue placeholder="Select Provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-primary/20 text-white">
                      <SelectItem value="Telkomsel">Telkomsel</SelectItem>
                      <SelectItem value="Indosat">Indosat</SelectItem>
                      <SelectItem value="XL">XL Axiata</SelectItem>
                      <SelectItem value="Tri">Tri</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="networkType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Network</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-black/50 border-white/10">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-primary/20 text-white">
                      <SelectItem value="2G">2G GSM</SelectItem>
                      <SelectItem value="3G">3G WCDMA</SelectItem>
                      <SelectItem value="4G">4G LTE</SelectItem>
                      <SelectItem value="5G">5G NR</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="lat" render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude</FormLabel>
                  <FormControl><Input type="number" step="any" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} className="bg-black/50 border-white/10" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="long" render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude</FormLabel>
                  <FormControl><Input type="number" step="any" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} className="bg-black/50 border-white/10" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" className="bg-primary text-black hover:bg-primary/80 font-bold" disabled={isPending}>
                {isPending ? "DEPLOYING..." : "CONFIRM DEPLOYMENT"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
