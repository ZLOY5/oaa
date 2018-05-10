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
	"item_magic_wand",
	"item_null_talisman",
	"item_wraith_band",
	"item_poor_mans_shield",
	"item_bracer",
	"item_soul_ring",
	"item_phase_boots",
	"item_power_treads",
	"item_arcane_boots",
	"item_guardian_greaves",
	"item_tranquil_boots",
	"item_travel_boots",
	"item_farming_core",
}

schema.Home.Tier1[2] = {
	"item_iron_talon",
	"item_hand_of_midas_1",
	"item_vladmir",
	"item_pipe",
	"item_ring_of_aquila",
	"item_mekansm",
	"item_ancient_janggo",
	"item_force_staff",
}

schema.Home.Tier1[3] = {
	"item_glimmer_cape",
	"item_veil_of_discord",
	"item_far_sight",
	"item_aether_lens",
	"item_necronomicon",
	"item_dagon",
	"item_cyclone",
	"item_solar_crest",
	"item_rod_of_atos",
	"item_ultimate_scepter",
	"item_refresher",
	"item_sheepstick",
	"item_octarine_core",
}

schema.Home.Tier1[4] = {
	"item_blade_mail",
	"item_crimson_guard",
	"item_black_king_bar_1",
	"item_aeon_disk",
	"item_lotus_orb",
	"item_shivas_guard",
	"item_bloodstone_1",
	--"item_manta_1",
	"item_sphere",
	"item_hurricane_pike",
	"item_assault",
	"item_heart",
	"item_spirit_vessel"
}

schema.Home.Tier1[5] = {
	"item_armlet",
	"item_meteor_hammer_1",
	"item_bfury",
	"item_ethereal_blade",
	"item_silver_edge",
	"item_radiance",
	"item_monkey_king_bar",
	"item_greater_crit",
	"item_butterfly",
	"item_rapier",
	"item_abyssal_blade",
	"item_bloodthorn",
}

schema.Home.Tier1[6] = {
	"item_mask_of_madness",
	"item_helm_of_the_dominator",
	"item_dragon_lance",
	"item_echo_sabre",
	"item_diffusal_blade",
	"item_desolator",
	"item_heavens_halberd",
	"item_sange_and_yasha",
	"item_skadi",
	"item_mjollnir",
	"item_satanic",
	"item_kaya"
}

-----------------------------------------------------------------

schema.Home.Tier2[1] = {
	"item_magic_wand_2",
	"item_greater_phase_boots",
	"item_greater_power_treads",
	"item_greater_arcane_boots",
	"item_greater_guardian_greaves",
	"item_greater_tranquil_boots",
	"item_greater_travel_boots",
}

schema.Home.Tier2[2] = {
	"item_hand_of_midas_2",
	"item_vladmir_2",
	"item_pipe_2",
	"item_ring_of_aquila_2",
	"item_mekansm_2",
	"item_ancient_janggo_2",
	"item_force_staff_2",
	"item_pull_staff",
	"item_shroud",
}

schema.Home.Tier2[3] = {
	"item_glimmer_cape_2",
	"item_veil_of_discord_2",
	"item_far_sight",
	"item_aether_lens_2",
	"item_necronomicon_2",
	"item_dagon_6",
	"item_cyclone_2",
	"item_allied_cyclone",
	"item_solar_crest_2",
	"item_rod_of_atos_2",
	"item_ultimate_scepter_2",
	"item_refresher_2",
	"item_sheepstick_2",
	"item_octarine_core_2",
}

schema.Home.Tier2[4] = {
	"item_blade_mail_2",
	"item_crimson_guard_2",
	"item_black_king_bar_2",
	"item_aeon_disk_2",
	"item_lotus_orb_2",
	"item_shivas_guard_2",
	"item_bloodstone_2",
	--"item_manta_1",
	"item_sphere_2",
	"item_hurricane_pike_2",
	"item_assault_2",
	"item_heart_2",
	"item_spirit_vessel_2"
}

schema.Home.Tier2[5] = {
	"item_armlet_2",
	"item_meteor_hammer_2",
	"item_bfury_2",
	"item_ethereal_blade_2",
	"item_silver_edge_2",
	"item_radiance_2",
	"item_monkey_king_bar_2",
	"item_greater_crit_2",
	"item_butterfly_2",
	"item_abyssal_blade_2",
	"item_bloodthorn_2",
	"item_charge_bkb",
	"item_martyrs_mail"
}

schema.Home.Tier2[6] = {
	"item_mask_of_madness_2",
	"item_helm_of_the_dominator_2",
	"item_dragon_lance_2",
	"item_echo_sabre_2",
	"item_diffusal_blade_2",
	"item_desolator_2",
	"item_heavens_halberd_2",
	"item_sange_and_yasha_2",
	"item_skadi_2",
	"item_mjollnir_2",
	"item_satanic_2",
	"item_kaya_2"
}

-----------------------------------------------------------------

schema.Home.Tier3[1] = {
	"item_magic_wand_3",
	"item_greater_phase_boots_2",
	"item_greater_power_treads_2",
	"item_greater_arcane_boots_2",
	"item_greater_guardian_greaves_2",
	"item_greater_tranquil_boots_2",
	"item_greater_travel_boots_2",
	"item_reduction_orb_1",
	"item_enrage_crystal_1",
	"item_regen_crystal_1"
}

schema.Home.Tier3[2] = {
	"item_hand_of_midas_3",
	"item_vladmir_3",
	"item_pipe_3",
	"item_ring_of_aquila_3",
	"item_mekansm_3",
	"item_ancient_janggo_3",
	"item_force_staff_3",
	"item_pull_staff_2",
	"item_shroud_2",
	"item_reflection_shard_1",
	"item_dispel_orb_1"
}

schema.Home.Tier3[3] = {
	"item_glimmer_cape_3",
	"item_veil_of_discord_3",
	"item_far_sight_2",
	"item_aether_lens_3",
	"item_necronomicon_3",
	"item_dagon_7",
	"item_cyclone_3",
	"item_allied_cyclone_2",
	"item_solar_crest_3",
	"item_rod_of_atos_3",
	"item_ultimate_scepter_3",
	"item_refresher_3",
	"item_sheepstick_3",
	"item_octarine_core_3",
	"item_satanic_core"
}

schema.Home.Tier3[4] = {
	"item_blade_mail_3",
	"item_crimson_guard_3",
	"item_black_king_bar_3",
	"item_aeon_disk_3",
	"item_lotus_orb_3",
	"item_shivas_guard_3",
	"item_bloodstone_3",
	--"item_manta_1",
	"item_sphere_3",
	"item_hurricane_pike_3",
	"item_assault_3",
	"item_heart_3",
	"item_spirit_vessel_3"
}

schema.Home.Tier3[5] = {
	"item_armlet_3",
	"item_meteor_hammer_3",
	"item_bfury_3",
	"item_ethereal_blade_3",
	"item_silver_edge_3",
	"item_radiance_3",
	"item_monkey_king_bar_3",
	"item_greater_crit_3",
	"item_butterfly_3",
	"item_abyssal_blade_3",
	"item_bloodthorn_3",
	"item_charge_bkb_2",
	"item_lucience",
	"item_martyrs_mail_2"
}

schema.Home.Tier3[6] = {
	"item_mask_of_madness_3",
	"item_helm_of_the_dominator_3",
	"item_dragon_lance_3",
	"item_echo_sabre_3",
	"item_diffusal_blade_3",
	"item_desolator_3",
	"item_heavens_halberd_3",
	"item_sange_and_yasha_3",
	"item_skadi_3",
	"item_mjollnir_3",
	"item_satanic_3",
	"item_kaya_3"
}

-----------------------------------------------------------------

schema.Home.Tier4[1] = { 
	"item_magic_wand_4",
	"item_greater_phase_boots_3",
	"item_greater_power_treads_3",
	"item_greater_arcane_boots_3",
	"item_greater_guardian_greaves_3",
	"item_greater_tranquil_boots_3",
	"item_greater_travel_boots_3",
	"item_reduction_orb_2",
	"item_enrage_crystal_2",
	"item_regen_crystal_2"
}

schema.Home.Tier4[2] = {
	"item_vladmir_4",
	"item_pipe_4",
	"item_mekansm_4",
	"item_ancient_janggo_4",
	"item_force_staff_4",
	"item_pull_staff_3",
	"item_shroud_3",
	"item_reflection_shard_2",
	"item_dispel_orb_2"
}

schema.Home.Tier4[3] = {
	"item_glimmer_cape_4",
	"item_veil_of_discord_4",
	"item_far_sight_3",
	"item_aether_lens_4",
	"item_necronomicon_4",
	"item_dagon_8",
	"item_cyclone_4",
	"item_allied_cyclone_3",
	"item_solar_crest_4",
	"item_rod_of_atos_4",
	"item_ultimate_scepter_4",
	"item_refresher_4",
	"item_sheepstick_4",
	"item_octarine_core_4",
	"item_satanic_core_2"
}

schema.Home.Tier4[4] = {
	"item_blade_mail_4",
	"item_crimson_guard_4",
	"item_black_king_bar_4",
	"item_aeon_disk_4",
	"item_lotus_orb_4",
	"item_bubble_orb_1",
	"item_shivas_guard_4",
	"item_bloodstone_4",
	--"item_manta_1",
	"item_sphere_4",
	"item_hurricane_pike_4",
	"item_assault_4",
	"item_heart_4",
	"item_heart_transplant",
	"item_stoneskin",
	"item_spirit_vessel_4"
}

schema.Home.Tier4[5] = {
	"item_armlet_4",
	"item_meteor_hammer_4",
	"item_bfury_4",
	"item_ethereal_blade_4",
	"item_silver_edge_4",
	"item_radiance_4",
	"item_monkey_king_bar_4",
	"item_greater_crit_4",
	"item_butterfly_4",
	"item_abyssal_blade_4",
	"item_bloodthorn_4",
	"item_charge_bkb_3",
	"item_lucience_2",
	"item_martyrs_mail_3"
}

schema.Home.Tier4[6] = {
	"item_mask_of_madness_4",
	"item_helm_of_the_dominator_4",
	"item_dragon_lance_4",
	"item_echo_sabre_4",
	"item_diffusal_blade_4",
	"item_desolator_4",
	"item_heavens_halberd_4",
	"item_sange_and_yasha_4",
	"item_skadi_4",
	"item_mjollnir_4",
	"item_satanic_4",
	"item_trumps_fists",
	"item_giant_form",
	"item_dagger_of_moriah",
	"item_kaya_4"

}

-----------------------------------------------------------------

schema.Home.Tier5[1] = {
	"item_magic_wand_5",
	"item_greater_phase_boots_4",
	"item_greater_power_treads_4",
	"item_greater_arcane_boots_4",
	"item_greater_guardian_greaves_4",
	"item_greater_tranquil_boots_4",
	"item_greater_travel_boots_4",
	"item_reduction_orb_3",
	"item_enrage_crystal_3",
	"item_regen_crystal_3"
}

schema.Home.Tier5[2] = {
	"item_vladmir_5",
	"item_pipe_5",
	"item_mekansm_5",
	"item_ancient_janggo_5",
	"item_force_staff_5",
	"item_pull_staff_4",
	"item_shroud_4",
	"item_reflection_shard_3",
	"item_dispel_orb_3"
}

schema.Home.Tier5[3] = {
	"item_glimmer_cape_5",
	"item_veil_of_discord_5",
	"item_far_sight_4",
	"item_aether_lens_5",
	"item_necronomicon_5",
	"item_dagon_9",
	"item_cyclone_5",
	"item_allied_cyclone_4",
	"item_solar_crest_5",
	"item_rod_of_atos_5",
	"item_ultimate_scepter_5",
	"item_refresher_5",
	"item_sheepstick_5",
	"item_octarine_core_5",
	"item_satanic_core_3"
}

schema.Home.Tier5[4] = {
	"item_blade_mail_5",
	"item_crimson_guard_5",
	"item_black_king_bar_5",
	"item_aeon_disk_5",
	"item_lotus_orb_5",
	"item_bubble_orb_2",
	"item_shivas_guard_5",
	"item_bloodstone_5",
	--"item_manta_1",
	"item_sphere_5",
	"item_hurricane_pike_5",
	"item_assault_5",
	"item_heart_5",
	"item_heart_transplant_2",
	"item_stoneskin_2",
	"item_spirit_vessel_5"
}

schema.Home.Tier5[5] = {
	"item_armlet_5",
	"item_meteor_hammer_5",
	"item_bfury_5",
	"item_ethereal_blade_5",
	"item_silver_edge_5",
	"item_radiance_5",
	"item_monkey_king_bar_5",
	"item_greater_crit_5",
	"item_butterfly_5",
	"item_abyssal_blade_5",
	"item_bloodthorn_5",
	"item_charge_bkb_4",
	"item_lucience_3",
	"item_martyrs_mail_4"
}

schema.Home.Tier5[6] = {
	"item_mask_of_madness_5",
	"item_helm_of_the_dominator_5",
	"item_dragon_lance_5",
	"item_echo_sabre_5",
	"item_diffusal_blade_5",
	"item_desolator_5",
	"item_heavens_halberd_5",
	"item_sange_and_yasha_5",
	"item_skadi_5",
	"item_mjollnir_5",
	"item_satanic_5",
	"item_trumps_fists_2",
	"item_giant_form_2",
	"item_dagger_of_moriah_2",
	"item_kaya_5"
}

-----------------------------------------------------------------

schema.Side.First[1] = { --first column of first page of side shop
	"item_ward_sentry",
	"item_dust"
}

-----------------------------------------------------------------

return schema