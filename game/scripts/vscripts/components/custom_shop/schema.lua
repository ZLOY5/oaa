local schema = {}

schema.Home = {}  --Home shop
schema.Side = {}  --side shop
--schema.Secret = {}

schema.Home.Basic = {} -- basic page of Home shop
schema.Home.Tier1 = {} -- tier 1 page
schema.Home.Tier2 = {} 
schema.Home.Tier3 = {}
schema.Home.Tier4 = {}
schema.Home.Tier5 = {}

schema.Side.First = {}

----------------------------------------------------------------------

schema.Home.Basic[1] = { --first column of basic page of Home shop
	"item_clarity",
	"item_faerie_fire",
	"item_enchanted_mango",
	"item_tango",
	"item_flask",
	"item_smoke_of_deceit",
	"item_gem",
	"item_dust",
	"item_ward_observer",
	"item_ward_sentry",
	--"item_reflex_core",
	"item_upgrade_core",
	"item_upgrade_core_3"
}

schema.Home.Basic[2] = { --second column of basic page 
	"item_branches",
	"item_gauntlets",
	"item_slippers",
	"item_mantle",
	"item_circlet",
	"item_belt_of_strength",
	"item_boots_of_elves",
	"item_robe",
	"item_ogre_axe",
	"item_blade_of_alacrity",
	"item_staff_of_wizardry",
	"item_ring_of_basilius",
	"item_upgrade_core_2",
	"item_upgrade_core_4"
}

schema.Home.Basic[3] = { --third column
	"item_ring_of_protection",
	"item_stout_shield",
	"item_quelling_blade",
	"item_infused_raindrop",
	"item_blight_stone",
	"item_orb_of_venom",
	"item_blades_of_attack",
	"item_chainmail",
	"item_quarterstaff",
	"item_helm_of_iron_will",
	"item_broadsword",
	"item_claymore",
	"item_javelin",
	"item_mithril_hammer"
}

schema.Home.Basic[4] = { --fourth column 
	"item_wind_lace",
	"item_magic_stick",
	"item_sobi_mask",
	"item_ring_of_regen",
	"item_boots",
	"item_gloves",
	"item_cloak",
	"item_ring_of_health",
	"item_void_stone",
	"item_lifesteal",
	"item_shadow_amulet",
	"item_ghost",
	"item_blink"
}

schema.Home.Basic[5] = { --fifth column
	"item_energy_booster",
	"item_vitality_booster",
	"item_point_booster",
	"item_platemail",
	"item_talisman_of_evasion",
	"item_hyperstone",
	"item_ultimate_orb",
	"item_demon_edge",
	"item_mystic_staff",
	"item_reaver",
	"item_eagle",
	"item_relic",
	"item_core_info"
}

-----------------------------------------------------------------

schema.Home.Tier1[1] = { --first column of tier 1 page of Home shop
	
}

-----------------------------------------------------------------

schema.Side.First[1] = { --first column of first page of side shop
	"item_ward_sentry",
    "item_dust"
}

-----------------------------------------------------------------

return schema