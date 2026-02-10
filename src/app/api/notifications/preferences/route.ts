import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const PREFERENCES_PATH = path.join(process.cwd(), "data", "notification-preferences.json");

const CHANNELS = ["email", "discord", "webhook", "in-app"] as const;
const CATEGORIES = ["security-alerts", "new-skills", "bounty-updates", "community", "system"] as const;
const FREQUENCIES = ["instant", "daily", "weekly", "off"] as const;

type Channel = (typeof CHANNELS)[number];
type Category = (typeof CATEGORIES)[number];
type Frequency = (typeof FREQUENCIES)[number];

type CategoryPreference = {
  frequency: Frequency;
  channels: Record<Channel, boolean>;
};

type NotificationPreferences = {
  channels: Channel[];
  categories: Record<Category, CategoryPreference>;
};

const DEFAULT_PREFERENCES: NotificationPreferences = {
  channels: [...CHANNELS],
  categories: {
    "security-alerts": {
      frequency: "instant",
      channels: {
        email: true,
        discord: true,
        webhook: true,
        "in-app": true,
      },
    },
    "new-skills": {
      frequency: "daily",
      channels: {
        email: true,
        discord: true,
        webhook: false,
        "in-app": true,
      },
    },
    "bounty-updates": {
      frequency: "instant",
      channels: {
        email: true,
        discord: true,
        webhook: true,
        "in-app": true,
      },
    },
    community: {
      frequency: "weekly",
      channels: {
        email: false,
        discord: true,
        webhook: false,
        "in-app": true,
      },
    },
    system: {
      frequency: "daily",
      channels: {
        email: true,
        discord: false,
        webhook: false,
        "in-app": true,
      },
    },
  },
};

async function readPreferences(): Promise<NotificationPreferences> {
  try {
    const raw = await fs.readFile(PREFERENCES_PATH, "utf-8");
    const parsed = JSON.parse(raw) as NotificationPreferences;
    if (isValidPreferences(parsed)) return parsed;
    return DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

async function writePreferences(preferences: NotificationPreferences): Promise<void> {
  const dir = path.dirname(PREFERENCES_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(PREFERENCES_PATH, JSON.stringify(preferences, null, 2));
}

function isChannel(value: string): value is Channel {
  return (CHANNELS as readonly string[]).includes(value);
}

function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

function isFrequency(value: string): value is Frequency {
  return (FREQUENCIES as readonly string[]).includes(value);
}

function isValidPreferences(input: unknown): input is NotificationPreferences {
  if (!input || typeof input !== "object") return false;
  const candidate = input as Partial<NotificationPreferences>;

  if (!Array.isArray(candidate.channels) || candidate.channels.length !== CHANNELS.length) return false;
  if (!candidate.channels.every((channel) => typeof channel === "string" && isChannel(channel))) return false;

  if (!candidate.categories || typeof candidate.categories !== "object") return false;

  for (const category of CATEGORIES) {
    const categoryPref = candidate.categories[category as keyof typeof candidate.categories] as CategoryPreference | undefined;
    if (!categoryPref || typeof categoryPref !== "object") return false;
    if (!isFrequency(categoryPref.frequency)) return false;

    if (!categoryPref.channels || typeof categoryPref.channels !== "object") return false;
    for (const channel of CHANNELS) {
      if (typeof categoryPref.channels[channel] !== "boolean") return false;
    }
  }

  return true;
}

function mergePreferences(
  current: NotificationPreferences,
  patch: Partial<NotificationPreferences>
): NotificationPreferences {
  const merged: NotificationPreferences = {
    channels: [...current.channels],
    categories: {
      ...current.categories,
    },
  };

  if (Array.isArray(patch.channels)) {
    const cleanChannels = patch.channels.filter((channel): channel is Channel =>
      typeof channel === "string" && isChannel(channel)
    );
    if (cleanChannels.length === CHANNELS.length) {
      merged.channels = [...cleanChannels];
    }
  }

  if (patch.categories && typeof patch.categories === "object") {
    for (const [categoryKey, categoryPatch] of Object.entries(patch.categories)) {
      if (!isCategory(categoryKey)) continue;
      if (!categoryPatch || typeof categoryPatch !== "object") continue;

      const currentCategory = merged.categories[categoryKey];
      const nextCategory: CategoryPreference = {
        frequency: currentCategory.frequency,
        channels: { ...currentCategory.channels },
      };

      const categoryPatchObj = categoryPatch as Partial<CategoryPreference>;

      if (typeof categoryPatchObj.frequency === "string" && isFrequency(categoryPatchObj.frequency)) {
        nextCategory.frequency = categoryPatchObj.frequency;
      }

      if (categoryPatchObj.channels && typeof categoryPatchObj.channels === "object") {
        for (const [channelKey, channelValue] of Object.entries(categoryPatchObj.channels)) {
          if (!isChannel(channelKey)) continue;
          if (typeof channelValue === "boolean") {
            nextCategory.channels[channelKey] = channelValue;
          }
        }
      }

      merged.categories[categoryKey] = nextCategory;
    }
  }

  return merged;
}

export async function GET() {
  const preferences = await readPreferences();
  return NextResponse.json({
    preferences,
    defaults: DEFAULT_PREFERENCES,
  });
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<NotificationPreferences>;
    const current = await readPreferences();
    const merged = mergePreferences(current, body);

    if (!isValidPreferences(merged)) {
      return NextResponse.json({ error: "Invalid preferences payload" }, { status: 400 });
    }

    await writePreferences(merged);

    return NextResponse.json({
      success: true,
      preferences: merged,
    });
  } catch (error) {
    console.error("Failed to update notification preferences", error);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
