import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ComingSoonProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
}

export function ComingSoon({ title, description = "This feature is coming soon!", icon: Icon }: ComingSoonProps) {
  return (
    <div className="flex flex-1 items-center justify-center h-[calc(100vh-8rem)] p-4">
      <Card className="w-full max-w-md border-border/50 bg-background/50 backdrop-blur-xl shadow-xl">
        <CardHeader className="text-center pb-2">
            {Icon && (
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
                <Icon className="h-8 w-8 text-primary" />
              </div>
            )}
          <CardTitle className="text-2xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          {description}
        </CardContent>
      </Card>
    </div>
  );
}
