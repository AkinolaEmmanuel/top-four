export type DemoPersona = {
  id: string;
  email: string;
  displayName: string;
  avatar: string;
  roleDescription: string;
  groupsCount: number;
  points: number;
  rank: number;
  invitePending?: boolean;
};

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: "persona-akinola",
    email: "akinola@topfour.app",
    displayName: "Akinola Emmanuel",
    avatar: "AE",
    roleDescription: "Group Owner (Premier League Pundits)",
    groupsCount: 2,
    points: 1250,
    rank: 1,
  },
  {
    id: "persona-dave",
    email: "dave.gooner@topfour.app",
    displayName: "Dave_Gooner99",
    avatar: "DG",
    roleDescription: "Group Admin & Arsenal Pundit",
    groupsCount: 3,
    points: 1120,
    rank: 2,
  },
  {
    id: "persona-marcus",
    email: "marcus.newbie@topfour.app",
    displayName: "Marcus_Newbie",
    avatar: "MN",
    roleDescription: "Fresh User (0 Groups • Has Invite Link)",
    groupsCount: 0,
    points: 0,
    rank: 0,
    invitePending: true,
  },
  {
    id: "persona-tactical",
    email: "tactical.guru@topfour.app",
    displayName: "Tactical_Guru",
    avatar: "TG",
    roleDescription: "Participant Pundit",
    groupsCount: 1,
    points: 980,
    rank: 3,
  },
];

const STORAGE_KEY = "topfour:active_demo_persona";

export function getActiveDemoPersona(): DemoPersona {
  if (typeof window === "undefined") return DEMO_PERSONAS[0];
  const savedId = localStorage.getItem(STORAGE_KEY);
  const found = DEMO_PERSONAS.find((p) => p.id === savedId);
  return found || DEMO_PERSONAS[0];
}

export function setActiveDemoPersona(personaId: string): DemoPersona {
  const persona = DEMO_PERSONAS.find((p) => p.id === personaId) || DEMO_PERSONAS[0];
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, persona.id);
    window.dispatchEvent(new Event("topfour:persona_changed"));
  }
  return persona;
}
