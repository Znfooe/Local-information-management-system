import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useTheme } from "@/components/theme-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sun, Moon, Code2, ShieldAlert, MessageCircle, Coffee } from "lucide-react";

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { setTheme, theme } = useTheme();

  const handleThemeChange = (val: any) => {
    setTheme(val);
    toast.success(t("common.saved"));
  };

  const handleLangChange = (val: string) => {
    i18n.changeLanguage(val);
    toast.success(t("common.saved"));
  };

  const languages = [
    { code: "zh-CN", name: "简体中文" },
    { code: "en", name: "English" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t("nav.settings")}</h2>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.lang")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Label>Select Language</Label>
              <Select
                value={i18n.language}
                onValueChange={handleLangChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("settings.theme")}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={theme}
              onValueChange={handleThemeChange}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="light"
                  id="light"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="light"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Sun className="mb-3 h-6 w-6 stroke-1" />
                  {t("settings.theme.light")}
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="dark"
                  id="dark"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="dark"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Moon className="mb-3 h-6 w-6 stroke-1" />
                  {t("settings.theme.dark")}
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-muted bg-card">
        <CardHeader>
          <CardTitle>关于产品</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
            <Code2 className="h-5 w-5 mt-0.5 text-primary" />
            <div>
              <h3 className="font-semibold mb-1">技术栈</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                本产品基于 Electron + React + TypeScript + Tailwind CSS + shadcn/ui + SQLite 构建。
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
            <ShieldAlert className="h-5 w-5 mt-0.5 text-destructive" />
            <div>
              <h3 className="font-semibold mb-1">开源声明</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                本项目为开源产品，仅供学习与交流使用。<strong className="text-destructive">严禁用于任何形式的商业盗卖或收费行为。</strong>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
            <MessageCircle className="h-5 w-5 mt-0.5 text-blue-500" />
            <div>
              <h3 className="font-semibold mb-1">联系作者</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  主微信：<span className="font-mono bg-muted px-1 py-0.5 rounded select-all cursor-text text-foreground">acb3238</span>
                </p>
                <p>
                  备用微信：<span className="font-mono bg-muted px-1 py-0.5 rounded select-all cursor-text">wzfvcc</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
            <Coffee className="h-5 w-5 mt-0.5 text-orange-500" />
            <div className="w-full">
              <h3 className="font-semibold mb-1">请作者喝杯蜜雪冰城 🥤</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                本人为学生 🎓，切勿大额支付！如果有好心人愿意赞助一杯蜜雪冰城，鄙人由衷感谢！(≧∇≦)ﾉ ❤️
              </p>
              <div className="flex justify-center bg-white p-2 rounded-lg border w-fit mx-auto sm:mx-0">
                <img 
                  src="./donate.jpg"
                  alt="收款码" 
                  className="w-48 h-auto rounded-md"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
