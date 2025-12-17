
export const TECH_NAME_MAP: Record<string, string> = {
    "Tech 1": "Combustion",
    "Tech 2": "Hybrid",
    "Tech 3": "Electric",
    "Tech 4": "Hydrogen",
    // Fallback for Chinese or other variations if they leak through
    "Internal Combustion Engine": "Combustion",
    "内燃机技术": "Combustion",
    "混合动力技术": "Hybrid",
    "电动技术": "Electric",
    "氢动力技术": "Hydrogen"
};

export const getTechLabel = (key: string) => {
    // Check exact match
    if (TECH_NAME_MAP[key]) return TECH_NAME_MAP[key];

    // Check if key starts with "Tech X"
    for (const [k, v] of Object.entries(TECH_NAME_MAP)) {
        if (key.startsWith(k)) return v;
    }

    return key;
};
