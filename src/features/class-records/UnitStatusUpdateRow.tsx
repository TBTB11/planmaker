import { type Unit, type UnitStatus } from "@/db/db";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { UNIT_STATUS_LABELS, UNIT_STATUS_COLORS } from "@/lib/constants";

interface UnitStatusUpdateRowProps {
    unit: Unit;
    value: UnitStatus;
    onChange: (unitId: string, status: UnitStatus) => void;
}

const ALL_STATUSES: UnitStatus[] = [
    "NotStarted",
    "Introduced",
    "Practicing",
    "WaitingConfirmation",
    "Completed",
    "NeedsReview",
    "OnHold",
];

export function UnitStatusUpdateRow({ unit, value, onChange }: UnitStatusUpdateRowProps) {
    return (
        <div className="flex items-center gap-3 py-2">
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{unit.name}</p>
                <p className="text-xs text-muted-foreground">{unit.subject}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <Badge className={`text-xs ${UNIT_STATUS_COLORS[unit.status]}`}>
                    {UNIT_STATUS_LABELS[unit.status]}
                </Badge>
                <span className="text-muted-foreground text-xs">→</span>
                <Select
                    value={value}
                    onValueChange={(v) => onChange(unit.id, v as UnitStatus)}
                >
                    <SelectTrigger className="w-40 h-8 text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {ALL_STATUSES.map((status) => (
                            <SelectItem key={status} value={status} className="text-xs">
                                {UNIT_STATUS_LABELS[status]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
