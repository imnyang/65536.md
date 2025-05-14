import { Copy, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useState, useEffect } from "react";

export default function CopyLink() {
    const [link, setLink] = useState<string>("");

    const updateLink = () => {
        const url = decodeURIComponent(window.location.href);
        setLink(url);
    };

    useEffect(() => {
        updateLink();

        // Listen for custom event
        window.addEventListener("url-changed", updateLink);

        return () => {
            window.removeEventListener("url-changed", updateLink);
        };
    }, []);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(link);
            alert("Link copied!");
        } catch (err) {
            console.error("Failed to copy!", err);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" onClick={updateLink}>
                    <Share2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share link</DialogTitle>
                    <DialogDescription>
                        Anyone who has this link will be able to view this.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2">
                    <div className="grid flex-1 gap-2">
                        <Label htmlFor="link" className="sr-only">
                            Link
                        </Label>
                        <Input id="link" value={link} readOnly />
                    </div>
                    <Button type="button" size="sm" className="px-3" onClick={handleCopy}>
                        <span className="sr-only">Copy</span>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
