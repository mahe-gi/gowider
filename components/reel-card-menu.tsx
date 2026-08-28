"use client";

import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { DeleteReelDialog } from "./delete-reel-dialog";

interface ReelCardMenuProps {
  projectId: string;
  reelName: string;
  isProcessing?: boolean;
  onDeleted?: (projectId: string) => void;
}

export function ReelCardMenu({
  projectId,
  reelName,
  isProcessing = false,
  onDeleted,
}: ReelCardMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsMenuOpen((prev) => !prev);
        }}
        className="p-1.5 rounded-full text-[#8C877D] hover:text-[#111111] hover:bg-[#121212]/05 transition-colors"
        aria-label="Reel options"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isMenuOpen && (
        <div
          className="absolute right-0 top-full mt-1 w-36 bg-white rounded-2xl p-1.5 shadow-lg border border-[#121212]/10 z-20 animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMenuOpen(false);
              setIsDeleteDialogOpen(true);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2] rounded-xl transition-colors text-left"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Reel</span>
          </button>
        </div>
      )}

      <DeleteReelDialog
        isOpen={isDeleteDialogOpen}
        projectId={projectId}
        reelName={reelName}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDeleted={(deletedId) => {
          if (onDeleted) {
            onDeleted(deletedId);
          } else {
            // Reload window if no custom handler provided
            window.location.reload();
          }
        }}
      />
    </div>
  );
}
