import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, Copy } from "lucide-react";

interface Credential {
  id: number;
  site_name: string;
  url: string;
  username: string;
  password?: string;
  created_at: string;
}

export default function PasswordManager() {
  const { t } = useTranslation();
  const [creds, setCreds] = useState<Credential[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [currentCred, setCurrentCred] = useState<Partial<Credential>>({});
  const [visiblePasswords, setVisiblePasswords] = useState<Record<number, boolean>>({});
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchCreds = async () => {
    const res = await db.getCreds(search);
    if (Array.isArray(res)) setCreds(res);
  };

  useEffect(() => {
    fetchCreds();
  }, [search]);

  const handleSave = async () => {
    await db.saveCred(currentCred);
    setIsOpen(false);
    setCurrentCred({});
    fetchCreds();
    toast.success(t("common.saved"));
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await db.deleteCred(deleteId);
      setDeleteId(null);
      fetchCreds();
      toast.success(t("common.deleted"));
    }
  };

  const openEdit = (cred: Credential) => {
    setCurrentCred(cred);
    setIsOpen(true);
  };

  const toggleVisibility = (id: number) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t("common.copied"));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("nav.password")}</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setCurrentCred({})}>
              <Plus className="mr-2 h-4 w-4" /> {t("common.add")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {currentCred.id ? t("common.edit") : t("common.add")}
              </DialogTitle>
              <DialogDescription>
                Fill in the details for your password entry.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label>{t("pwd.site")}</Label>
                <Input
                  value={currentCred.site_name || ""}
                  onChange={(e: any) =>
                    setCurrentCred({ ...currentCred, site_name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>URL</Label>
                <Input
                  value={currentCred.url || ""}
                  onChange={(e: any) =>
                    setCurrentCred({ ...currentCred, url: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("pwd.username")}</Label>
                <Input
                  value={currentCred.username || ""}
                  onChange={(e: any) =>
                    setCurrentCred({ ...currentCred, username: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("pwd.password")}</Label>
                <Input
                  type="password"
                  value={currentCred.password || ""}
                  onChange={(e: any) =>
                    setCurrentCred({ ...currentCred, password: e.target.value })
                  }
                />
              </div>
              <Button onClick={handleSave} className="w-full">
                {t("common.save")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t("common.search")}
          value={search}
          onChange={(e: any) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("pwd.site")}</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>{t("pwd.username")}</TableHead>
              <TableHead>{t("pwd.password")}</TableHead>
              <TableHead className="w-[120px]">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {creds.map((cred) => (
              <TableRow key={cred.id}>
                <TableCell className="font-medium">{cred.site_name}</TableCell>
                <TableCell className="text-muted-foreground">
                  <a href={cred.url.startsWith('http') ? cred.url : `https://${cred.url}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {cred.url}
                  </a>
                </TableCell>
                <TableCell>{cred.username}</TableCell>
                <TableCell className="flex items-center gap-2">
                  <span className="font-mono">
                    {visiblePasswords[cred.id] ? cred.password : "••••••••"}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => toggleVisibility(cred.id)}
                  >
                    {visiblePasswords[cred.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(cred.password || "")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(cred)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => setDeleteId(cred.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dialog.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dialog.deleteDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("dialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 border-destructive-foreground">
              {t("dialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}