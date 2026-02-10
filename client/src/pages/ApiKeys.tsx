import { CyberLayout } from "@/components/CyberLayout";
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from "@/hooks/use-api-keys";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Key, Plus, Ban, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertApiKeySchema, type InsertApiKey } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

export default function ApiKeys() {
  const { data: keys, isLoading } = useApiKeys();
  const { mutate: revokeKey } = useRevokeApiKey();
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (key: string, id: number) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Key Copied", description: "API Key copied to clipboard." });
  };

  const handleRevoke = (id: number) => {
    if (confirm("Revoke this access key? This action cannot be undone.")) {
      revokeKey(id);
    }
  };

  return (
    <CyberLayout>
      <div className="flex justify-between items-center border-b border-primary/20 pb-6 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white font-display flex items-center gap-3">
            <Key className="text-primary w-6 h-6" />
            ACCESS CONTROL KEYS
          </h2>
          <p className="text-muted-foreground font-mono text-xs mt-1">
            Manage external integration points and permission scopes.
          </p>
        </div>
        <CreateKeyDialog />
      </div>

      <div className="cyber-box bg-black/40 rounded-lg overflow-hidden border border-white/5">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="font-mono text-primary">KEY HASH</TableHead>
              <TableHead className="font-mono text-primary">OWNER</TableHead>
              <TableHead className="font-mono text-primary">USAGE</TableHead>
              <TableHead className="font-mono text-primary">STATUS</TableHead>
              <TableHead className="font-mono text-primary text-right">CONTROLS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground font-mono">
                  Decrypting Vault...
                </TableCell>
              </TableRow>
            ) : keys?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground font-mono">
                  Vault Empty. No active keys.
                </TableCell>
              </TableRow>
            ) : (
              keys?.map((key: any) => (
                <TableRow key={key.id} className="border-white/5 hover:bg-primary/5 transition-colors">
                  <TableCell className="font-mono text-xs text-white">
                    <div className="flex items-center gap-2">
                      <span className="opacity-50">API-</span>
                      <span className="truncate max-w-[120px]">{key.key}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(key.key, key.id)}>
                        {copiedId === key.id ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-white">{key.owner}</TableCell>
                  <TableCell className="font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${Math.min((key.usageCount / key.usageLimit) * 100, 100)}%` }} 
                        />
                      </div>
                      <span className="text-muted-foreground">{key.usageCount} / {key.usageLimit}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      key.status === 'active' 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {key.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {key.status === 'active' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleRevoke(key.id)}
                      >
                        <Ban className="w-4 h-4 mr-2" /> Revoke
                      </Button>
                    )}
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

function CreateKeyDialog() {
  const [open, setOpen] = useState(false);
  const { mutate: createKey, isPending } = useCreateApiKey();
  const { toast } = useToast();
  
  const form = useForm<InsertApiKey>({
    resolver: zodResolver(insertApiKeySchema),
    defaultValues: {
      key: `sk_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`,
      owner: "",
      usageLimit: 1000,
      permissions: ["read"]
    }
  });

  const onSubmit = (data: InsertApiKey) => {
    createKey(data, {
      onSuccess: () => {
        toast({ title: "Key Generated", description: "New access credentials issued." });
        setOpen(false);
        form.reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-black hover:bg-primary/90 font-bold font-mono text-xs">
          <Plus className="w-4 h-4 mr-2" /> GENERATE KEY
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-primary/20 text-white">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-primary">Issue New Credentials</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 font-mono text-xs">
            <FormField control={form.control} name="owner" render={({ field }) => (
              <FormItem>
                <FormLabel>Owner / System Name</FormLabel>
                <FormControl><Input {...field} placeholder="e.g. EXTERNAL_AUDIT_SYS" className="bg-black/50 border-white/10" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="usageLimit" render={({ field }) => (
              <FormItem>
                <FormLabel>Daily Quota</FormLabel>
                <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} className="bg-black/50 border-white/10" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="flex justify-end pt-4">
              <Button type="submit" className="bg-primary text-black hover:bg-primary/80 font-bold" disabled={isPending}>
                {isPending ? "ENCRYPTING..." : "ISSUE KEY"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
