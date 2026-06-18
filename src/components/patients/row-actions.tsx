"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DotsIcon, EyeIcon, EditIcon, TrashIcon } from "@/components/icons";

const item =
  "rounded-lg px-2.25 py-2.25 text-[13.5px] font-[550] gap-2.5 focus:bg-row-hover";

export function RowActions({
  canEdit,
  canDelete,
  onView,
  onEdit,
  onDelete,
}: {
  canEdit: boolean;
  canDelete: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Row actions"
          onClick={(e) => e.stopPropagation()}
          className="flex size-[30px] items-center justify-center rounded-lg text-text-faint transition-colors hover:bg-row-hover hover:text-text"
        >
          <DotsIcon size={17} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        onClick={(e) => e.stopPropagation()}
        className="w-47 border border-border bg-popover shadow-(--shadow-lg) ring-0 rounded-xl p-1.5"
      >
        <DropdownMenuItem onSelect={onView} className={item}>
          <EyeIcon size={16} style={{ stroke: "var(--text-muted)" }} />
          View details
        </DropdownMenuItem>
        {canEdit && (
          <DropdownMenuItem onSelect={onEdit} className={item}>
            <EditIcon size={16} style={{ stroke: "var(--text-muted)" }} />
            Edit patient
          </DropdownMenuItem>
        )}
        {canDelete && (
          <>
            <DropdownMenuSeparator className="my-1.25 mx-1 bg-border" />
            <DropdownMenuItem
              variant="destructive"
              onSelect={onDelete}
              className="rounded-lg px-2.25 py-2.25 text-[13.5px] font-[550] gap-2.5"
            >
              <TrashIcon size={16} />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
