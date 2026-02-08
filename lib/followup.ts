import { LeadStage } from "@/lib/db";

export const followUpTemplates: Record<LeadStage, string[]> = {
  new: [
    "Hi {name}, it was great connecting recently! Would you like to tour any listings this week?",
    "Hi {name}, I pulled a few homes that match your criteria. Want me to send them over?",
  ],
  warm: [
    "Hi {name}, checking in on your home search. Any changes to your must-haves?",
    "Hi {name}, I can schedule a quick call to refine your budget and timeline. Interested?",
  ],
  touring: [
    "Hi {name}, excited for our tour! Are there any extra stops you'd like to add?",
    "Hi {name}, I sent the tour itinerary. Let me know if timing needs tweaking.",
  ],
  offer: [
    "Hi {name}, we can review the offer details together today. Want to hop on a call?",
    "Hi {name}, I gathered comps for your offer. When can we review them?",
  ],
  under_contract: [
    "Hi {name}, quick update: we are on track. Let me know if you need anything before closing.",
    "Hi {name}, I'm coordinating with the lender and escrow. Any questions I can answer?",
  ],
  closed: [
    "Hi {name}, congratulations again! Let me know if you need anything post-close.",
    "Hi {name}, thanks for working together. I'm here for any future real estate needs.",
  ],
};

export function getTemplate(stage: LeadStage, name: string) {
  const options = followUpTemplates[stage] ?? followUpTemplates.new;
  const seed = `${stage}-${name}`;
  const hash = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const pick = options[hash % options.length];
  return pick.replace("{name}", name || "there");
}
