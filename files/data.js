//Areas

var areas = {
	"clearing": {
		short_description: "in a forest clearing",
		long_description: "a small clearing. Large, twisted oak trees tower above you.",
        npcs: [{name:"Ari"}],
		contents: [{name: "rusty sword", seen:false}, {name: "health potion", qty: 2, seen:false}, {name: "small key", seen:false}, {name: "gold", qty: 666, seen: false}],
		fixtures: [
            {name: "magic door", seen: false, long_description: "an arcane door through space and time", open: false, exits: [
                {name: "wishing well", exitName: "magic door", transit: "step through"}
            ]}
        ],
		exits: [
            {name: "old road", exitName: "winding path", direction: "north", transit: "start down"},
            {name: "small pond", exitName: "stone stair", direction: "east", transit: "head down"}]
	},
	"small pond": {
		short_description: "by a small pond",
		long_description: "an opening in the forest around a small pond adorned with lily pads.",
        npcs: [],
		contents: [{name: "old boots", seen:false}],
		fixtures: [
			{name: "old dock", seen: false, long_description: "a creaky old wooden dock in much need of repair", fishing: [
                {name: "speckled trout", qty: 5},
                {name: "old boots", qty: 1}
            ]},
			{name: "wooden chest", seen: false, lock: "small key",location: "on the old dock", long_description: "an old wooden chest, slightly rotten", open: false, contents: [
				{name: "gold", qty: 100},
				{name: "fishing rod"}
			]}
		],
		exits: [{name: "clearing", exitName: "stone stair", direction: "west", transit: "head up"}],
	},
	"old road": {
		short_description: "on an old road",
		long_description: "an overgrown path that winds through the dark forest.",
        npcs: [],
		contents: [{name: "greataxe", seen:false}],
		fixtures: [],
		exits: [{name: "clearing", exitName: "clearing", direction: "south", transit: "follow the path to"}]
	},
    "wishing well": {
        short_description: "by an old well",
        long_description: "a small glade with an old stone well in the centre.",
        contents:[],
        npcs: [{name:"froggo"}],
        fixtures: [{name: "well", seen: true, long_description: "an old stone well, half covered in moss"}],
        exits: [{name: "clearing", exitName: "magic door", transit: "step through"}]

    }
}

//Items

var itemDictionary = {
    "gold": {
        name: "gold piece",
        plural: "gold",
        long_description: "The common currency of the land.",
        value: 1
    },
    "your bare hands":{
        name: "your bare hands",
        fishingGear: 50
    },
    "rusty sword": {
        name: "rusty sword",
        plural: "rusty swords",
        long_description: "The rusted blade isn't the best weapon, but it will do.",
        value: 4,
        use: "equip",
        slot: "weapon"
    },
    "health potion": {
        name: "health potion",
        plural: "health potions",
        long_description: "A small glass bottle with red liquid swirling inside.",
        value: 15,
        use: "drink",
        health: "2d4+2"
    },
    "speckled trout": {
        name: "speckled trout(raw)",
        plural: "speckled trout(raw)",
        long_description: "A raw spotted fish with silvery scales.",
        value: 6,
        use: "eat",
        cook: "cooked speckled trout",
        health: "1d4+2"
    },
    "cooked speckled trout": {
        name: "speckled trout(cooked)",
        plural: "speckled trout(cooked)",
        long_description: "A spotted fish with silvery scales, roasted.",
        value: 9,
        use: "eat",
        health: "1d6+3"
    },
    "small key": {
        name: "small key",
        plural: "small keys",
        long_description: "A small iron key, likely fits a small iron lock.",
        value: 0,
        use: "use"
    },
    "fishing rod": {
        name: "fishing rod",
        plural: "fishing rods",
        long_description: "An old fishing rod fitted with a spool, line, and hook.",
        value: 10,
        use: "fish with",
        fishingGear: 15
    },
    "old boots": {
        name: "pair of old boots",
        plural: "pairs of old boots",
        long_description: "These ruddy leather boots are worn and but sturdy.",
        value: 2,
        use: "equip",
        slot: "feet"
    },
    "greataxe": {
        name: "greataxe",
        plural: "greataxes",
        long_description: "A strong, sharp, well-made greataxe. It requires both hands.",
        value: 25,
        use: "equip",
        slot: "weapon"
    },
    "wooden spear": {
        name: "wooden spear",
        plural: "wooden spears",
        long_description: "A heavy, straight stick sharpened to a point.",
        value: 2,
        use: "equip",
        slot: "weapon",
        fishingGear: 5
    }
}
//NPCS

var npcDictionary = {
    "froggo": {
        name: "froggo",
        known: false,
        pronouns: ["he", "him"],
        short_description: "chonky frog",
        long_description: "a large frog with big yellow eyes. He croaks loudly",
        talk: [ 
            {label: "g0", scene: "The frog stares at you.", replies: [
                {m: "\"Hello?\"", next: "intro1"},
                {m: "Stare closely at frog", next: "intro2"}
            ]},
            {label: "g1", npc: "\"Hello again, traveler.\"", next: "query0"},
            {label: "intro1", npc: "\"Hello, traveler.\"", next: "query0"},
            {label: "intro2", scene: "You stare closely at the frog, who seems alarmed", next: "intro3"},
            {label: "intro3", npc: "\"Whoa, personal space dear fellow.\"", next: "query0"},
            {label: "query0", npc: "\"Praytell, what do you seek?\"", next: "hub0"},
            {label: "query1", npc: "\"Do you have more questions?\"", next: "hub0"},
            {label: "hub0", replies: [
                {m: "\"Who are you?\"", next: "who0"},
                {m: "\"What is this place?\"", next: "where0"},
                {m: "\"Sorry, I must be going\"", next: "bye0"}
            ]},
            {label: "who0", npc: "\"My name is froggo, a frog who lives by the well.\"", next:"query1", replace:{m: "\"Who are you again?\"", next: "who1"}},
            {label: "who1", npc: "\"As I told you, I am froggo, the frog.\"", next:"query1"},
            {label: "where0", npc: "\"They call this place the dark forest, but I just call it home\"", next:"query1", replace:{m: "\"Where are we again?\"", next: "where1"}},
            {label: "where1", npc: "\"Have you already frogotten? We are in the dark forest.\"", next:"query1"},
            {label: "bye0", npc: "\"Fare thee well, traveler.\"", next: "end"}
        ]
    },
    "Ari": {
        name: "Ari",
        known: false,
        pronouns: ["she", "her"],
        short_description: "merchant",
        long_description: "a strong, stout woman with short blonde hair. She carries an enormous pack",
        priceMod: 1.15,
        focusItem: [],
        justBought: false,
        contents: [{name: "health potion", qty: 5},{name: "wooden spear", qty: 2}],
        talk: [ 
            {label: "g0", scene: "The merchant eyes you up as you approach.", next: "intro0"},
            {label: "g1", npc: "\"We meet again.\"", next: "query0"},
            {label: "intro0", npc: "\"You there, are you lost?.\"", replies: [
                {m: "\"I guess I am.\"", next: "intro1"},
                {m: "\"No, I know where I'm going.\"", next: "intro3"},
                {m: "\"JUST LET ME BUY THINGS!.\"", next: "shop0"},
            ]},
            {label: "intro1", npc: "\"Well if you want to get yourself un-lost, you'll need supplies.\"", next: "intro2"},
            {label: "intro2", npc: "\"If you don't have the coin, you can also sell me things you don't need.\"", next: "query0"},
            {label: "intro3", scene: "The merchant looks you up and down.", next: "intro4"},
            {label: "intro4", npc: "\"Well you could have fooled me. You look like you need supplies.\"", next: "intro2"},
            {label: "query0", npc: "\"So, how can I help you?\"", next: "hub0"},
            {label: "query1", npc: "\"What else do you need?\"", next: "hub0"},
            {label: "query2", npc: "\"What else do you need, Dorkus?\"", next: "hub0"},
            {label: "query4", npc: "\"Anything else you need?\"", next: "hub0"},
            {label: "hub0", replies: [
                {m: "\"Who are you?\"", next: "who0"},
                {m: "\"What do have for sale?\"", next: "shop0"},
                {m: "\"What can I sell you?\"", next: "shop1"},
                {m: "\"Do you have any quests for me?\"", next: "q0"},
                {m: "\"Goodbye for now.\"", next: "bye0"}
            ]},
            {label: "who0", npc: "\"I'm Ari, merchant extraordinaire, pleased to meet you!\"", next:"who2", replace:{m: "\"Who are you again?\"", next: "who1"}},
            {label: "who1", npc: "\"I thought you might be the forgetful type. I'm Ari, the merchant.\"", next:"query2"},
            {label: "who2", npc: "\"And who do I have the pleasure of doing business with?.\"", replies:[
                {m: "\"I'm a wanderer\"", next: "who3"},
                {m: "\"I'm an adventurer\"", next: "who3"},
                {m: "\"I don't know who I am.\"", next: "who3"}
            ]},
            {label: "who3", npc: "\"No name, huh? Ok, I'll call you Dorkus\"", next:"query2"},
            {label: "q0", npc: "\"What I really need is a pair of boots.\"", next:"q1", replace:{m: "\"About the boots you wanted\"", next: "bye0"}},
            {label: "q1", npc: "\"Do you think you could find me some? I would reward you.\"", replies:[
                {m:"\"I will find you some boots!\"", next: "q20"},
                {m:"\"I've got boots here you can have.\"", next: "q89"},
                {m:"\"I cannot help right now.\"", next: "q10"}
            ]},
            {label: "q10", npc: "\"Oh. Well let me know if you change your mind.\"", next:"query4"},
            {label: "q20", npc: "\"Oh thank you! Let me know when you find some.\"", next:"query4"},
            {label: "q89", npc: "\"Wow! You just happened to have these?\"", next:"q100"},
            {label: "q100", npc: "\"As a reward, here's a tasty cooked fish!\"", next:"q101"},
            {label: "q101", scene: "She hands you a delicious smoked trout, wrapped in paper", next:"query4", giveItem: "cooked speckled trout"},
            {label: "shop0", npc: "\"Let me show you. I've got ", next:"shophub0"},
            {label: "shop1", npc: "\"I'm looking for fresh fish, if you have any.\"", next:"shophub1"},
            {label: "shop7", npc: "\"Alright then.\"", next:"query4"},//if they didn't buy anything
            {label: "shop8", npc: "\"Great! Well I appreciate your business.\"", next:"query4"},//if the bought something
            {label: "shop9", npc: "\"I've got nothing left for you to buy, but you can still sell me things.\"", next:"query4"},//no stock left
            {label: "buy0", npc: "\"Interested in the #item#? #cost#.\"", replies: [
                {m: "decline", next: "buy5"}
            ]}, //describe item for buy
            {label: "buy1", npc: "\"Here you go!\"", next:"buy2"}, //on buy item
            {label: "buy2", scene: "You pay #costall# and she hands you the #item#", next:"buy6"},
            {label: "buy3", scene: "You don't have enough to buy this", next:"shophub0"}, //on buy item
            {label: "buy5", npc: "\"Well think about it, ok?\"", next:"shophub0"},//on decline
            {label: "buy6", npc: "\"Interested in anything else?\"", next:"shophub0"},
            {label: "buy9", npc: "\"Well look at that, you've bought all my stock. Thank you!\"", next:"shop9"},
            {label: "sell0", npc: "\"I'll buy that for #price#.\"", replies:[
                {m: "decline", next: "sell5"}
            ]}, //offer item to sell
            {label: "sell1", npc: "\"Great! Here's your money.\"", next:"sell2"}, //on sell item
            {label: "sell2", npc: "The merchant gives you #priceall# and takes your #item#", next:"shophub1"},
            {label: "sell3", scene: "You don't have any items in your backpack.", next: "query4"},
            {label: "sell4", npc: "\"I don't have any gold left to buy things.\"", next: "query4"},
            {label: "sell5", npc: "\"Suit yourself. Any other items for me?.\"", next: "shophub1"},
            {label: "shophub0", replies:[]},
            {label: "shophub1", replies:[]},
            {label: "bye0", npc: "\"See you later!\"", next: "end"}
        ]
    }
}
//Monsters

