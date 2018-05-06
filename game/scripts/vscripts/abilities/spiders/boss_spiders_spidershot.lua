LinkLuaModifier("modifier_generic_projectile", "modifiers/modifier_generic_projectile.lua", LUA_MODIFIER_MOTION_NONE)
LinkLuaModifier("modifier_boss_spiders_spiderball_slow", "abilities/spiders/boss_spiders_spidershot.lua", LUA_MODIFIER_MOTION_NONE)
LinkLuaModifier("modifier_boss_spiders_spiderball_skip_death_animation", "abilities/spiders/boss_spiders_spidershot.lua", LUA_MODIFIER_MOTION_NONE)

------------------------------------------------------------------------------------

boss_spiders_spidershot = class(AbilityBaseClass)

------------------------------------------------------------------------------------

function boss_spiders_spidershot:GetCastAnimation()
	return ACT_DOTA_CAST_ABILITY_4
end

------------------------------------------------------------------------------------

function boss_spiders_spidershot:OnSpellStart(keys)
	local caster = self:GetCaster()
	-- local target = GetGroundPosition(self:GetCursorPosition(), caster)

	if self.target_points then
		caster:EmitSound("hero_ursa.attack")

		for k,target in pairs(self.target_points) do
			local indicator = ParticleManager:CreateParticle("particles/ui_mouseactions/range_finder_generic_wardspot_model.vpcf", PATTACH_CUSTOMORIGIN, caster)
			ParticleManager:SetParticleControl(indicator, 2, target)

			local origin = caster:GetAttachmentOrigin(caster:ScriptLookupAttachment("attach_hitloc")) + (caster:GetForwardVector() * 30)

			local ball = CreateUnitByName("npc_dota_boss_spiders_spiderball", origin, false, caster, caster, caster:GetTeamNumber())
			ball:AddNewModifier(caster, self, "modifier_boss_spiders_spiderball_skip_death_animation", {})

			local projectileModifier = ball:AddNewModifier(caster, self, "modifier_generic_projectile", {})
			local projectileTable = {
				onLandedCallback = function ()
					local smoke = ParticleManager:CreateParticle("particles/units/heroes/hero_techies/techies_blast_off_fire_smallmoketrail.vpcf", PATTACH_POINT, ball)
					ParticleManager:ReleaseParticleIndex(smoke)

					ParticleManager:DestroyParticle(indicator, true)

					Timers:CreateTimer(self:GetSpecialValueFor("explode_time"), function ()
						if IsValidEntity(ball) and ball:IsAlive() then
							EmitSoundOnLocationWithCaster(ball:GetAbsOrigin(), "Hero_Techies.Suicide", caster)

							local explosion = ParticleManager:CreateParticle("particles/econ/items/techies/techies_arcana/techies_suicide_arcana.vpcf", PATTACH_CUSTOMORIGIN, caster)
							ParticleManager:SetParticleControl(explosion, 0, ball:GetAbsOrigin())
							ParticleManager:SetParticleControl(explosion, 3, ball:GetAbsOrigin())
							ParticleManager:ReleaseParticleIndex(explosion)

							for i=1,self:GetSpecialValueFor("spiders_count") do
								PrecacheUnitByNameAsync("npc_dota_boss_spiders_spider", function (  )
									local spider = CreateUnitByName("npc_dota_boss_spiders_spider", target + RandomVector(32), true, caster, caster, caster:GetTeamNumber())
									local spawn = ParticleManager:CreateParticle("particles/units/heroes/hero_broodmother/broodmother_spiderlings_spawn_b_lv.vpcf", PATTACH_POINT, spider)
									ParticleManager:ReleaseParticleIndex(spawn)
								end, 0)
							end

							UTIL_Remove(ball)
						end
					end)
				end,
				onUnitHitCallback = function (v)
					v:AddNewModifier(caster, self, "modifier_boss_spiders_spiderball_slow", { duration = self:GetSpecialValueFor("impact_slow_duration") })

					local damageTable = {
						victim = v,
						attacker = caster,
						damage = self:GetSpecialValueFor("impact_damage"),
						damage_type = self:GetAbilityDamageType(),
						ability = self
					}
					ApplyDamage(damageTable)

					local impact = ParticleManager:CreateParticle("particles/econ/items/shadow_fiend/sf_fire_arcana/sf_fire_arcana_base_attack_impact.vpcf", PATTACH_POINT, v)
					ParticleManager:SetParticleControlEnt(impact, 1, v, PATTACH_POINT, "attach_hitloc", v:GetAbsOrigin(), true)
					ParticleManager:ReleaseParticleIndex(impact)

					EmitSoundOn("Hero_Broodmother.SpawnSpiderlingsImpact", v)
				end,
				onDiedCallback = function ()
					ParticleManager:DestroyParticle(indicator, true)
					UTIL_Remove(ball)
				end,
				hitRadius = 128,
				speed = self:GetSpecialValueFor("projectile_speed"),
				origin = origin,
				target = target,
				height = self:GetSpecialValueFor("projectile_height"),
				selectable = true,
				noInvul = true
			}
			projectileModifier:InitProjectile(projectileTable)
		end

		self.target_points = nil
	end
end

------------------------------------------------------------------------------------

modifier_boss_spiders_spiderball_slow = class(ModifierBaseClass)

------------------------------------------------------------------------------------

function modifier_boss_spiders_spiderball_slow:IsDebuff()
	return true
end

------------------------------------------------------------------------------------

function modifier_boss_spiders_spiderball_slow:DeclareFunctions()
	local funcs =
	{
		MODIFIER_PROPERTY_MOVESPEED_BONUS_PERCENTAGE,
	}

	return funcs
end

------------------------------------------------------------------------------------

function modifier_boss_spiders_spiderball_slow:GetModifierMoveSpeedBonus_Percentage()
	return self:GetAbility():GetSpecialValueFor("impact_slow_rate")
end

------------------------------------------------------------------------------------

modifier_boss_spiders_spiderball_skip_death_animation = class(ModifierBaseClass)

------------------------------------------------------------------------------------

function modifier_boss_spiders_spiderball_skip_death_animation:IsPurgable()
    return false
end

------------------------------------------------------------------------------------

function modifier_boss_spiders_spiderball_skip_death_animation:IsHidden()
    return true
end

------------------------------------------------------------------------------------

function modifier_boss_spiders_spiderball_skip_death_animation:DeclareFunctions()
    local funcs =
    {
        MODIFIER_EVENT_ON_DEATH,
    }

    return funcs
end

------------------------------------------------------------------------------------

function modifier_boss_spiders_spiderball_skip_death_animation:OnDeath(keys)
    if IsServer() then
        local caster = self:GetParent()
        if keys.unit:entindex() == caster:entindex() then
            UTIL_Remove(caster)
        end
    end
end