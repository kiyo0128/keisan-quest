/**
 * story.js - Story dialogues, quest objectives, and world map data
 */

// --- Story Dialogues ---
// Shown when entering a new area or at key moments

const STORY_DIALOGUES = {
    // Opening - First time starting
    intro: [
        { speaker: '👴', name: 'そんちょう', text: 'ゆうしゃよ、まものがブロックワールドをおそっている！' },
        { speaker: '👴', name: 'そんちょう', text: 'きみの「けいさんのちから」で まものをたおしてくれ！' },
        { speaker: '🧑‍🦰', name: 'ゆうしゃ', text: 'まかせて！ぼうけんにでかけよう！' },
    ],

    // Area 0: Grassland
    area0_enter: [
        { speaker: '🧚', name: 'ようせい', text: 'ここは「草原エリア」だよ。' },
        { speaker: '🧚', name: 'ようせい', text: 'まだやさしいまものたちがいるから、れんしゅうにぴったり！' },
        { speaker: '🧚', name: 'ようせい', text: 'ひきざんでこうげきして、まものをたおそう！' },
    ],
    area0_boss: [
        { speaker: '🧚', name: 'ようせい', text: 'きをつけて！ゾンビのボスがあらわれたよ！' },
        { speaker: '🧚', name: 'ようせい', text: 'でもきみならだいじょうぶ。おちついてこたえよう！' },
    ],
    area0_clear: [
        { speaker: '👴', name: 'そんちょう', text: 'すばらしい！草原エリアをクリアしたぞ！' },
        { speaker: '👴', name: 'そんちょう', text: 'つぎは山岳エリアだ。もっとつよいまものがいるぞ。' },
        { speaker: '🧑‍🦰', name: 'ゆうしゃ', text: 'よーし、がんばるぞ！' },
    ],

    // Area 1: Mountain
    area1_enter: [
        { speaker: '⛰️', name: 'やまのせい', text: 'ようこそ、山岳エリアへ。' },
        { speaker: '⛰️', name: 'やまのせい', text: 'ここのまものはすこしつよいぞ。さいくつもわすれずにな。' },
        { speaker: '⛰️', name: 'やまのせい', text: 'そうびをつくれば、もっとつよくなれるぞ！' },
    ],
    area1_boss: [
        { speaker: '⛰️', name: 'やまのせい', text: 'クリーパーだ！ばくはつするまえにたおせ！' },
    ],
    area1_clear: [
        { speaker: '👴', name: 'そんちょう', text: 'やったな！山岳エリアもクリアだ！' },
        { speaker: '👴', name: 'そんちょう', text: 'さいごは火山エリア…ドラゴンがまっているぞ。' },
    ],

    // Area 2: Volcano
    area2_enter: [
        { speaker: '🔥', name: 'ほのおのせい', text: 'ここは火山エリア…さいごのたたかいだ。' },
        { speaker: '🔥', name: 'ほのおのせい', text: 'ドラゴンをたおせば、へいわがもどる！' },
        { speaker: '🧑‍🦰', name: 'ゆうしゃ', text: 'ぜったい、まけない！' },
    ],
    area2_boss: [
        { speaker: '🔥', name: 'ほのおのせい', text: 'ドラゴンだ！ぜんりょくでいけ！！' },
    ],
    area2_clear: [
        { speaker: '👴', name: 'そんちょう', text: '🎊 おめでとう！ドラゴンをたおした！！' },
        { speaker: '👴', name: 'そんちょう', text: 'ブロックワールドにへいわがもどったぞ！' },
        { speaker: '🧚', name: 'ようせい', text: 'ゆうしゃさん、ありがとう！きみはほんとうのゆうしゃだ！' },
        { speaker: '🧑‍🦰', name: 'ゆうしゃ', text: 'やったー！！けいさんのちからで かった！' },
    ],
};

// --- Quest System ---

const QUESTS = [
    // Area 0 quests
    {
        id: 'q_grass_1',
        area: 0,
        title: '草原のまもの',
        description: 'スライムをたおそう！',
        targetStage: 0,
        icon: '🟢',
    },
    {
        id: 'q_grass_2',
        area: 0,
        title: 'キノコのもり',
        description: 'キノコマンをたおそう！',
        targetStage: 1,
        icon: '🍄',
    },
    {
        id: 'q_grass_boss',
        area: 0,
        title: '草原のボス',
        description: 'ゾンビをたおして草原をすくえ！',
        targetStage: 2,
        icon: '🧟',
        isBoss: true,
    },

    // Area 1 quests
    {
        id: 'q_mountain_1',
        area: 1,
        title: 'やまのどうくつ',
        description: 'クモをたおそう！',
        targetStage: 3,
        icon: '🕷️',
    },
    {
        id: 'q_mountain_2',
        area: 1,
        title: 'ほねのせんし',
        description: 'スケルトンをたおそう！',
        targetStage: 4,
        icon: '💀',
    },
    {
        id: 'q_mountain_boss',
        area: 1,
        title: '山のボス',
        description: 'クリーパーをたおして山をすくえ！',
        targetStage: 5,
        icon: '💚',
        isBoss: true,
    },

    // Area 2 quests
    {
        id: 'q_volcano_1',
        area: 2,
        title: 'やみのせかい',
        description: 'エンダーマンをたおそう！',
        targetStage: 6,
        icon: '👾',
    },
    {
        id: 'q_volcano_2',
        area: 2,
        title: 'ほのおのしれん',
        description: 'ブレイズをたおそう！',
        targetStage: 7,
        icon: '🔥',
    },
    {
        id: 'q_volcano_boss',
        area: 2,
        title: 'さいごのたたかい',
        description: 'ドラゴンをたおしてへいわをとりもどせ！',
        targetStage: 8,
        icon: '🐉',
        isBoss: true,
    },
];

// --- World Map Area Data ---

const WORLD_MAP_AREAS = [
    {
        id: 0,
        name: '草原エリア',
        icon: '🌿',
        color: '#4caf50',
        bgColor: '#1a3a1a',
        stages: [0, 1, 2],
        position: { x: 25, y: 70 },
    },
    {
        id: 1,
        name: '山岳エリア',
        icon: '🏔️',
        color: '#78909c',
        bgColor: '#2a2a3a',
        stages: [3, 4, 5],
        position: { x: 50, y: 40 },
    },
    {
        id: 2,
        name: '火山エリア',
        icon: '🌋',
        color: '#e53935',
        bgColor: '#3a1a1a',
        stages: [6, 7, 8],
        position: { x: 75, y: 15 },
    },
];

/**
 * Get the story dialogue key for the current game state.
 */
function getStoryTrigger(stage, previousStage) {
    // Area boundaries
    const areaStarts = [0, 3, 6];
    const bossStages = [2, 5, 8];
    const areaClearStages = [3, 6, 9]; // stage AFTER clearing boss

    // Just cleared a boss?
    if (areaClearStages.includes(stage) && previousStage !== undefined) {
        const clearedArea = areaClearStages.indexOf(stage);
        return `area${clearedArea}_clear`;
    }

    // Entering new area?
    if (areaStarts.includes(stage)) {
        const area = areaStarts.indexOf(stage);
        return `area${area}_enter`;
    }

    // About to face a boss?
    if (bossStages.includes(stage)) {
        const area = bossStages.indexOf(stage);
        return `area${area}_boss`;
    }

    return null;
}

/**
 * Get the current quest for a given stage.
 */
function getCurrentQuest(stage) {
    return QUESTS.find(q => q.targetStage === stage) || null;
}

/**
 * Get area progress: which areas are unlocked and which stages completed.
 */
function getAreaProgress(currentStage) {
    return WORLD_MAP_AREAS.map(area => {
        const maxStage = area.stages[area.stages.length - 1];
        const minStage = area.stages[0];
        const isUnlocked = currentStage >= minStage;
        const isCompleted = currentStage > maxStage;
        const currentInArea = currentStage >= minStage && currentStage <= maxStage;
        const stagesCompleted = Math.max(0, Math.min(currentStage - minStage, area.stages.length));

        return {
            ...area,
            isUnlocked,
            isCompleted,
            currentInArea,
            stagesCompleted,
            totalStages: area.stages.length,
        };
    });
}
