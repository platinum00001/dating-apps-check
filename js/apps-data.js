/**
 * Dating apps catalog for Dating Apps Check.
 * icon = emoji (no trademarked logos), color = approximate brand accent.
 * Official help/account URLs only — no scraping, no third-party lookup.
 */
window.DATING_APPS = [
  {
    id: "tinder",
    icon: "🔥",
    color: "#FE3C72",
    name: "Tinder",
    officialUrl: "https://tinder.com",
    helpUrl: "https://www.help.tinder.com/",
    steps: [
      "Open the Tinder app and sign in with your usual method.",
      "Tap Profile (bottom right) → Settings (gear icon).",
      "Review account status, pause options, and connected logins.",
      "To pause: look for Hide/Pause account in Settings; to delete: Delete Account."
    ]
  },
  {
    id: "bumble",
    icon: "🐝",
    color: "#F5B400",
    name: "Bumble",
    officialUrl: "https://bumble.com",
    helpUrl: "https://bumble.com/help",
    steps: [
      "Open Bumble and go to your Profile tab.",
      "Tap Settings (gear).",
      "Check whether your profile is active or paused.",
      "Use Pause or Delete Account under Settings if you want to change status."
    ]
  },
  {
    id: "hinge",
    icon: "🧩",
    color: "#8B7CF6",
    name: "Hinge",
    officialUrl: "https://hinge.co",
    helpUrl: "https://hingeapp.zendesk.com/hc/en-us",
    steps: [
      "Open Hinge and tap your profile photo (top left).",
      "Open Settings.",
      "Confirm you can still browse/match (active) or whether the account is deleted.",
      "Use Hide my profile or Delete account under Settings as needed."
    ]
  },
  {
    id: "match",
    icon: "💘",
    color: "#E0245E",
    name: "Match",
    officialUrl: "https://www.match.com",
    helpUrl: "https://www.match.com/help",
    steps: [
      "Sign in at match.com or open the Match app.",
      "Go to Account / Settings from your profile menu.",
      "Check membership and profile visibility.",
      "Look for Hide Profile, Pause, or Close Account options."
    ]
  },
  {
    id: "okcupid",
    icon: "👋",
    color: "#2F6BFF",
    name: "OkCupid",
    officialUrl: "https://www.okcupid.com",
    helpUrl: "https://www.okcupid.com/help",
    steps: [
      "Sign in on the OkCupid website or app.",
      "Open Settings from your profile menu.",
      "Review whether your profile is visible and any hide options.",
      "Use Hide Profile or Delete Account under Settings if desired."
    ]
  },
  {
    id: "pof",
    icon: "🐟",
    color: "#F37021",
    name: "Plenty of Fish",
    officialUrl: "https://www.pof.com",
    helpUrl: "https://www.pof.com/help",
    steps: [
      "Sign in at pof.com or open the POF app.",
      "Open Profile → Settings / Account.",
      "Check if your profile is still searchable or hidden.",
      "Use Hide Profile or Delete Account controls if available."
    ]
  },
  {
    id: "facebook-dating",
    icon: "💞",
    color: "#1877F2",
    name: "Facebook Dating",
    officialUrl: "https://www.facebook.com/dating",
    helpUrl: "https://www.facebook.com/help/facebook-dating",
    steps: [
      "Open the Facebook app → Menu → Dating (or facebook.com/dating).",
      "Open Dating settings from your Dating profile.",
      "Confirm whether Dating is turned on and your profile is visible.",
      "You can pause Dating or delete your Dating profile without deleting Facebook."
    ]
  },
  {
    id: "feeld",
    icon: "🌙",
    color: "#9D7BFF",
    name: "Feeld",
    officialUrl: "https://feeld.co",
    helpUrl: "https://feeld.co/help",
    steps: [
      "Open Feeld and go to your Profile / Settings.",
      "Confirm login works and your profile visibility.",
      "Check pause or hide options if offered.",
      "Use account deletion in Settings if you want to remove the account."
    ]
  },
  {
    id: "her",
    icon: "🌈",
    color: "#FF4F7B",
    name: "HER",
    officialUrl: "https://weareher.com",
    helpUrl: "https://weareher.com/help",
    steps: [
      "Open the HER app and sign in.",
      "Go to Profile → Settings.",
      "Review whether your profile is active.",
      "Use pause/hide or delete account options under Settings."
    ]
  },
  {
    id: "grindr",
    icon: "🟡",
    color: "#E6B800",
    name: "Grindr",
    officialUrl: "https://www.grindr.com",
    helpUrl: "https://help.grindr.com/",
    steps: [
      "Open Grindr and sign in.",
      "Tap Profile → Settings.",
      "Confirm the account still loads and check visibility options.",
      "Use Delete Account in Settings if you want to remove it."
    ]
  },
  {
    id: "ashley-madison",
    icon: "🤫",
    color: "#C8102E",
    name: "Ashley Madison",
    officialUrl: "https://www.ashleymadison.com",
    helpUrl: "https://www.ashleymadison.com/app/public/help.p",
    discreet: true,
    disclaimer:
      "This entry is listed for private self-review only. Checking your own account is voluntary. Treat notes with care; this tool never looks anyone else up.",
    steps: [
      "Sign in only on the official Ashley Madison site or app.",
      "Open Account / Settings from your profile menu.",
      "Review membership and profile status privately.",
      "Use official close-account or privacy controls if you choose to change anything."
    ]
  }
];
