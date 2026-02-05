import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import axios from "axios";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus, Search, Pencil, Trash2, Play } from "lucide-react";

interface ApiRecord {
  id: number;
  name: string;
  url: string;
  key: string;
  description: string;
}

export default function ApiManager() {
  const { t } = useTranslation();
  const [apis, setApis] = useState<ApiRecord[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [currentApi, setCurrentApi] = useState<Partial<ApiRecord>>({});
  
  // Test Dialog State
  const [testOpen, setTestOpen] = useState(false);
  const [testMethod, setTestMethod] = useState("GET");
  const [testUrl, setTestUrl] = useState("");
  const [testHeaders, setTestHeaders] = useState("");
  const [testBody, setTestBody] = useState("");
  const [testResponse, setTestResponse] = useState<string>("");
  const [testStatus, setTestStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchApis = async () => {
    const res = await db.getApis(search);
    if (Array.isArray(res)) setApis(res);
  };

  useEffect(() => {
    fetchApis();
  }, [search]);

  const handleSave = async () => {
    await db.saveApi(currentApi);
    setIsOpen(false);
    setCurrentApi({});
    fetchApis();
    toast.success(t("common.saved"));
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await db.deleteApi(deleteId);
      setDeleteId(null);
      fetchApis();
      toast.success(t("common.deleted"));
    }
  };

  const openEdit = (api: ApiRecord) => {
    setCurrentApi(api);
    setIsOpen(true);
  };

  const openTest = (api: ApiRecord) => {
    setTestMethod("GET");
    setTestUrl(api.url);
    setTestHeaders(api.key ? JSON.stringify({ "Authorization": `Bearer ${api.key}` }, null, 2) : "{}");
    setTestBody("{}");
    setTestResponse("");
    setTestStatus(null);
    setTestOpen(true);
  };

  const runTest = async () => {
    setLoading(true);
    setTestResponse("");
    setTestStatus(null);
    try {
      let headers = {};
      try {
        headers = JSON.parse(testHeaders);
      } catch (e) {
        alert("Invalid Headers JSON");
        setLoading(false);
        return;
      }

      let data = {};
      try {
        data = JSON.parse(testBody);
      } catch (e) {
        alert("Invalid Body JSON");
        setLoading(false);
        return;
      }

      const res = await axios({
        method: testMethod,
        url: testUrl,
        headers,
        data: testMethod !== "GET" ? data : undefined,
      });

      setTestStatus(res.status);
      setTestResponse(JSON.stringify(res.data, null, 2));
      toast.success("Request finished");
    } catch (error: any) {
      if (error.response) {
        setTestStatus(error.response.status);
        setTestResponse(JSON.stringify(error.response.data, null, 2));
        toast.error(`Request failed: ${error.response.status}`);
      } else {
        setTestResponse(error.message || "Unknown Error");
        toast.error("Request failed");
      }
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("nav.api")}</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setCurrentApi({})}>
              <Plus className="mr-2 h-4 w-4" /> {t("common.add")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {currentApi.id ? t("common.edit") : t("common.add")} API
              </DialogTitle>
              <DialogDescription>
                Fill in the details for your API endpoint.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label>{t("api.name")}</Label>
                <Input
                  value={currentApi.name || ""}
                  onChange={(e: any) =>
                    setCurrentApi({ ...currentApi, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("api.url")}</Label>
                <Input
                  value={currentApi.url || ""}
                  onChange={(e: any) =>
                    setCurrentApi({ ...currentApi, url: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("api.key")}</Label>
                <Input
                  type="password"
                  value={currentApi.key || ""}
                  onChange={(e: any) =>
                    setCurrentApi({ ...currentApi, key: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("api.desc")}</Label>
                <Input
                  value={currentApi.description || ""}
                  onChange={(e: any) =>
                    setCurrentApi({
                      ...currentApi,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <Button onClick={handleSave} className="w-full">
                {t("common.save")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Test Dialog */}
        <Dialog open={testOpen} onOpenChange={setTestOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>API Test</DialogTitle>
              <DialogDescription>
                Test your API endpoint with custom method, headers, and body.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="flex gap-2">
                <Select value={testMethod} onValueChange={setTestMethod}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={testUrl}
                  onChange={(e) => setTestUrl(e.target.value)}
                  placeholder="https://api.example.com/v1/resource"
                  className="flex-1"
                />
                <Button onClick={runTest} disabled={loading}>
                  {loading ? "..." : "Send"}
                </Button>
              </div>

              <div className="grid gap-2">
                <Label>Headers (JSON)</Label>
                <Textarea
                  value={testHeaders}
                  onChange={(e) => setTestHeaders(e.target.value)}
                  className="font-mono text-xs h-[100px]"
                />
              </div>

              {testMethod !== "GET" && (
                <div className="grid gap-2">
                  <Label>Body (JSON)</Label>
                  <Textarea
                    value={testBody}
                    onChange={(e) => setTestBody(e.target.value)}
                    className="font-mono text-xs h-[100px]"
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label>Response {testStatus && <span className={testStatus >= 200 && testStatus < 300 ? "text-green-500" : "text-red-500"}>({testStatus})</span>}</Label>
                <Textarea
                  value={testResponse}
                  readOnly
                  className="font-mono text-xs h-[200px] bg-muted"
                />
              </div>
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
              <TableHead>{t("api.name")}</TableHead>
              <TableHead>{t("api.url")}</TableHead>
              <TableHead>{t("api.desc")}</TableHead>
              <TableHead className="w-[140px]">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apis.map((api) => (
              <TableRow key={api.id}>
                <TableCell className="font-medium">{api.name}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {api.url}
                </TableCell>
                <TableCell>{api.description}</TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-blue-500"
                    onClick={() => openTest(api)}
                    title="Test API"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(api)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => setDeleteId(api.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
