import { Badge } from "@/components/ui/badge";
import { AI_CONFIDENCE_DOTS, AI_CONFIDENCE_LABELS, AI_CONFIDENCE_COLORS } from "@/lib/constants";
import type { AIConfidence } from "@/lib/ai/types";

interface AIConfidenceBadgeProps {
    confidence: AIConfidence;
}

export function AIConfidenceBadge({ confidence }: AIConfidenceBadgeProps) {
    return (
        <Badge variant="outline" className="gap-1">
            <span className={AI_CONFIDENCE_COLORS[confidence]}>
                {AI_CONFIDENCE_DOTS[confidence]}
            </span>
            <span className="text-xs">
                {AI_CONFIDENCE_LABELS[confidence]}
            </span>
        </Badge>
    );
}
