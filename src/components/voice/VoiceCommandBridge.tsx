import React, { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { FloatingVoiceButton } from "@/components/voice/FloatingVoiceButton";
import type { ParsedCommand } from "@/utils/voiceCommandParser";
import { applyVoiceCommandToDb } from "@/services/voiceCommandDb";
import { useLanguage } from "@/contexts/LanguageContext";

export function VoiceCommandBridge() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const handleConfirmed = useCallback(
    async (command: ParsedCommand) => {
      const res = await applyVoiceCommandToDb(command);
      if (res.ok === false) {
        toast.error(res.reason);
        return;
      }

      // Invalidate the data shown across the app.
      queryClient.invalidateQueries({ queryKey: ["raw-materials"] });
      queryClient.invalidateQueries({ queryKey: ["finished-products"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-breakdown"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });

      toast.success(t.voice.saleRecorded);
    },
    [queryClient, t]
  );

  return <FloatingVoiceButton onCommandConfirmed={handleConfirmed} />;
}
