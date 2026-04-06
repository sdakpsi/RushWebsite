const baseInput =
  "w-full rounded-lg border appearance-none border-border bg-input px-4 py-2 text-base text-foreground shadow-elevation-low transition-all duration-200 placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring/30";

export const smallInput = ` ${baseInput}`;
/** Native selects with a custom chevron icon on the right */
export const selectWithDropdownIcon = `${smallInput} pr-10 cursor-pointer`;
export const socialMediaInput =
  "block text-muted-foreground text-sm font-bold mb-2";
export const textLabel = "block text-foreground text-md font-medium mb-2";
export const largeInput = `appearance-none ${baseInput} min-h-[7rem] resize-y leading-relaxed`;
