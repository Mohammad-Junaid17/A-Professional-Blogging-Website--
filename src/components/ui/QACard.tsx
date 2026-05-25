"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";

export function QACard({ qa }: { qa: any }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card border border-border p-6 rounded-xl hover:border-primary/30 transition-colors">
      <div className="flex gap-4">
        <div className="flex-shrink-0 pt-1">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-card font-bold">
            Q
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-xl text-foreground mb-2">{qa.question}</h3>
          
          <div className="flex flex-wrap items-center gap-2 text-xs mb-4">
            {qa.scholar && (
              <span className="bg-primary-light text-primary font-semibold px-2 py-1 rounded-full">
                {qa.scholar}
              </span>
            )}
            <span className="text-muted">
              {qa.category} {qa.sub_category && `• ${qa.sub_category}`}
            </span>
          </div>

          <div className={`text-muted text-sm leading-relaxed ${expanded ? "" : "line-clamp-3 relative"}`}>
            {qa.admin_answer || qa.answer}
            {!expanded && (
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent" />
            )}
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-4 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {expanded ? (
              <>▴ Show Less</>
            ) : (
              <>▾ Read Full Answer</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
