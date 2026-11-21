import type { ComponentType } from "react";
import InkAbout from "./InkAbout";
import InkProjects from "./InkProjects";
import InkSkills from "./InkSkills";
import InkExperience from "./InkExperience";
import InkContact from "./InkContact";
import InkTerminal from "./InkTerminal";
import InkSettings from "./InkSettings";

export const INK_APP_COMPONENTS: Record<string, ComponentType> = {
  about: InkAbout,
  projects: InkProjects,
  skills: InkSkills,
  experience: InkExperience,
  contact: InkContact,
  terminal: InkTerminal,
  settings: InkSettings,
};
