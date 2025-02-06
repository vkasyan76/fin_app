import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/card";

const Loader = () => {
  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className="border-none drop-shadow-sm">
        <CardHeader>
          <div className="h-8 w-48 bg-gray-300" />
        </CardHeader>
        <CardContent>
          <div className="h-[500px] w-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-slate-300 animate-spin" />
          </div>
        </CardContent>
      </Card>
    </div>
    // <div className="absolute inset-0 flex items-center justify-center">
    //   <Loader2 className="size-4 text-muted-foreground animate-spin" />
    // </div>
  );
};

export default Loader;
